const normalizeEmail = require("../utils/normalizeEmail");
const normalizeString = require("../utils/normalizeString");
const isValidEmail = require("../utils/isValidEmail");
const { createHttpError } = require("./auth.helpers");

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

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

function validateProfileUpdateInput({ name, email, image, bio, location, phone }) {
  const normalizedName = normalizeString(name);
  const normalizedEmail = normalizeEmail(email);
  const normalizedImage = normalizeString(image);
  const normalizedBio = normalizeString(bio);
  const normalizedLocation = normalizeString(location);
  const normalizedPhone = normalizeString(phone);

  if (!normalizedName) {
    throw createHttpError(400, "Name is required");
  }

  if (!normalizedEmail) {
    throw createHttpError(400, "Email is required");
  }

  if (!isValidEmail(normalizedEmail)) {
    throw createHttpError(400, "Email is invalid");
  }

  if (normalizedImage.length > 2048) {
    throw createHttpError(400, "Image URL is too long");
  }

  if (normalizedImage && !isValidHttpUrl(normalizedImage)) {
    throw createHttpError(400, "Image URL is invalid");
  }

  if (normalizedBio.length > 280) {
    throw createHttpError(400, "Bio must be 280 characters or fewer");
  }

  if (normalizedLocation.length > 80) {
    throw createHttpError(400, "Location must be 80 characters or fewer");
  }

  if (normalizedPhone.length > 40) {
    throw createHttpError(400, "Phone must be 40 characters or fewer");
  }

  return {
    normalizedName,
    normalizedEmail,
    normalizedImage,
    normalizedBio,
    normalizedLocation,
    normalizedPhone,
  };
}

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validateGoogleLoginInput,
  validateProfileUpdateInput,
};
