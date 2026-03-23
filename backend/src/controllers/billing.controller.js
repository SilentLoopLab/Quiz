const {
  createPremiumCheckoutSession,
  confirmPremiumCheckout,
  handleStripeWebhook,
} = require("../services/billing.service");

function handleError(res, error) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  return res.status(statusCode).json({ message });
}

async function createStripeCheckoutSession(req, res) {
  try {
    const result = await createPremiumCheckoutSession(req.auth.id);
    return res.status(201).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function confirmStripeCheckout(req, res) {
  try {
    const result = await confirmPremiumCheckout(req.auth.id, {
      sessionId: req.body?.sessionId,
    });

    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function stripeWebhook(req, res) {
  try {
    const result = await handleStripeWebhook(req.headers["stripe-signature"], req.body);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  createStripeCheckoutSession,
  confirmStripeCheckout,
  stripeWebhook,
};
