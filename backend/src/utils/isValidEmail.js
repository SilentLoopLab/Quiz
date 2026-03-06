const SIMPLE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  if (typeof email !== "string") {
    return false;
  }

  return SIMPLE_EMAIL_REGEX.test(email);
}

module.exports = isValidEmail;
