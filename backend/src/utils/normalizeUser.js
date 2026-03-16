const normalizeEmail = require("./normalizeEmail");

const SUPERADMIN_EMAIL = normalizeEmail("superadmin@gmail.com");
const SUPERADMIN_ROLE = "admin";

function isSuperAdminUser(user) {
  if (!user || typeof user !== "object") {
    return false;
  }

  return user.role === SUPERADMIN_ROLE || normalizeEmail(user.email) === SUPERADMIN_EMAIL;
}

function normalizeUser(user) {
  if (!user || typeof user !== "object") {
    return user;
  }

  return {
    ...user,
    premium: isSuperAdminUser(user) ? true : user.premium === true,
  };
}

module.exports = {
  normalizeUser,
  isSuperAdminUser,
  SUPERADMIN_EMAIL,
  SUPERADMIN_ROLE,
};
