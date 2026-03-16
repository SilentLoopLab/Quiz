const generateId = require("../utils/generateId");
const { updateUserById } = require("./user.service");

const MAX_FAILED_LOGIN_ATTEMPTS = 3;
const ACCOUNT_LOCK_DURATION_MS = 10 * 60 * 1000;
const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";
const ACCOUNT_LOCKED_MESSAGE = "Account is temporarily locked. Try again later.";

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function nowIso() {
  return new Date().toISOString();
}

function buildAuthUser({
  name,
  email,
  passwordHash = null,
  role = "user",
  authProvider = "local",
  googleId = null,
}) {
  const timestamp = nowIso();

  return {
    id: generateId(),
    name,
    email,
    password: passwordHash,
    authProvider,
    googleId,
    role,
    isBanned: false,
    failedLoginAttempts: 0,
    lockUntil: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

async function resetLoginState(userId) {
  return updateUserById(userId, (user) => ({
    ...user,
    failedLoginAttempts: 0,
    lockUntil: null,
    updatedAt: nowIso(),
  }));
}

async function clearExpiredLock(user) {
  if (!user.lockUntil) {
    return user;
  }

  const lockUntilTime = Date.parse(user.lockUntil);

  if (Number.isNaN(lockUntilTime) || lockUntilTime <= Date.now()) {
    return resetLoginState(user.id);
  }

  return user;
}

async function recordFailedLoginAttempt(user) {
  const attempts = (user.failedLoginAttempts || 0) + 1;
  const lockUntil =
    attempts >= MAX_FAILED_LOGIN_ATTEMPTS
      ? new Date(Date.now() + ACCOUNT_LOCK_DURATION_MS).toISOString()
      : null;

  return updateUserById(user.id, (currentUser) => ({
    ...currentUser,
    failedLoginAttempts: attempts,
    lockUntil,
    updatedAt: nowIso(),
  }));
}

module.exports = {
  createHttpError,
  buildAuthUser,
  clearExpiredLock,
  resetLoginState,
  recordFailedLoginAttempt,
  INVALID_CREDENTIALS_MESSAGE,
  ACCOUNT_LOCKED_MESSAGE,
};
