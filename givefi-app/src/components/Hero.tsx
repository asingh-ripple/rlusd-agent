import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">Every Donation Makes a Difference</h1>
          <p className="hero-subtitle">
            GiveFi connects you directly with trusted causes through transparent blockchain-based giving
          </p>
          <div className="hero-actions">
            <Link to="/causes" className="primary-button">
              Explore Causes
            </Link>
            <Link to="/about" className="secondary-button">
              Learn More
            </Link>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-value">$2.3M</span>
            <span className="stat-label">Total Donations</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">17+</span>
            <span className="stat-label">Countries Reached</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">100%</span>
            <span className="stat-label">Transparent</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 