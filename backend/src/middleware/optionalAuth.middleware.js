const jwt = require("jsonwebtoken");
const { findUserById } = require("../services/user.service");
const sanitizeUser = require("../utils/sanitizeUser");
const getJwtSecret = require("../utils/getJwtSecret");

async function optionalAuthMiddleware(req, res, next) {
  const authorizationHeader = req.headers.authorization || "";

  if (!authorizationHeader) {
    return next();
  }

  if (!authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authorizationHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());

    if (!payload?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const currentUser = await findUserById(payload.id);

    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (currentUser.isBanned === true) {
      return res.status(403).json({ message: "Your account has been banned." });
    }

    req.auth = {
      id: currentUser.id,
      role: currentUser.role,
    };
    req.authUser = currentUser;
    req.currentUser = sanitizeUser(currentUser);

    return next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = optionalAuthMiddleware;
