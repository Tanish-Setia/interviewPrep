const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { auth } = require('../middlewares/auth');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const PLANS = {
  basic: {
    name: 'Basic Plan',
    price: 0,
    duration: 365, 
    features: [
      'General practice questions',
      'Resume upload & analysis',
      'AI chatbot assistance',
      'Basic profile management'
    ]
  },
  premium: {
    name: 'Premium Plan',
    price: 500,
    duration: 30,
    features: [
      'Everything in Basic',
      'Company-specific questions',
      'AI-powered mock interviews',
      'MCQ Practice from Sanfoundry',
      'Priority support',
      'Advanced analytics'
    ]
  }
};

router.get('/status', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: 'active',
      endsAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    res.json({
      hasActiveSubscription: !!subscription,
      subscription: subscription || null
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/plans', (req, res) => {
  res.json({ plans: PLANS });
});

router.post('/create-checkout', auth, async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId || !PLANS[planId]) {
      return res.status(400).json({ message: 'Invalid plan ID' });
    }

    const plan = PLANS[planId];

    if (plan.price === 0) {
      return res.status(400).json({ message: 'Basic plan is free' });
    }

    const order = await razorpay.orders.create({
      amount: plan.price * 100, 
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        planId: planId,
        userName: req.user.name,
        userEmail: req.user.email
      }
    });

    console.log(' Razorpay order created:', order.id);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      planName: plan.name
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      planId 
    } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    console.log('✅ Payment signature verified');

    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== 'captured') {
      return res.status(400).json({ message: 'Payment not captured' });
    }

    const plan = PLANS[planId];
    
    const startsAt = new Date();
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + plan.duration);

    const subscription = await Subscription.create({
      userId: req.user._id,
      planId: planId,
      providerSubscriptionId: razorpay_payment_id,
      status: 'active',
      startsAt: startsAt,
      endsAt: endsAt
    });

    console.log(' Subscription created:', subscription._id);

    await Payment.create({
      userId: req.user._id,
      amount: payment.amount / 100,
      currency: payment.currency,
      providerId: razorpay_payment_id,
      providerEvent: 'payment.captured',
      status: 'succeeded'
    });

    console.log('✅ Payment recorded');

    res.json({
      message: 'Payment verified and subscription activated',
      subscription
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({ subscriptions });
  } catch (error) {
    console.error('Get subscription history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/cancel', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: 'active',
      endsAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    console.log('Subscription cancelled:', subscription._id);

    res.json({ 
      message: 'Subscription cancelled successfully',
      subscription 
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;