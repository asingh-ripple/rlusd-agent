import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          GiveFi
        </Link>
        
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/causes" className="nav-link">Causes</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </div>
        
        <div className="navbar-actions">
          <Link to="/donate" className="donate-btn">Donate Now</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 