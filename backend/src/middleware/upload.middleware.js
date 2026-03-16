const multer = require("multer");
const createHttpError = require("../utils/createHttpError");

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_FILE_COUNT = 10;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: MAX_FILE_COUNT,
  },
  fileFilter(req, file, callback) {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      callback(createHttpError(400, "Only image files are allowed."));
      return;
    }

    callback(null, true);
  },
});

const uploadImagesMiddleware = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: MAX_FILE_COUNT },
]);

module.exports = uploadImagesMiddleware;
