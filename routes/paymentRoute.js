const express = require("express");
const router = express.Router();
const {
    sendStripeKey,
    sendRazorpayKey,
    captureStripePayment,
    captureRazorpayPayment,
} = require("../controllers/paymentController");
const { isLoggedIn, customRole } = require("../middlewares/userMiddleware");

router.route("/stripekey").post(isLoggedIn, sendStripeKey);
router.route("/razorpaykey").post(isLoggedIn, sendRazorpayKey);

router.route("/stripepayment").post(isLoggedIn, captureStripePayment);
router.route("/razorpaypayment").post(isLoggedIn, captureRazorpayPayment);

module.exports = router;
