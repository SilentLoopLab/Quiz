const normalizeEmail = require("./normalizeEmail");
const normalizeString = require("./normalizeString");

const SUPERADMIN_EMAIL = normalizeEmail("superadmin@gmail.com");
const SUPERADMIN_ROLE = "admin";

function isSuperAdminUser(user) {
  if (!user || typeof user !== "object") {
    return false;
  }

  return user.role === SUPERADMIN_ROLE || normalizeEmail(user.email) === SUPERADMIN_EMAIL;
}

function normalizeOptionalString(value, maxLength) {
  const normalizedValue = normalizeString(value);

  if (!maxLength || normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  return normalizedValue.slice(0, maxLength);
}

function normalizeRefreshSession(session) {
  if (!session || typeof session !== "object") {
    return null;
  }

  const id = normalizeOptionalString(session.id);
  const tokenHash = normalizeOptionalString(session.tokenHash);
  const previousTokenHash = normalizeOptionalString(session.previousTokenHash);
  const createdAt = normalizeOptionalString(session.createdAt);
  const lastUsedAt = normalizeOptionalString(session.lastUsedAt);
  const rotatedAt = normalizeOptionalString(session.rotatedAt);
  const expiresAt = normalizeOptionalString(session.expiresAt);

  if (!id || !tokenHash || !createdAt || !expiresAt) {
    return null;
  }

  return {
    id,
    tokenHash,
    previousTokenHash,
    createdAt,
    lastUsedAt,
    rotatedAt,
    expiresAt,
    userAgent: normalizeOptionalString(session.userAgent, 512),
    ip: normalizeOptionalString(session.ip, 128),
  };
}

function normalizeRefreshSessions(refreshSessions) {
  if (!Array.isArray(refreshSessions)) {
    return [];
  }

  return refreshSessions.map(normalizeRefreshSession).filter(Boolean);
}

function normalizeUser(user) {
  if (!user || typeof user !== "object") {
    return user;
  }

  return {
    ...user,
    refreshSessions: normalizeRefreshSessions(user.refreshSessions),
    premium: isSuperAdminUser(user) ? true : user.premium === true,
  };
}

module.exports = {
  normalizeUser,
  isSuperAdminUser,
  SUPERADMIN_EMAIL,
  SUPERADMIN_ROLE,
};
