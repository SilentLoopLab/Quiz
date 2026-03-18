const express = require("express");
const uploadImagesMiddleware = require("../middleware/upload.middleware");
const uploadController = require("../controllers/upload.controller");

const router = express.Router();

router.post("/photos", uploadImagesMiddleware, uploadController.photos);

module.exports = router;
