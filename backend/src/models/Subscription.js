const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: String,
    required: true,
    enum: ['basic', 'premium']
  },
  providerSubscriptionId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'past_due'],
    required: true,
    default: 'active'
  },
  startsAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  endsAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

subscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);