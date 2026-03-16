const normalizeEmail = require("../utils/normalizeEmail");
const normalizeString = require("../utils/normalizeString");
const isValidEmail = require("../utils/isValidEmail");
const { createHttpError } = require("./auth.helpers");

function validateRegisterInput({ name, email, password }) {
  const normalizedName = normalizeString(name);
  const normalizedEmail = normalizeEmail(email);
  const rawPassword = typeof password === "string" ? password : "";

  if (!normalizedName) {
    throw createHttpError(400, "Name is required");
  }

  if (!normalizedEmail) {
    throw createHttpError(400, "Email is required");
  }

  if (!isValidEmail(normalizedEmail)) {
    throw createHttpError(400, "Email is invalid");
  }

  if (!rawPassword.trim()) {
    throw createHttpError(400, "Password is required");
  }

  if (rawPassword.length < 8) {
    throw createHttpError(400, "Password must be at least 8 characters long");
  }

  return {
    normalizedName,
    normalizedEmail,
    rawPassword,
  };
}

function validateLoginInput({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const rawPassword = typeof password === "string" ? password : "";

  if (!normalizedEmail) {
    throw createHttpError(400, "Email is required");
  }

  if (!rawPassword.trim()) {
    throw createHttpError(400, "Password is required");
  }

  return {
    normalizedEmail,
    rawPassword,
  };
}

function validateGoogleLoginInput({ code }) {
  const normalizedCode = normalizeString(code);

  if (!normalizedCode) {
    throw createHttpError(400, "Google authorization code is required");
  }

  return {
    normalizedCode,
  };
}

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validateGoogleLoginInput,
};
