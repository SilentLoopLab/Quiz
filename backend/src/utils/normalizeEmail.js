const normalizeString = require("./normalizeString");

function normalizeEmail(email) {
  return normalizeString(email).toLowerCase();
}

module.exports = normalizeEmail;
