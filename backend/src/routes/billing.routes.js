const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const billingController = require("../controllers/billing.controller");

const router = express.Router();

router.post("/stripe/checkout-session", authMiddleware, billingController.createStripeCheckoutSession);
router.post("/stripe/confirm", authMiddleware, billingController.confirmStripeCheckout);

module.exports = router;
