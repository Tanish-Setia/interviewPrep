import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>InterviewBit</h3>
            <p>AI-powered interview preparation platform</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/practice">Practice Questions</Link>
          </div>
          <div className="footer-section">
            <h4>Account</h4>
            <Link to="/profile">Profile</Link>
            <Link to="/subscription">Subscription</Link>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>support@interviewbit.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 InterviewBit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

