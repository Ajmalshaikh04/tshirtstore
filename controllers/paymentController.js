const BigPromise = require("../middlewares/bigPromise");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.sendStripeKey = BigPromise(async (req, res, next) => {
    res.status(200).json({
        stripeKey: process.env.STRIPE_PUBLIC_KEY
    })
})

exports.captureStripePayment = BigPromise(async (req, res, next) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'inr',

        //meta data
        metadata: {
            integration_check: 'accept_a_payment'
        }
    });

    res.status(200).json({
        success: true,
        amount: req.body.amount,
        client_secret: paymentIntent.client_secret
    })
})

exports.sendRazorpayKey = BigPromise(async (req, res, next) => {
    res.status(200).json({
        stripeKey: process.env.RAZORPAY_API_KEY
    })
})

exports.captureRazorpayPayment = BigPromise(async (req, res, next) => {
    var instance = new Razorpay({
        key_id: process.env.RAZORPAY_API_KEY,
        key_secret: process.env.RAZORPAY_SECRET
    })

    const myOrder = await instance.orders.create({
        amount: req.body.amount,
        currency: "INR",
        // receipt: "receipt#1",
        // notes: {
        //     key1: "value3",
        //     key2: "value2"
        // }
    })
    res.status(200).json({
        success: true,
        amount: req.body.amount,
        order: myOrder
    })
})