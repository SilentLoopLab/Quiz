const bcrypt = require("bcryptjs");
const normalizeEmail = require("../utils/normalizeEmail");
const {
  SUPERADMIN_EMAIL,
  SUPERADMIN_ROLE,
} = require("../utils/normalizeUser");
const { buildAuthUser } = require("./auth.helpers");
const { findUserByEmail, createUser, updateUserById } = require("./user.service");

const SUPERADMIN_NAME = "superadmin";
const SUPERADMIN_PASSWORD = "superadmin";

function isBcryptHash(value) {
  return typeof value === "string" && /^\$2[aby]\$\d{2}\$/.test(value);
}

function shouldFixMetadata(user) {
  if (user.name !== SUPERADMIN_NAME) return true;
  if (normalizeEmail(user.email) !== SUPERADMIN_EMAIL) return true;
  if (user.role !== SUPERADMIN_ROLE) return true;
  if (user.premium !== true) return true;
  if (user.isBanned !== false) return true;
  if (typeof user.createdAt !== "string" || !user.createdAt) return true;
  if (typeof user.updatedAt !== "string" || !user.updatedAt) return true;
  return false;
}

async function createDefaultSuperAdmin() {
  const passwordHash = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);

  return createUser(
    buildAuthUser({
      name: SUPERADMIN_NAME,
      email: SUPERADMIN_EMAIL,
      passwordHash,
      role: SUPERADMIN_ROLE,
    })
  );
}

async function seedSuperAdmin() {
  const existingUser = await findUserByEmail(SUPERADMIN_EMAIL);

  if (!existingUser) {
    return createDefaultSuperAdmin();
  }

  if (!existingUser.id) {
    throw new Error("Superadmin record is invalid: missing id");
  }

  let password = existingUser.password;
  let needsUpdate = shouldFixMetadata(existingUser);

  if (!isBcryptHash(password)) {
    const sourcePassword =
      typeof password === "string" && password.trim() ? password : SUPERADMIN_PASSWORD;
    password = await bcrypt.hash(sourcePassword, 10);
    needsUpdate = true;
  }

  if (!needsUpdate) {
    return existingUser;
  }

  const now = new Date().toISOString();
  const updatedUser = {
    ...existingUser,
    name: SUPERADMIN_NAME,
    email: SUPERADMIN_EMAIL,
    role: SUPERADMIN_ROLE,
    premium: true,
    isBanned: false,
    password,
    createdAt: existingUser.createdAt || now,
    updatedAt: now,
  };

  const savedUser = await updateUserById(existingUser.id, updatedUser);

  if (!savedUser) {
    throw new Error("Failed to update superadmin account");
  }

  return savedUser;
}

module.exports = {
  seedSuperAdmin,
};
