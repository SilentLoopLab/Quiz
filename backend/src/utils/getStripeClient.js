const Stripe = require("stripe");
const normalizeString = require("./normalizeString");
const createHttpError = require("./createHttpError");

let stripeClient;
let stripeClientKey = "";

function getStripeSecretKey() {
  const stripeSecretKey = normalizeString(process.env.STRIPE_SECRET_KEY);

  if (!stripeSecretKey) {
    throw createHttpError(500, "Stripe is not configured.");
  }

  return stripeSecretKey;
}

function getStripeWebhookSecret() {
  const stripeWebhookSecret = normalizeString(process.env.STRIPE_WEBHOOK_SECRET);

  if (!stripeWebhookSecret) {
    throw createHttpError(500, "Stripe webhook is not configured.");
  }

  return stripeWebhookSecret;
}

function getStripeClient() {
  const stripeSecretKey = getStripeSecretKey();

  if (!stripeClient || stripeClientKey !== stripeSecretKey) {
    stripeClient = new Stripe(stripeSecretKey);
    stripeClientKey = stripeSecretKey;
  }

  return stripeClient;
}

module.exports = {
  getStripeClient,
  getStripeWebhookSecret,
};
