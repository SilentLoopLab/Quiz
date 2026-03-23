const normalizeString = require("../utils/normalizeString");
const createHttpError = require("../utils/createHttpError");

function validateStripeCheckoutConfirmationInput({ sessionId }) {
  const normalizedSessionId = normalizeString(sessionId);

  if (!normalizedSessionId) {
    throw createHttpError(400, "Stripe checkout session id is required");
  }

  return {
    normalizedSessionId,
  };
}

module.exports = {
  validateStripeCheckoutConfirmationInput,
};
