const express = require('express');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');

const router = express.Router();

router.post('/razorpay', express.json(), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret')
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log('Webhook received:', event);

    switch (event) {
      case 'payment.captured': {
        console.log('💰 Payment captured:', payload.payment.entity.id);
        break;
      }

      case 'payment.failed': {
        console.log('Payment failed:', payload.payment.entity.id);
        
        const paymentEntity = payload.payment.entity;
        const userId = paymentEntity.notes?.userId;

        if (userId) {
          await Payment.create({
            userId: userId,
            amount: paymentEntity.amount / 100,
            currency: paymentEntity.currency,
            providerId: paymentEntity.id,
            providerEvent: event,
            status: 'failed'
          });
        }
        break;
      }

      case 'refund.created': {
        console.log('Refund created:', payload.refund.entity.id);
        
        const refundEntity = payload.refund.entity;
        const paymentId = refundEntity.payment_id;

        await Payment.updateOne(
          { providerId: paymentId },
          { status: 'refunded' }
        );

        await Subscription.updateOne(
          { providerSubscriptionId: paymentId },
          { status: 'cancelled' }
        );
        break;
      }

      default:
        console.log(`Unhandled event: ${event}`);
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;