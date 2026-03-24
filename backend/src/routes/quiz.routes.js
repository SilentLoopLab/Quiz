const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const optionalAuthMiddleware = require("../middleware/optionalAuth.middleware");
const quizController = require("../controllers/quiz.controller");

const router = express.Router();

router.get("/home", optionalAuthMiddleware, quizController.home);
router.get("/", optionalAuthMiddleware, quizController.list);
router.post("/", authMiddleware, quizController.create);
router.get("/mine", authMiddleware, quizController.listMine);
router.patch("/:quizId", authMiddleware, quizController.update);
router.delete("/:quizId", authMiddleware, quizController.remove);
router.get("/shared/:shareToken", optionalAuthMiddleware, quizController.getByShareToken);
router.post(
  "/shared/:shareToken/submit",
  optionalAuthMiddleware,
  quizController.submitByShareToken
);
router.get("/:quizId/manage", authMiddleware, quizController.getManage);
router.get("/:quizId/share", authMiddleware, quizController.getShare);
router.post("/:quizId/submit", optionalAuthMiddleware, quizController.submit);
router.get("/:quizId", optionalAuthMiddleware, quizController.getById);

module.exports = router;
