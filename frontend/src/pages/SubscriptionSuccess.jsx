import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './SubscriptionSuccess.css';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // Fetch the latest subscription to confirm it's active
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/subscriptions/status');
      
      if (response.data.hasActiveSubscription) {
        setSubscription(response.data.subscription);
        setLoading(false);
      } else {
        // No active subscription found, redirect back
        setTimeout(() => {
          navigate('/subscription');
        }, 2000);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="subscription-success-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading"></div>
            <p>Verifying your subscription...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="subscription-success-page">
        <div className="container">
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <h1>No Active Subscription Found</h1>
            <p>We couldn't find an active subscription for your account.</p>
            <button onClick={() => navigate('/subscription')} className="btn btn-primary">
              Go to Subscription
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-success-page">
      <div className="container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1>Payment Successful!</h1>
          <p className="success-message">
            Thank you for subscribing to <strong>InterviewBit {subscription.planId.toUpperCase()}</strong>.
          </p>
          <div className="subscription-details">
            <div className="detail-item">
              <span className="label">Plan:</span>
              <span className="value">{subscription.planId.charAt(0).toUpperCase() + subscription.planId.slice(1)}</span>
            </div>
            <div className="detail-item">
              <span className="label">Status:</span>
              <span className="value status-active">Active</span>
            </div>
            <div className="detail-item">
              <span className="label">Valid Until:</span>
              <span className="value">{new Date(subscription.endsAt).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
          <div className="features-list">
            <h3>You now have access to:</h3>
            <ul>
              <li>✓ Company-specific interview questions</li>
              <li>✓ AI-powered mock interviews</li>
              <li>✓ MCQ Practice from Sanfoundry</li>
              <li>✓ Priority support</li>
              <li>✓ Advanced analytics</li>
            </ul>
          </div>
          <div className="success-actions">
            <button onClick={() => navigate('/practice')} className="btn btn-primary">
              Start Practicing
            </button>
            <button onClick={() => navigate('/profile')} className="btn btn-outline">
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
