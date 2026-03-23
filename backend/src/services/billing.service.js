const normalizeString = require("../utils/normalizeString");
const sanitizeUser = require("../utils/sanitizeUser");
const createHttpError = require("../utils/createHttpError");
const { isUserPremium } = require("../utils/normalizeUser");
const { getStripeClient, getStripeWebhookSecret } = require("../utils/getStripeClient");
const { validateStripeCheckoutConfirmationInput } = require("./billing.validation");
const {
  findUserById,
  findUserByStripeCustomerId,
  findUserByStripeSubscriptionId,
  updateUserById,
} = require("./user.service");

const PREMIUM_PRICE_USD_CENTS = 2000;
const PREMIUM_CURRENCY = "usd";
const PREMIUM_PLAN = "stripe_monthly";
const MAX_STORED_CHECKOUT_SESSION_IDS = 50;
const MAX_STORED_STRIPE_EVENT_IDS = 100;
const BLOCKING_STRIPE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due", "unpaid"]);

function nowIso() {
  return new Date().toISOString();
}

function isCompletedPaidCheckoutSession(checkoutSession) {
  const paymentStatus = normalizeString(checkoutSession?.payment_status);

  return (
    normalizeString(checkoutSession?.status) === "complete" &&
    (paymentStatus === "paid" || paymentStatus === "no_payment_required")
  );
}

function getStripeSuccessUrl() {
  return (
    normalizeString(process.env.STRIPE_CHECKOUT_SUCCESS_URL) ||
    `${normalizeString(process.env.FRONTEND_ORIGIN) || "http://localhost:3000"}/billing/success?session_id={CHECKOUT_SESSION_ID}`
  );
}

function getStripeCancelUrl() {
  return (
    normalizeString(process.env.STRIPE_CHECKOUT_CANCEL_URL) ||
    `${normalizeString(process.env.FRONTEND_ORIGIN) || "http://localhost:3000"}/billing/cancel`
  );
}

function toIsoFromUnix(timestampSeconds) {
  if (!Number.isFinite(timestampSeconds) || timestampSeconds <= 0) {
    return "";
  }

  return new Date(timestampSeconds * 1000).toISOString();
}

function appendUniqueString(values, value, maxItems) {
  const normalizedValue = normalizeString(value);
  const normalizedValues = Array.isArray(values)
    ? values.map((currentValue) => normalizeString(currentValue)).filter(Boolean)
    : [];

  if (!normalizedValue) {
    return normalizedValues.slice(-maxItems);
  }

  return [...normalizedValues.filter((currentValue) => currentValue !== normalizedValue), normalizedValue].slice(
    -maxItems
  );
}

function isPremiumAlreadyActive(user) {
  return (
    isUserPremium(user) ||
    BLOCKING_STRIPE_SUBSCRIPTION_STATUSES.has(normalizeString(user.stripeSubscriptionStatus))
  );
}

function extractStripeCustomerId(source) {
  if (!source) {
    return "";
  }

  if (typeof source.customer === "string") {
    return normalizeString(source.customer);
  }

  if (source.customer && typeof source.customer === "object") {
    return normalizeString(source.customer.id);
  }

  return "";
}

async function findBillingUser({ userId, stripeCustomerId, stripeSubscriptionId }) {
  return (
    (await findUserById(userId)) ||
    (await findUserByStripeSubscriptionId(stripeSubscriptionId)) ||
    (await findUserByStripeCustomerId(stripeCustomerId)) ||
    null
  );
}

function buildSubscriptionSnapshot(subscription, checkoutSession = null) {
  const stripeSubscriptionId = normalizeString(subscription?.id);
  const stripeCustomerId =
    extractStripeCustomerId(subscription) || extractStripeCustomerId(checkoutSession);
  const premiumStartedAt =
    toIsoFromUnix(subscription?.current_period_start) || toIsoFromUnix(subscription?.start_date);
  const premiumExpiresAt =
    toIsoFromUnix(subscription?.current_period_end) ||
    (normalizeString(subscription?.status) === "canceled" ? nowIso() : "");

  return {
    userId:
      normalizeString(subscription?.metadata?.userId) ||
      normalizeString(checkoutSession?.metadata?.userId) ||
      normalizeString(checkoutSession?.client_reference_id),
    stripeCustomerId,
    stripeSubscriptionId,
    stripeSubscriptionStatus: normalizeString(subscription?.status),
    premiumStartedAt,
    premiumExpiresAt,
    stripeCheckoutSessionId: normalizeString(checkoutSession?.id),
  };
}

async function resolveStripeSubscription(stripe, checkoutSession) {
  const stripeSubscription = checkoutSession?.subscription;

  if (stripeSubscription && typeof stripeSubscription === "object" && stripeSubscription.id) {
    return stripeSubscription;
  }

  const stripeSubscriptionId =
    typeof stripeSubscription === "string" ? stripeSubscription : normalizeString(checkoutSession?.subscription);

  if (!stripeSubscriptionId) {
    throw createHttpError(400, "Stripe subscription is missing.");
  }

  return stripe.subscriptions.retrieve(stripeSubscriptionId);
}

