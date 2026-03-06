const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const sanitizeUser = require("../utils/sanitizeUser");
const { findUserByEmail, findUserById, createUser } = require("./user.service");
const {
  createHttpError,
  buildAuthUser,
  clearExpiredLock,
  resetLoginState,
  recordFailedLoginAttempt,
  INVALID_CREDENTIALS_MESSAGE,
  ACCOUNT_LOCKED_MESSAGE,
} = require("./auth.helpers");
const { validateRegisterInput, validateLoginInput } = require("./auth.validation");

async function registerUser(payload) {
  const { normalizedName, normalizedEmail, rawPassword } = validateRegisterInput(payload);
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw createHttpError(400, "Email already exists");
  }

  const passwordHash = await bcrypt.hash(rawPassword, 10);
  const createdUser = await createUser(
    buildAuthUser({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
      role: "user",
    })
  );

  return {
    user: sanitizeUser(createdUser),
    token: generateToken({ id: createdUser.id, role: createdUser.role }),
  };
}

async function loginUser(payload) {
  const { normalizedEmail, rawPassword } = validateLoginInput(payload);
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw createHttpError(401, INVALID_CREDENTIALS_MESSAGE);
  }

  if (user.isBanned === true) {
    throw createHttpError(403, "Your account has been banned.");
  }

  const account = await clearExpiredLock(user);

  if (!account) {
    throw createHttpError(401, INVALID_CREDENTIALS_MESSAGE);
  }

  if (account.lockUntil && Date.parse(account.lockUntil) > Date.now()) {
    throw createHttpError(403, "Account is temporarily locked. Try again later.");
  }

  const passwordMatches = await bcrypt.compare(rawPassword, account.password);

  if (!passwordMatches) {
    const userAfterFailure = await recordFailedLoginAttempt(account);

    if (userAfterFailure?.lockUntil && Date.parse(userAfterFailure.lockUntil) > Date.now()) {
      throw createHttpError(403, ACCOUNT_LOCKED_MESSAGE);
    }

    throw createHttpError(401, INVALID_CREDENTIALS_MESSAGE);
  }

  const safeLoginUser =
    account.failedLoginAttempts > 0 || account.lockUntil
      ? await resetLoginState(account.id)
      : account;

  return {
    user: sanitizeUser(safeLoginUser),
    token: generateToken({ id: safeLoginUser.id, role: safeLoginUser.role }),
  };
}

async function getCurrentUser(userId) {
  const user = await findUserById(userId);

  if (!user) {
    throw createHttpError(401, "Unauthorized");
  }

  if (user.isBanned === true) {
    throw createHttpError(403, "Your account has been banned.");
  }

  return {
    user: sanitizeUser(user),
  };
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
