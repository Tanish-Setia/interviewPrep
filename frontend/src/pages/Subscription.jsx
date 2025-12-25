import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Subscription.css';

const Subscription = () => {
  const { fetchSubscriptionStatus: refreshAuthSubscription } = useAuth(); // ✅ Get from context
  const [plans, setPlans] = useState({});
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchSubscriptionStatus();
    
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      setPlans(response.data.plans);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setLoading(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await api.get('/subscriptions/status');
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!window.Razorpay) {
      alert('Razorpay SDK failed to load. Please check your internet connection.');
      return;
    }

    setProcessing(true);
    try {
      // Create order
      const orderResponse = await api.post('/subscriptions/create-checkout', { planId });
      const { orderId, amount, currency, keyId, planName } = orderResponse.data;

      // Get user info from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};

      // Razorpay options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'Interview Prep Platform',
        description: planName,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment
            await api.post('/subscriptions/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: planId
            });

            alert('✅ Payment successful! Your subscription is now active.');
            
            // ✅ Refresh subscription in BOTH AuthContext and local state
            await refreshAuthSubscription();
            await fetchSubscriptionStatus();
            
            setProcessing(false);
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('❌ Payment verification failed. Please contact support.');
            setProcessing(false);
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone || ''
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to create order: ' + (error.response?.data?.message || 'Unknown error'));
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="subscription-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading"></div>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveSubscription = subscriptionStatus?.hasActiveSubscription;

  return (
    <div className="subscription-page">
      <div className="container">
        <h1 className="page-title">Subscription Plans</h1>

        {hasActiveSubscription && (
          <div className="subscription-status">
            <div className="status-card active">
              <h3>✓ Active Subscription</h3>
              <p>You have an active Premium subscription. Enjoy all features!</p>
              {subscriptionStatus.subscription && (
                <p className="status-details">
                  Status: {subscriptionStatus.subscription.status} | 
                  {subscriptionStatus.subscription.endsAt && (
                    <> Expires: {new Date(subscriptionStatus.subscription.endsAt).toLocaleDateString()}</>
                  )}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="plans-grid">
          <div className="plan-card">
            <h3>Basic</h3>
            <div className="plan-price">
              ₹0<span>/forever</span>
            </div>
            <ul className="plan-features">
              <li>General practice questions</li>
              <li>Resume upload & analysis</li>
              <li>AI chatbot assistance</li>
              <li>Basic profile management</li>
            </ul>
            <button className="btn btn-outline btn-block" disabled>
              Current Plan
            </button>
          </div>

          <div className={`plan-card ${!hasActiveSubscription ? 'featured' : ''}`}>
            {!hasActiveSubscription && <div className="badge">Recommended</div>}
            <h3>Premium</h3>
            <div className="plan-price">
              ₹{plans.premium?.price || '500'}<span>/month</span>
            </div>
            <ul className="plan-features">
              <li>Everything in Basic</li>
              <li>Company-specific questions</li>
              <li>AI-powered mock interviews</li>
              <li>MCQ Practice from Sanfoundry</li>
              <li>Priority support</li>
              <li>Advanced analytics</li>
            </ul>
            {hasActiveSubscription ? (
              <button className="btn btn-primary btn-block" disabled>
                Current Plan
              </button>
            ) : (
              <button
                onClick={() => handleSubscribe('premium')}
                disabled={processing}
                className="btn btn-primary btn-block"
              >
                {processing ? <span className="loading"></span> : 'Subscribe Now'}
              </button>
            )}
          </div>
        </div>

        <div className="payment-info">
          <p>🔒 Secure payment powered by Razorpay</p>
          <p className="info-text">Your payment information is securely processed. Cancel anytime.</p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;