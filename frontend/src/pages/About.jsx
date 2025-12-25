import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="container">
        <div className="about-hero">
          <h1>About InterviewBit</h1>
          <p className="hero-subtitle">
            Empowering candidates to ace their interviews with AI-powered preparation tools
          </p>
        </div>

        <div className="about-content">
          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              At InterviewBit, we believe that everyone deserves the opportunity to showcase their
              skills and land their dream job. Our mission is to democratize interview preparation
              by providing accessible, AI-powered tools that help candidates prepare effectively
              and confidently.
            </p>
            <p>
              We combine cutting-edge artificial intelligence with comprehensive question banks
              to create a personalized learning experience tailored to each candidate's unique
              background and career goals.
            </p>
          </section>

          <section className="about-section">
            <h2>What We Offer</h2>
            <div className="features-list">
              <div className="feature-item">
                <h3>AI-Powered Resume Analysis</h3>
                <p>
                  Upload your resume and get instant insights into your skills, experience, and
                  strengths. Our AI analyzes your background and suggests personalized practice
                  questions.
                </p>
              </div>
              <div className="feature-item">
                <h3>Comprehensive Question Bank</h3>
                <p>
                  Access thousands of interview questions from top tech companies, categorized
                  by difficulty, topic, and company. Practice with real questions asked in
                  actual interviews.
                </p>
              </div>
              <div className="feature-item">
                <h3>AI Chatbot Assistant</h3>
                <p>
                  Get instant help with interview preparation. Our AI assistant can answer
                  questions, provide tips, conduct mock interviews, and guide you through
                  your preparation journey.
                </p>
              </div>
              <div className="feature-item">
                <h3>Company-Specific Preparation</h3>
                <p>
                  Premium members get access to company-specific question banks, helping you
                  prepare for interviews at your target companies with curated, relevant questions.
                </p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Our Team</h2>
            <p>
              InterviewBit is built by a passionate team of engineers, designers, and AI
              researchers dedicated to helping candidates succeed. We understand the challenges
              of interview preparation and are committed to making it easier and more effective.
            </p>
          </section>

          <section className="about-section">
            <h2>Contact Us</h2>
            <p>
              Have questions or feedback? We'd love to hear from you!
            </p>
            <div className="contact-info">
              <p><strong>Email:</strong> support@interviewbit.com</p>
              <p><strong>Support Hours:</strong> Monday - Friday, 9 AM - 6 PM EST</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;

