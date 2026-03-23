const {
  registerUser,
  loginUser,
  loginWithGoogleUser,
  getCurrentUser,
  updateCurrentUserProfile,
  refreshAuthenticatedUser,
  logoutAuthenticatedUser,
} = require("../services/auth.service");
const {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
} = require("../utils/refreshTokenCookie");

function handleError(res, error) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  return res.status(statusCode).json({ message });
}

function getSessionContext(req) {
  return {
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  };
}

function sendAuthenticatedResponse(res, statusCode, result) {
  setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenExpiresAt);

  return res.status(statusCode).json({
    user: result.user,
    token: result.token,
  });
}

async function register(req, res) {
  try {
    const result = await registerUser({
      name: req.body?.name,
      email: req.body?.email,
      password: req.body?.password,
    }, getSessionContext(req));

    return sendAuthenticatedResponse(res, 201, result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function login(req, res) {
  try {
    const result = await loginUser({
      email: req.body?.email,
      password: req.body?.password,
    }, getSessionContext(req));

    return sendAuthenticatedResponse(res, 200, result);
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

async function updateMe(req, res) {
  try {
    const result = await updateCurrentUserProfile(req.auth.id, {
      name: req.body?.name,
      email: req.body?.email,
      image: req.body?.image,
      bio: req.body?.bio,
      location: req.body?.location,
      phone: req.body?.phone,
    });

    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function google(req, res) {
  try {
    const result = await loginWithGoogleUser({
      code: req.body?.code,
    }, getSessionContext(req));

    return sendAuthenticatedResponse(res, 200, result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function refresh(req, res) {
  try {
    const result = await refreshAuthenticatedUser(
      getRefreshTokenFromRequest(req),
      getSessionContext(req)
    );

    return sendAuthenticatedResponse(res, 200, result);
  } catch (error) {
    clearRefreshTokenCookie(res);
    return handleError(res, error);
  }
}

async function logout(req, res) {
  try {
    const result = await logoutAuthenticatedUser(getRefreshTokenFromRequest(req));
    clearRefreshTokenCookie(res);
    return res.status(200).json(result);
  } catch (error) {
    clearRefreshTokenCookie(res);
    return handleError(res, error);
  }
}

module.exports = {
  register,
  login,
  google,
  me,
  updateMe,
  refresh,
  logout,
};
