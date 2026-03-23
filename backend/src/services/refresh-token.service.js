const generateToken = require("../utils/generateToken");
const normalizeString = require("../utils/normalizeString");
const {
  createRefreshSessionId,
  createRefreshToken,
  matchesRefreshTokenHash,
  hashRefreshToken,
  verifyRefreshToken,
} = require("../utils/refreshToken");
const { findUserById, updateUserById } = require("./user.service");
const { createHttpError } = require("./auth.helpers");

const DEFAULT_MAX_REFRESH_SESSIONS = 5;
const USER_AGENT_MAX_LENGTH = 512;
const IP_MAX_LENGTH = 128;

function nowIso() {
  return new Date().toISOString();
}

function getMaxRefreshSessions() {
  const maxRefreshSessions = Number.parseInt(
    normalizeString(process.env.REFRESH_TOKEN_MAX_SESSIONS),
    10
  );

  if (Number.isInteger(maxRefreshSessions) && maxRefreshSessions > 0) {
    return maxRefreshSessions;
  }

  return DEFAULT_MAX_REFRESH_SESSIONS;
}

function sanitizeSessionContext(sessionContext = {}) {
  return {
    userAgent: normalizeString(sessionContext.userAgent).slice(0, USER_AGENT_MAX_LENGTH),
    ip: normalizeString(sessionContext.ip).slice(0, IP_MAX_LENGTH),
  };
}

function getSessionTimestamp(session) {
  const candidateTimestamp = session.lastUsedAt || session.rotatedAt || session.createdAt;
  const parsedTimestamp = Date.parse(candidateTimestamp);

  return Number.isNaN(parsedTimestamp) ? 0 : parsedTimestamp;
}

function isRefreshSessionExpired(session, timestampMs = Date.now()) {
  const expiresAt = Date.parse(session?.expiresAt || "");
  return Number.isNaN(expiresAt) || expiresAt <= timestampMs;
}

function pruneExpiredRefreshSessions(refreshSessions, timestampMs = Date.now()) {
  if (!Array.isArray(refreshSessions)) {
    return [];
  }

  return refreshSessions.filter((refreshSession) => !isRefreshSessionExpired(refreshSession, timestampMs));
}

function limitRefreshSessions(refreshSessions) {
  const maxRefreshSessions = getMaxRefreshSessions();

  return [...refreshSessions]
    .sort((leftSession, rightSession) => getSessionTimestamp(rightSession) - getSessionTimestamp(leftSession))
    .slice(0, maxRefreshSessions);
}

function buildRefreshSession({ sessionId, refreshToken, expiresAt, sessionContext, previousSession }) {
  const timestamp = nowIso();
  const { userAgent, ip } = sanitizeSessionContext(sessionContext);

  return {
    id: sessionId,
    tokenHash: hashRefreshToken(refreshToken),
    previousTokenHash: previousSession?.tokenHash || "",
    createdAt: previousSession?.createdAt || timestamp,
    lastUsedAt: timestamp,
    rotatedAt: previousSession ? timestamp : "",
    expiresAt,
    userAgent: userAgent || previousSession?.userAgent || "",
    ip: ip || previousSession?.ip || "",
  };
}

function buildAccessTokenPayload(user) {
  return {
    id: user.id,
    role: user.role,
  };
}

async function issueRefreshSession(userId, sessionContext = {}) {
  const sessionId = createRefreshSessionId();
  const { refreshToken, expiresAt } = createRefreshToken({ userId, sessionId });
  const nextSession = buildRefreshSession({
    sessionId,
    refreshToken,
    expiresAt,
    sessionContext,
  });
  const updatedUser = await updateUserById(userId, (currentUser) => {
    if (currentUser.isBanned === true) {
      throw createHttpError(403, "Your account has been banned.");
    }

    return {
      ...currentUser,
      refreshSessions: limitRefreshSessions([
        ...pruneExpiredRefreshSessions(currentUser.refreshSessions),
        nextSession,
      ]),
      updatedAt: nowIso(),
    };
  });

  if (!updatedUser) {
    throw createHttpError(401, "Unauthorized");
  }

  return {
    user: updatedUser,
    accessToken: generateToken(buildAccessTokenPayload(updatedUser)),
    refreshToken,
    refreshTokenExpiresAt: expiresAt,
  };
}