async function upsertPremiumSubscription(snapshot, options = {}) {
  const billingUser = await findBillingUser(snapshot);

  if (!billingUser) {
    return null;
  }

  const updatedUser = await updateUserById(billingUser.id, (currentUser) => {
    if (
      options.stripeEventId &&
      Array.isArray(currentUser.processedStripeEventIds) &&
      currentUser.processedStripeEventIds.includes(options.stripeEventId)
    ) {
      return currentUser;
    }

    return {
      ...currentUser,
      premiumPlan: PREMIUM_PLAN,
      premiumStartedAt: snapshot.premiumStartedAt || currentUser.premiumStartedAt || "",
      premiumExpiresAt: snapshot.premiumExpiresAt || currentUser.premiumExpiresAt || "",
      stripeCustomerId: snapshot.stripeCustomerId || currentUser.stripeCustomerId || "",
      stripeSubscriptionId: snapshot.stripeSubscriptionId || currentUser.stripeSubscriptionId || "",
      stripeSubscriptionStatus:
        snapshot.stripeSubscriptionStatus || currentUser.stripeSubscriptionStatus || "",
      stripeCheckoutSessionIds: appendUniqueString(
        currentUser.stripeCheckoutSessionIds,
        snapshot.stripeCheckoutSessionId,
        MAX_STORED_CHECKOUT_SESSION_IDS
      ),
      processedStripeEventIds: appendUniqueString(
        currentUser.processedStripeEventIds,
        options.stripeEventId,
        MAX_STORED_STRIPE_EVENT_IDS
      ),
      updatedAt: nowIso(),
    };
  });

  return updatedUser;
}

async function createPremiumCheckoutSession(userId) {
  const user = await findUserById(userId);

  if (!user) {
    throw createHttpError(401, "Unauthorized");
  }

  if (user.isBanned === true) {
    throw createHttpError(403, "Your account has been banned.");
  }

  if (isPremiumAlreadyActive(user)) {
    throw createHttpError(400, "Premium subscription is already active.");
  }

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    success_url: getStripeSuccessUrl(),
    cancel_url: getStripeCancelUrl(),
    client_reference_id: user.id,
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: PREMIUM_CURRENCY,
          unit_amount: PREMIUM_PRICE_USD_CENTS,
          recurring: {
            interval: "month",
          },
          product_data: {
            name: "Quiz Premium Monthly",
            description: "Premium access billed monthly at $20.",
          },
        },
      },
    ],
    metadata: {
      userId: user.id,
      premiumPlan: PREMIUM_PLAN,
    },
    subscription_data: {
      metadata: {
        userId: user.id,
        premiumPlan: PREMIUM_PLAN,
      },
    },
    customer: normalizeString(user.stripeCustomerId) || undefined,
    customer_email: normalizeString(user.stripeCustomerId) ? undefined : user.email,
  });

  if (!session.url) {
    throw createHttpError(500, "Failed to create Stripe checkout session.");
  }

  return {
    url: session.url,
    sessionId: session.id,
  };
}

async function confirmPremiumCheckout(userId, payload) {
  const { normalizedSessionId } = validateStripeCheckoutConfirmationInput(payload);
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(normalizedSessionId, {
    expand: ["subscription"],
  });
  const sessionUserId =
    normalizeString(session?.metadata?.userId) || normalizeString(session?.client_reference_id);

  if (!session || session.mode !== "subscription") {
    throw createHttpError(400, "Stripe checkout session is invalid.");
  }

  if (sessionUserId !== userId) {
    throw createHttpError(403, "This checkout session does not belong to the current user.");
  }

  if (!isCompletedPaidCheckoutSession(session)) {
    throw createHttpError(400, "Payment has not been completed yet.");
  }

  const subscription = await resolveStripeSubscription(stripe, session);
  const updatedUser = await upsertPremiumSubscription(
    buildSubscriptionSnapshot(subscription, session)
  );

  if (!updatedUser) {
    throw createHttpError(404, "User not found.");
  }

  return {
    user: sanitizeUser(updatedUser),
  };
}

async function handleStripeWebhook(signature, rawBody) {
  const stripe = getStripeClient();
  const event = stripe.webhooks.constructEvent(
    rawBody,
    normalizeString(signature),
    getStripeWebhookSecret()
  );

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = await stripe.checkout.sessions.retrieve(event.data.object.id, {
      expand: ["subscription"],
    });

    if (session.mode === "subscription") {
      const subscription = await resolveStripeSubscription(stripe, session);
      await upsertPremiumSubscription(buildSubscriptionSnapshot(subscription, session), {
        stripeEventId: event.id,
      });
    }
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    await upsertPremiumSubscription(buildSubscriptionSnapshot(event.data.object), {
      stripeEventId: event.id,
    });
  }

  return {
    received: true,
  };
}

module.exports = {
  createPremiumCheckoutSession,
  confirmPremiumCheckout,
  handleStripeWebhook,
};
