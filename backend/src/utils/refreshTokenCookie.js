const normalizeString = require("./normalizeString");

const DEFAULT_REFRESH_COOKIE_NAME = "refreshToken";
const DEFAULT_REFRESH_COOKIE_PATH = "/api/auth";
const ALLOWED_SAME_SITE_VALUES = new Set(["lax", "strict", "none"]);

function parseBooleanEnv(value, fallbackValue) {
  const normalizedValue = normalizeString(value).toLowerCase();

  if (!normalizedValue) {
    return fallbackValue;
  }

  if (["1", "true", "yes", "on"].includes(normalizedValue)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalizedValue)) {
    return false;
  }

  return fallbackValue;
}

function getRefreshCookieName() {
  return normalizeString(process.env.REFRESH_COOKIE_NAME) || DEFAULT_REFRESH_COOKIE_NAME;
}

function getRefreshCookiePath() {
  return normalizeString(process.env.REFRESH_COOKIE_PATH) || DEFAULT_REFRESH_COOKIE_PATH;
}

function getRefreshCookieDomain() {
  return normalizeString(process.env.REFRESH_COOKIE_DOMAIN);
}

function getRefreshCookieSameSite() {
  const sameSite = normalizeString(process.env.REFRESH_COOKIE_SAME_SITE).toLowerCase();

  if (ALLOWED_SAME_SITE_VALUES.has(sameSite)) {
    return sameSite;
  }

  return "lax";
}

function getRefreshCookieSecure() {
  return parseBooleanEnv(process.env.REFRESH_COOKIE_SECURE, process.env.NODE_ENV === "production");
}

function buildRefreshCookieOptions(expiresAt) {
  const cookieOptions = {
    httpOnly: true,
    secure: getRefreshCookieSecure(),
    sameSite: getRefreshCookieSameSite(),
    path: getRefreshCookiePath(),
  };
  const domain = getRefreshCookieDomain();

  if (domain) {
    cookieOptions.domain = domain;
  }

  if (expiresAt) {
    const expiresDate = new Date(expiresAt);

    if (!Number.isNaN(expiresDate.getTime())) {
      cookieOptions.expires = expiresDate;
    }
  }

  return cookieOptions;
}

function setRefreshTokenCookie(res, refreshToken, expiresAt) {
  res.cookie(getRefreshCookieName(), refreshToken, buildRefreshCookieOptions(expiresAt));
}

function clearRefreshTokenCookie(res) {
  res.clearCookie(getRefreshCookieName(), buildRefreshCookieOptions());
}

function parseCookieHeader(cookieHeader) {
  if (typeof cookieHeader !== "string" || !cookieHeader.trim()) {
    return {};
  }

  return cookieHeader.split(";").reduce((cookies, cookiePart) => {
    const trimmedCookiePart = cookiePart.trim();

    if (!trimmedCookiePart) {
      return cookies;
    }

    const separatorIndex = trimmedCookiePart.indexOf("=");

    if (separatorIndex === -1) {
      return cookies;
    }

    const cookieName = trimmedCookiePart.slice(0, separatorIndex).trim();
    const cookieValue = trimmedCookiePart.slice(separatorIndex + 1).trim();

    if (!cookieName) {
      return cookies;
    }

    try {
      cookies[cookieName] = decodeURIComponent(cookieValue);
    } catch {
      cookies[cookieName] = cookieValue;
    }

    return cookies;
  }, {});
}

function getRefreshTokenFromRequest(req) {
  const cookies = parseCookieHeader(req.headers?.cookie || "");
  return normalizeString(cookies[getRefreshCookieName()]);
}

module.exports = {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
};
