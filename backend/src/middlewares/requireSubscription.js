// backend/src/middlewares/requireSubscription.js
const Subscription = require('../models/Subscription');

async function requireSubscription(req, res, next) {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: 'active',
      endsAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(403).json({
        message: 'Premium subscription required to access this feature',
        requiresSubscription: true
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { requireSubscription };
