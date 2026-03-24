const normalizeEmail = require("./normalizeEmail");
const normalizeString = require("./normalizeString");

const SUPERADMIN_EMAIL = normalizeEmail("superadmin@gmail.com");
const SUPERADMIN_ROLE = "admin";
const MAX_CHECKOUT_SESSION_IDS = 50;
const MAX_STRIPE_EVENT_IDS = 100;
const ACTIVE_STRIPE_PREMIUM_STATUSES = new Set(["active", "trialing", "past_due", "unpaid"]);

function isSuperAdminUser(user) {
  if (!user || typeof user !== "object") {
    return false;
  }

  return user.role === SUPERADMIN_ROLE || normalizeEmail(user.email) === SUPERADMIN_EMAIL;
}

function isUserPremium(user) {
  if (!user || typeof user !== "object") {
    return false;
  }

  return isSuperAdminUser(user) || hasActivePremiumWindow(user);
}

function parseIsoDate(value) {
  const normalizedValue = normalizeOptionalString(value);

  if (!normalizedValue) {
    return null;
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function addMonths(date, months) {
  const nextDate = new Date(date);
  nextDate.setUTCMonth(nextDate.getUTCMonth() + months);
  return nextDate;
}

function normalizeOptionalString(value, maxLength) {
  const normalizedValue = normalizeString(value);

  if (!maxLength || normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  return normalizedValue.slice(0, maxLength);
}

function normalizeRefreshSession(session) {
  if (!session || typeof session !== "object") {
    return null;
  }

  const id = normalizeOptionalString(session.id);
  const tokenHash = normalizeOptionalString(session.tokenHash);
  const previousTokenHash = normalizeOptionalString(session.previousTokenHash);
  const createdAt = normalizeOptionalString(session.createdAt);
  const lastUsedAt = normalizeOptionalString(session.lastUsedAt);
  const rotatedAt = normalizeOptionalString(session.rotatedAt);
  const expiresAt = normalizeOptionalString(session.expiresAt);

  if (!id || !tokenHash || !createdAt || !expiresAt) {
    return null;
  }

  return {
    id,
    tokenHash,
    previousTokenHash,
    createdAt,
    lastUsedAt,
    rotatedAt,
    expiresAt,
    userAgent: normalizeOptionalString(session.userAgent, 512),
    ip: normalizeOptionalString(session.ip, 128),
  };
}

function normalizeRefreshSessions(refreshSessions) {
  if (!Array.isArray(refreshSessions)) {
    return [];
  }

  return refreshSessions.map(normalizeRefreshSession).filter(Boolean);
}

function normalizeStringArray(values, maxItems, maxLength) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => normalizeOptionalString(value, maxLength))
    .filter(Boolean)
    .slice(-maxItems);
}

function hasAllowedPremiumStatus(user) {
  const stripeSubscriptionStatus = normalizeOptionalString(
    user?.stripeSubscriptionStatus,
    64
  ).toLowerCase();

  if (!stripeSubscriptionStatus) {
    return true;
  }

  return ACTIVE_STRIPE_PREMIUM_STATUSES.has(stripeSubscriptionStatus);
}

function resolvePremiumExpiresAt(user) {
  const explicitPremiumExpiresAt = parseIsoDate(user?.premiumExpiresAt);

  if (explicitPremiumExpiresAt) {
    return explicitPremiumExpiresAt.toISOString();
  }

  if (normalizeOptionalString(user?.premiumPlan, 64) !== "stripe_monthly") {
    return "";
  }

  const premiumStartedAt = parseIsoDate(user?.premiumStartedAt);

  if (!premiumStartedAt) {
    return "";
  }

  return addMonths(premiumStartedAt, 1).toISOString();
}

function hasActivePremiumWindow(user) {
  if (!hasAllowedPremiumStatus(user)) {
    return false;
  }

  const premiumExpiresAt = resolvePremiumExpiresAt(user);

  if (!premiumExpiresAt) {
    return user?.premium === true;
  }

  const expiresAtTimestamp = Date.parse(premiumExpiresAt);

  if (Number.isNaN(expiresAtTimestamp) || expiresAtTimestamp <= Date.now()) {
    return false;
  }

  return true;
}

function normalizeUser(user) {
  if (!user || typeof user !== "object") {
    return user;
  }

  const { premium: _ignoredPremium, ...restUser } = user;
  const premiumExpiresAt = resolvePremiumExpiresAt(user);

  return {
    ...restUser,
    premiumPlan: normalizeOptionalString(user.premiumPlan, 64),
    premiumStartedAt: normalizeOptionalString(user.premiumStartedAt),
    premiumExpiresAt,
    quizCreationBlocked: user.quizCreationBlocked === true,
    quizCreationBlockedAt: normalizeOptionalString(user.quizCreationBlockedAt),
    quizCreationBlockedBy: normalizeOptionalString(user.quizCreationBlockedBy, 80),
    quizCreationBlockReason: normalizeOptionalString(user.quizCreationBlockReason, 280),
    stripeCustomerId: normalizeOptionalString(user.stripeCustomerId, 255),
    stripeSubscriptionId: normalizeOptionalString(user.stripeSubscriptionId, 255),
    stripeSubscriptionStatus: normalizeOptionalString(user.stripeSubscriptionStatus, 64),
    stripeCheckoutSessionIds: normalizeStringArray(
      user.stripeCheckoutSessionIds,
      MAX_CHECKOUT_SESSION_IDS,
      255
    ),
    processedStripeEventIds: normalizeStringArray(
      user.processedStripeEventIds,
      MAX_STRIPE_EVENT_IDS,
      255
    ),
    refreshSessions: normalizeRefreshSessions(user.refreshSessions),
  };
}

module.exports = {
  normalizeUser,
  isSuperAdminUser,
  isUserPremium,
  resolvePremiumExpiresAt,
  SUPERADMIN_EMAIL,
  SUPERADMIN_ROLE,
};
