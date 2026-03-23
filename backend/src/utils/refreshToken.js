const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const generateId = require("./generateId");
const getJwtSecret = require("./getJwtSecret");
const normalizeString = require("./normalizeString");

const REFRESH_TOKEN_TYPE = "refresh";
const DEFAULT_REFRESH_TOKEN_EXPIRES_IN = "30d";

function getRefreshTokenSecret() {
  return normalizeString(process.env.JWT_REFRESH_SECRET) || getJwtSecret();
}

function getRefreshTokenExpiresIn() {
  return normalizeString(process.env.JWT_REFRESH_EXPIRES_IN) || DEFAULT_REFRESH_TOKEN_EXPIRES_IN;
}

function createRefreshSessionId() {
  return generateId();
}

function getRefreshTokenExpiresAt(refreshToken) {
  const payload = jwt.decode(refreshToken);

  if (!payload?.exp) {
    throw new Error("Refresh token expiration is missing");
  }

  return new Date(payload.exp * 1000).toISOString();
}

function createRefreshToken({ userId, sessionId }) {
  const refreshToken = jwt.sign(
    {
      sub: userId,
      sid: sessionId,
      jti: generateId(),
      type: REFRESH_TOKEN_TYPE,
    },
    getRefreshTokenSecret(),
    {
      expiresIn: getRefreshTokenExpiresIn(),
    }
  );

  return {
    refreshToken,
    expiresAt: getRefreshTokenExpiresAt(refreshToken),
  };
}

function verifyRefreshToken(refreshToken) {
  const payload = jwt.verify(normalizeString(refreshToken), getRefreshTokenSecret());

  if (
    payload?.type !== REFRESH_TOKEN_TYPE ||
    typeof payload.sub !== "string" ||
    typeof payload.sid !== "string"
  ) {
    throw new Error("Invalid refresh token payload");
  }

  return {
    userId: payload.sub,
    sessionId: payload.sid,
  };
}

function hashRefreshToken(refreshToken) {
  return crypto
    .createHash("sha256")
    .update(normalizeString(refreshToken))
    .digest("hex");
}

function matchesRefreshTokenHash(tokenHash, refreshToken) {
  const normalizedTokenHash = normalizeString(tokenHash);
  const refreshTokenHash = hashRefreshToken(refreshToken);

  if (!normalizedTokenHash || normalizedTokenHash.length !== refreshTokenHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(normalizedTokenHash, "utf-8"),
    Buffer.from(refreshTokenHash, "utf-8")
  );
}

module.exports = {
  createRefreshSessionId,
  createRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
  matchesRefreshTokenHash,
};
