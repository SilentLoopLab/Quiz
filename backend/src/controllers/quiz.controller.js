const {
  createQuiz,
  deleteQuiz,
  getQuizHomeFeed,
  listPublicQuizzes,
  listOwnQuizzes,
  getQuizForManage,
  getQuizShareInfo,
  getPlayableQuizById,
  getPlayableQuizByShareToken,
  submitQuizAttempt,
  submitQuizAttemptByShareToken,
  updateQuiz,
} = require("../services/quiz.service");

function handleError(res, error) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  return res.status(statusCode).json({ message });
}

async function create(req, res) {
  try {
    const result = await createQuiz(req.auth.id, req.body);
    return res.status(201).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function update(req, res) {
  try {
    const result = await updateQuiz(req.auth.id, req.params.quizId, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function remove(req, res) {
  try {
    const result = await deleteQuiz(req.authUser, req.params.quizId);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function list(req, res) {
  try {
    const result = await listPublicQuizzes(req.authUser || null, {
      topic: req.query?.topic,
      premium: req.query?.premium,
      page: req.query?.page,
      limit: req.query?.limit,
    });
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function home(req, res) {
  try {
    const result = await getQuizHomeFeed(req.authUser || null);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function listMine(req, res) {
  try {
    const result = await listOwnQuizzes(req.auth.id, req.authUser || null);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function getManage(req, res) {
  try {
    const result = await getQuizForManage(
      req.auth.id,
      req.params.quizId,
      req.authUser || null
    );

    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function getShare(req, res) {
  try {
    const result = await getQuizShareInfo(req.auth.id, req.params.quizId);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function getById(req, res) {
  try {
    const result = await getPlayableQuizById(
      req.params.quizId,
      req.authUser || null
    );

    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function getByShareToken(req, res) {
  try {
    const result = await getPlayableQuizByShareToken(
      req.params.shareToken,
      req.authUser || null
    );

    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function submit(req, res) {
  try {
    const result = await submitQuizAttempt(
      req.params.quizId,
      req.body,
      req.authUser || null
    );

    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function submitByShareToken(req, res) {
  try {
    const result = await submitQuizAttemptByShareToken(
      req.params.shareToken,
      req.body,
      req.authUser || null
    );

    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  create,
  home,
  list,
  listMine,
  remove,
  getManage,
  getShare,
  getById,
  getByShareToken,
  submit,
  submitByShareToken,
  update,
};
