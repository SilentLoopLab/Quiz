const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const sanitizeUser = require("../utils/sanitizeUser");
const normalizeEmail = require("../utils/normalizeEmail");
const normalizeString = require("../utils/normalizeString");
const {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserById,
} = require("./user.service");
const {
  createHttpError,
  buildAuthUser,
  clearExpiredLock,
  resetLoginState,
  recordFailedLoginAttempt,
  INVALID_CREDENTIALS_MESSAGE,
  ACCOUNT_LOCKED_MESSAGE,
} = require("./auth.helpers");
const {
  validateRegisterInput,
  validateLoginInput,
  validateGoogleLoginInput,
} = require("./auth.validation");

const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";

function getGoogleClientId() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();

  if (!clientId) {
    throw createHttpError(500, "Google sign-in is not configured.");
  }

  return clientId;
}

function getGoogleClientSecret() {
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientSecret) {
    throw createHttpError(500, "Google sign-in is not configured.");
  }

  return clientSecret;
}

function getGoogleRedirectUri() {
  return (
    process.env.GOOGLE_REDIRECT_URI?.trim() ||
    process.env.FRONTEND_ORIGIN?.trim() ||
    "http://localhost:3000"
  );
}

async function exchangeGoogleCode(code) {
  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      redirect_uri: getGoogleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw createHttpError(401, "Google sign-in failed.");
  }

  const data = await response.json();
  const accessToken = normalizeString(data.access_token);

  if (!accessToken) {
    throw createHttpError(401, "Google sign-in failed.");
  }

  return accessToken;
}

async function fetchGoogleProfile(accessToken) {
  const response = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw createHttpError(401, "Google sign-in failed.");
  }

  const data = await response.json();
  const email = normalizeEmail(data.email);
  const name =
    normalizeString(data.name) ||
    normalizeString(data.given_name) ||
    (email ? email.split("@")[0] : "");
  const googleId = normalizeString(data.sub);

  if (!email || data.email_verified !== true) {
    throw createHttpError(401, "Google account email is not verified.");
  }

  if (!googleId) {
    throw createHttpError(401, "Google sign-in failed.");
  }

  return {
    email,
    googleId,
    name,
  };
}

async function upsertGoogleUser(profile) {
  const existingUser = await findUserByEmail(profile.email);

  if (!existingUser) {
    return createUser(
      buildAuthUser({
        name: profile.name,
        email: profile.email,
        authProvider: "google",
        googleId: profile.googleId,
      })
    );
  }

  if (existingUser.isBanned === true) {
    throw createHttpError(403, "Your account has been banned.");
  }

  return (
    (await updateUserById(existingUser.id, (currentUser) => ({
      ...currentUser,
      name: currentUser.name || profile.name,
      googleId: currentUser.googleId || profile.googleId,
      updatedAt: new Date().toISOString(),
    }))) || existingUser
  );
}

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

  if (!account.password) {
    throw createHttpError(401, INVALID_CREDENTIALS_MESSAGE);
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

async function loginWithGoogleUser(payload) {
  const { normalizedCode } = validateGoogleLoginInput(payload);
  const accessToken = await exchangeGoogleCode(normalizedCode);
  const profile = await fetchGoogleProfile(accessToken);
  const user = await upsertGoogleUser(profile);

  return {
    user: sanitizeUser(user),
    token: generateToken({ id: user.id, role: user.role }),
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
  loginWithGoogleUser,
  getCurrentUser,
};
