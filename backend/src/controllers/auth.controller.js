const {
  registerUser,
  loginUser,
  loginWithGoogleUser,
  getCurrentUser,
} = require("../services/auth.service");

function handleError(res, error) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  return res.status(statusCode).json({ message });
}

async function register(req, res) {
  try {
    const result = await registerUser({
      name: req.body?.name,
      email: req.body?.email,
      password: req.body?.password,
    });

    return res.status(201).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function login(req, res) {
  try {
    const result = await loginUser({
      email: req.body?.email,
      password: req.body?.password,
    });

    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function me(req, res) {
  try {
    const result = await getCurrentUser(req.auth.id);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function google(req, res) {
  try {
    const result = await loginWithGoogleUser({
      code: req.body?.code,
    });

    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  register,
  login,
  google,
  me,
};
