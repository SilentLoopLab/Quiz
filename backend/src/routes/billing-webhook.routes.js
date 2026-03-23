const express = require("express");
const billingController = require("../controllers/billing.controller");

const router = express.Router();

router.post("/", billingController.stripeWebhook);

module.exports = router;
