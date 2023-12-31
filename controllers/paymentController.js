const stripe = require('stripe')(process.env.STRIPE_SECRET);

exports.sendStripeKey=async function(req,res,next){
    res.status(200).json({
        stripekey:process.env.STRIPE_API_KEY
    })
}

exports.captureStripePayment=async function(req,res,next){
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'inr'
    });
    res.status(200).json({
        success:true,
        client_secret:paymentIntent.client_secret
    })
}