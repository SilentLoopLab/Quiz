const {
  setUserQuizCreationBlocked,
  adminDeleteQuiz,
} = require("../services/admin.service");

function handleError(res, error) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  return res.status(statusCode).json({ message });
}

async function updateUserQuizCreationAccess(req, res) {
  try {
    const result = await setUserQuizCreationBlocked(
      req.authUser,
      req.params.userId,
      req.body
    );

    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteAnyQuiz(req, res) {
  try {
    const result = await adminDeleteQuiz(req.authUser, req.params.quizId);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  updateUserQuizCreationAccess,
  deleteAnyQuiz,
};
