import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-logo">
            <h2>GiveFi</h2>
            <p>Transparent giving for a better world</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-links-column">
              <h3>About</h3>
              <ul>
                <li><Link to="/about">Our Mission</Link></li>
                <li><Link to="/about/team">Our Team</Link></li>
                <li><Link to="/about/partners">Partners</Link></li>
                <li><Link to="/about/transparency">Transparency</Link></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h3>Causes</h3>
              <ul>
                <li><Link to="/causes?category=natural-disasters">Natural Disasters</Link></li>
                <li><Link to="/causes?category=conflict-zone">Conflict Zone</Link></li>
                <li><Link to="/causes?category=health-emergencies">Health Emergencies</Link></li>
                <li><Link to="/causes?category=food-water">Food & Water Crisis</Link></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h3>Resources</h3>
              <ul>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/resources/faq">FAQ</Link></li>
                <li><Link to="/resources/how-it-works">How it Works</Link></li>
                <li><Link to="/resources/impact">Impact Stories</Link></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h3>Connect</h3>
              <ul>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><a href="https://twitter.com/givefi" target="_blank" rel="noopener noreferrer">Twitter</a></li>
                <li><a href="https://facebook.com/givefi" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                <li><a href="https://instagram.com/givefi" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} GiveFi. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 