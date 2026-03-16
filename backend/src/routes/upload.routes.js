const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const uploadImagesMiddleware = require("../middleware/upload.middleware");
const uploadController = require("../controllers/upload.controller");

const router = express.Router();

router.post("/images", authMiddleware, uploadImagesMiddleware, uploadController.images);

module.exports = router;
