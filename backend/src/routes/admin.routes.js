const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const adminController = require("../controllers/admin.controller");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.patch(
  "/users/:userId/quiz-creation-access",
  adminController.updateUserQuizCreationAccess
);
router.delete("/quizzes/:quizId", adminController.deleteAnyQuiz);

module.exports = router;
