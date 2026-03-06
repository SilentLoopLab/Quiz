const jwt = require("jsonwebtoken");
const getJwtSecret = require("./getJwtSecret");

function generateToken(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
  });
}

module.exports = generateToken;