async function rotateRefreshSession(refreshToken, sessionContext = {}) {
  const normalizedRefreshToken = normalizeString(refreshToken);

  if (!normalizedRefreshToken) {
    throw createHttpError(401, "Unauthorized");
  }

  let payload;

  try {
    payload = verifyRefreshToken(normalizedRefreshToken);
  } catch {
    throw createHttpError(401, "Unauthorized");
  }

  const { refreshToken: nextRefreshToken, expiresAt } = createRefreshToken({
    userId: payload.userId,
    sessionId: payload.sessionId,
  });
  let reuseDetected = false;
  let missingSession = false;
  const updatedUser = await updateUserById(payload.userId, (currentUser) => {
    if (currentUser.isBanned === true) {
      throw createHttpError(403, "Your account has been banned.");
    }

    const activeSessions = pruneExpiredRefreshSessions(currentUser.refreshSessions);
    const currentSession = activeSessions.find((refreshSession) => refreshSession.id === payload.sessionId);

    if (!currentSession) {
      missingSession = true;

      if (activeSessions.length !== currentUser.refreshSessions.length) {
        return {
          ...currentUser,
          refreshSessions: activeSessions,
          updatedAt: nowIso(),
        };
      }

      return currentUser;
    }

    if (matchesRefreshTokenHash(currentSession.previousTokenHash, normalizedRefreshToken)) {
      reuseDetected = true;

      return {
        ...currentUser,
        refreshSessions: [],
        updatedAt: nowIso(),
      };
    }

    if (!matchesRefreshTokenHash(currentSession.tokenHash, normalizedRefreshToken)) {
      reuseDetected = true;

      return {
        ...currentUser,
        refreshSessions: [],
        updatedAt: nowIso(),
      };
    }

    const nextSession = buildRefreshSession({
      sessionId: payload.sessionId,
      refreshToken: nextRefreshToken,
      expiresAt,
      sessionContext,
      previousSession: currentSession,
    });
    const remainingSessions = activeSessions.filter(
      (refreshSession) => refreshSession.id !== payload.sessionId
    );

    return {
      ...currentUser,
      refreshSessions: limitRefreshSessions([...remainingSessions, nextSession]),
      updatedAt: nowIso(),
    };
  });

  if (!updatedUser || missingSession || reuseDetected) {
    throw createHttpError(401, "Unauthorized");
  }

  return {
    user: updatedUser,
    accessToken: generateToken(buildAccessTokenPayload(updatedUser)),
    refreshToken: nextRefreshToken,
    refreshTokenExpiresAt: expiresAt,
  };
}

async function revokeRefreshSession(refreshToken) {
  const normalizedRefreshToken = normalizeString(refreshToken);

  if (!normalizedRefreshToken) {
    return false;
  }

  let payload;

  try {
    payload = verifyRefreshToken(normalizedRefreshToken);
  } catch {
    return false;
  }

  const user = await findUserById(payload.userId);

  if (!user) {
    return false;
  }

  const activeSessions = pruneExpiredRefreshSessions(user.refreshSessions);
  const currentSession = activeSessions.find((refreshSession) => refreshSession.id === payload.sessionId);

  if (!currentSession) {
    if (activeSessions.length !== user.refreshSessions.length) {
      await updateUserById(payload.userId, (currentUser) => ({
        ...currentUser,
        refreshSessions: activeSessions,
        updatedAt: nowIso(),
      }));
    }

    return false;
  }

  const tokenMatchesCurrentSession = matchesRefreshTokenHash(
    currentSession.tokenHash,
    normalizedRefreshToken
  );
  const tokenMatchesPreviousSession = matchesRefreshTokenHash(
    currentSession.previousTokenHash,
    normalizedRefreshToken
  );

  if (!tokenMatchesCurrentSession && !tokenMatchesPreviousSession) {
    return false;
  }

  await updateUserById(payload.userId, (currentUser) => ({
    ...currentUser,
    refreshSessions: pruneExpiredRefreshSessions(currentUser.refreshSessions).filter(
      (refreshSession) => refreshSession.id !== payload.sessionId
    ),
    updatedAt: nowIso(),
  }));

  return true;
}

module.exports = {
  issueRefreshSession,
  rotateRefreshSession,
  revokeRefreshSession,
};
