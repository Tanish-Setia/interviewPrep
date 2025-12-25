import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChatbotWidget from '../components/ChatbotWidget';
import './LandingPage.css';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [chatbotOpen, setChatbotOpen] = useState(false);

  const handleFeatureClick = (feature) => {
    switch (feature) {
      case 'ai-chatbot':
        if (isAuthenticated) {
          setChatbotOpen(true);
          
          window.dispatchEvent(new CustomEvent('openChatbot'));
    
          setTimeout(() => {
            const chatbotToggle = document.querySelector('.chatbot-toggle');
            if (chatbotToggle && !chatbotToggle.closest('.chatbot-widget')) {
              chatbotToggle.click();
            }
          }, 100);
        } else {
          navigate('/login');
        }
        break;
      case 'ai-analysis':
        if (isAuthenticated) {
          navigate('/profile');
        } else {
          navigate('/signup');
        }
        break;
      case 'company-questions':
        if (isAuthenticated) {
          navigate('/practice');
        } else {
          navigate('/signup');
        }
        break;
      case 'progress':
        if (isAuthenticated) {
          navigate('/profile');
        } else {
          navigate('/signup');
        }
        break;
      case 'practice':
        if (isAuthenticated) {
          navigate('/practice');
        } else {
          navigate('/signup');
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="landing-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Ace Your Next Interview</h1>
            <p className="hero-subtitle">
              AI-powered interview preparation platform with personalized practice questions,
              resume analysis, and mock interviews tailored to your experience.
            </p>
            <div className="hero-cta">
              {isAuthenticated ? (
                <Link to="/practice" className="btn btn-primary btn-lg">
                  Start Practicing
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-primary btn-lg">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-lg">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose InterviewBit?</h2>
          <div className="features-grid">
            <div 
              className="feature-card clickable" 
              onClick={() => handleFeatureClick('ai-analysis')}
            >
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Analysis</h3>
              <p>Upload your resume and get instant AI analysis with personalized question suggestions based on your experience.</p>
            </div>
            <div 
              className="feature-card clickable" 
              onClick={() => handleFeatureClick('company-questions')}
            >
              <div className="feature-icon">💼</div>
              <h3>Company-Specific Questions</h3>
              <p>Access curated question banks from top tech companies. Practice with real interview questions.</p>
            </div>
            <div 
              className="feature-card clickable" 
              onClick={() => handleFeatureClick('ai-chatbot')}
            >
              <div className="feature-icon">💬</div>
              <h3>AI Chatbot Assistant</h3>
              <p>Get instant help with interview preparation. Ask questions, get tips, and practice mock interviews.</p>
            </div>
            <div 
              className="feature-card clickable" 
              onClick={() => handleFeatureClick('progress')}
            >
              <div className="feature-icon">📊</div>
              <h3>Track Your Progress</h3>
              <p>Monitor your preparation journey with detailed analytics and personalized recommendations.</p>
            </div>
            <div 
              className="feature-card clickable" 
              onClick={() => handleFeatureClick('practice')}
            >
              <div className="feature-icon">🎯</div>
              <h3>Targeted Practice</h3>
              <p>Filter questions by difficulty, topic, or company. Focus on areas that need improvement.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast & Reliable</h3>
              <p>Built with modern technology for a smooth, responsive experience across all devices.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing">
        <div className="container">
          <h2 className="section-title">Simple, Transparent Pricing</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Free</h3>
              <div className="price">₹0<span>/month</span></div>
              <ul className="pricing-features">
                <li>General practice questions</li>
                <li>Resume upload & analysis</li>
                <li>AI chatbot assistance</li>
                <li>Basic profile management</li>
              </ul>
              {!isAuthenticated && (
                <Link to="/signup" className="btn btn-outline btn-block">
                  Get Started
                </Link>
              )}
            </div>
            <div className="pricing-card featured">
              <div className="badge">Popular</div>
              <h3>Premium</h3>
              <div className="price">₹500<span>/month</span></div>
              <ul className="pricing-features">
                <li>Everything in Free</li>
                <li>Company-specific questions</li>
                <li>AI-powered mock interviews</li>
                <li>Priority support</li>
                <li>Advanced analytics</li>
              </ul>
              {isAuthenticated ? (
                <Link to="/subscription" className="btn btn-primary btn-block">
                  Upgrade Now
                </Link>
              ) : (
                <Link to="/signup" className="btn btn-primary btn-block">
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Land Your Dream Job?</h2>
            <p>Join thousands of candidates preparing for their next interview</p>
            {!isAuthenticated && (
              <Link to="/signup" className="btn btn-primary btn-lg">
                Start Your Journey
              </Link>
            )}
          </div>
        </div>
      </section>
      {isAuthenticated && <ChatbotWidget />}
    </div>
  );
};

export default LandingPage;