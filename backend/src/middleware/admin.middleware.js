function adminMiddleware(req, res, next) {
  if (req.auth?.role !== "admin") {
    return res.status(403).json({ message: "Admin access is required." });
  }

  return next();
}

module.exports = adminMiddleware;
