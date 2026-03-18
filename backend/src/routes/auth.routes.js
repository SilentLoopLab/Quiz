const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.get("/me", authMiddleware, authController.me);
router.patch("/me", authMiddleware, authController.updateMe);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.google);

module.exports = router;
