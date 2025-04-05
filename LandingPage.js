import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Make the Most of Your Free Time</h1>
          <p className="lead">
            Free Time Optimizer intelligently suggests activities based on your interests, 
            available time, and schedule to help you make the most of every moment.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">Get Started</Link>
            <Link to="/login" className="btn btn-outline">Sign In</Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="section-header">
          <h2>Key Features</h2>
          <p>Discover how Free Time Optimizer can transform your free time</p>
        </div>
        
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <h3>Calendar Integration</h3>
            <p>Seamlessly connect with Google Calendar to automatically detect your free time slots</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-lightbulb"></i>
            </div>
            <h3>Smart Suggestions</h3>
            <p>Get personalized activity recommendations based on your interests and available time</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-clock"></i>
            </div>
            <h3>Adaptive Scheduling</h3>
            <p>Activities automatically adapt to fit your changing schedule and time constraints</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>Progress Tracking</h3>
            <p>Monitor your activity completion and see how you're making the most of your time</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Three simple steps to optimize your free time</p>
        </div>
        
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Connect Your Calendar</h3>
            <p>Link your Google Calendar to automatically detect your free time slots</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>Add Your Interests</h3>
            <p>Tell us about activities you enjoy and how much time they typically take</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Recommendations</h3>
            <p>Receive personalized suggestions for how to spend your free time</p>
          </div>
        </div>
        
        <div className="cta-center">
          <Link to="/register" className="btn btn-primary btn-lg">Start Optimizing Your Time</Link>
        </div>
      </section>

      <section className="testimonials">
        <div className="section-header">
          <h2>What Our Users Say</h2>
          <p>Join thousands of satisfied users who have transformed their free time</p>
        </div>
        
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"Free Time Optimizer has helped me rediscover my hobbies. I never realized how much free time I actually had until I started using this app!"</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">JS</div>
              <div className="author-info">
                <h4>Jane Smith</h4>
                <p>Marketing Professional</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"As a busy parent, finding time for myself was always a challenge. This app helps me carve out moments for self-care and personal growth."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">MJ</div>
              <div className="author-info">
                <h4>Michael Johnson</h4>
                <p>Parent & Software Engineer</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"The adaptive scheduling feature is a game-changer! Even when my plans change, the app helps me make the most of whatever time I have available."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">AL</div>
              <div className="author-info">
                <h4>Aisha Lee</h4>
                <p>Graduate Student</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="faq">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Find answers to common questions about Free Time Optimizer</p>
        </div>
        
        <div className="faq-grid">
          <div className="faq-item">
            <h3>Is my calendar data secure?</h3>
            <p>Yes, we use OAuth 2.0 for secure authentication and never store your calendar events - only the free time between them.</p>
          </div>
          
          <div className="faq-item">
            <h3>Can I use the app without Google Calendar?</h3>
            <p>Absolutely! You can manually enter your free time slots if you prefer not to connect your calendar.</p>
          </div>
          
          <div className="faq-item">
            <h3>Is there a mobile app available?</h3>
            <p>Our web app is fully responsive and works great on mobile devices. Native mobile apps are coming soon!</p>
          </div>
          
          <div className="faq-item">
            <h3>How much does it cost?</h3>
            <p>Free Time Optimizer is free to use with basic features. Premium features are available with a subscription plan.</p>
          </div>
        </div>
        
        <div className="cta-center">
          <Link to="/register" className="btn btn-primary">Sign Up Now - It's Free!</Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
