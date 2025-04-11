// File: src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Footer from './components/Footer';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Add other routes as needed */}
          <Route path="*" element={<HomePage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;

// File: src/pages/HomePage.tsx
import React from 'react';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import DonationForm from '../components/DonationForm';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [showDonationForm, setShowDonationForm] = React.useState<boolean>(false);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowDonationForm(true);
    // Smooth scroll to donation form
    setTimeout(() => {
      document.getElementById('donation-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <main>
      <Hero />
      <Categories onCategorySelect={handleCategorySelect} />
      {showDonationForm && (
        <DonationForm 
          initialCategory={selectedCategory} 
          onDonationComplete={() => setShowDonationForm(false)} 
        />
      )}
    </main>
  );
};

export default HomePage;

// File: src/components/Navbar.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    // Placeholder for authentication system
    alert('Login functionality would connect to your authentication backend');
    // Redirect to login page or open modal
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <span className="logo-icon">📚</span>
        GiveFi
      </div>
      <div className={`nav-links ${mobileMenuOpen ? 'nav-active' : ''}`}>
        <Link to="/">Home</Link>
        <Link to="/about">About Us</Link>
        <Link to="/contact">Contact Us</Link>
      </div>
      <button className="login-btn" onClick={handleLogin}>LOG IN</button>
      <div className="mobile-menu" onClick={toggleMobileMenu}>
        ☰
      </div>
    </nav>
  );
};

export default Navbar;

// File: src/components/Hero.tsx
import React from 'react';
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero" id="home">
      <h1>Give Instantly. Help Globally.</h1>
      <p>Disasters don't wait — and now, your donations don't have to either.</p>
      <p>Powered by Ripple and blockchain tech, GiveFi gets your funds to the people who need them — fast, transparent, direct.</p>
    </section>
  );
};

export default Hero;

// File: src/components/Categories.tsx
import React from 'react';
import CategoryCard from './CategoryCard';
import './Categories.css';

interface CategoriesProps {
  onCategorySelect: (categoryId: string) => void;
}

const Categories: React.FC<CategoriesProps> = ({ onCategorySelect }) => {
  const categories = [
    {
      id: 'natural-disasters',
      title: 'Natural Disasters',
      description: 'Send emergency relief instantly to local responders',
      icon: '📖'
    },
    {
      id: 'conflict-zone',
      title: 'Conflict Zone',
      description: 'Crypto-powered donations reach borderless aid networks',
      icon: '🚰'
    },
    {
      id: 'health-emergencies',
      title: 'Health Emergencies',
      description: 'Fund life-saving supplies with full transparency',
      icon: '🧑‍⚕️'
    },
    {
      id: 'food-water',
      title: 'Food & Water Crisis',
      description: 'Help fund direct access to basic human needs',
      icon: '❤️'
    }
  ];

  return (
    <section className="categories">
      {categories.map(category => (
        <CategoryCard
          key={category.id}
          id={category.id}
          title={category.title}
          description={category.description}
          icon={category.icon}
          onClick={() => onCategorySelect(category.id)}
        />
      ))}
    </section>
  );
};

export default Categories;

// File: src/components/CategoryCard.tsx
import React from 'react';
import './CategoryCard.css';

interface CategoryCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ id, title, description, icon, onClick }) => {
  return (
    <div className="category" id={id} onClick={onClick}>
      <div className="category-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default CategoryCard;

// File: src/components/DonationForm.tsx
import React, { useState } from 'react';
import './DonationForm.css';

interface DonationFormProps {
  initialCategory: string;
  onDonationComplete: () => void;
}

interface FormData {
  category: string;
  amount: string;
  payment: string;
  email: string;
}

const DonationForm: React.FC<DonationFormProps> = ({ initialCategory, onDonationComplete }) => {
  const [formData, setFormData] = useState<FormData>({
    category: initialCategory,
    amount: '',
    payment: '',
    email: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Placeholder for API call
    console.log('Donation data to be sent to backend:', formData);
    alert('Thank you for your donation! In a real implementation, this would connect to your payment processing backend.');
    
    // API call example (commented out as it's a placeholder)
    /*
    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Success:', data);
        alert('Donation successful!');
        onDonationComplete();
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error processing your donation. Please try again.');
    }
    */
    
    // Reset form for demo purposes
    setFormData({
      category: '',
      amount: '',
      payment: '',
      email: ''
    });
    onDonationComplete();
  };

  return (
    <form id="donation-form" className="donation-form" onSubmit={handleSubmit}>
      <h2>Make a Donation</h2>
      
      <div className="form-group">
        <label htmlFor="category">Select Category</label>
        <select 
          id="category" 
          name="category" 
          value={formData.category} 
          onChange={handleChange} 
          required
        >
          <option value="">Select a cause</option>
          <option value="natural-disasters">Natural Disasters</option>
          <option value="conflict-zone">Conflict Zone</option>
          <option value="health-emergencies">Health Emergencies</option>
          <option value="food-water">Food & Water Crisis</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="amount">Donation Amount ($)</label>
        <input 
          type="number" 
          id="amount" 
          name="amount" 
          min="1" 
          value={formData.amount} 
          onChange={handleChange} 
          required 
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="payment">Payment Method</label>
        <select 
          id="payment" 
          name="payment" 
          value={formData.payment} 
          onChange={handleChange} 
          required
        >
          <option value="">Select payment method</option>
          <option value="crypto">Cryptocurrency</option>
          <option value="credit">Credit Card</option>
          <option value="bank">Bank Transfer</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange} 
          required 
        />
      </div>
      
      <button type="submit" className="submit-btn">Donate Now</button>
    </form>
  );
};

export default DonationForm;

// File: src/components/Footer.tsx
import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} GiveFi. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
