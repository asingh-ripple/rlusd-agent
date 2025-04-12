import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import './HomePage.css';
import { Cause } from './CauseDetailPage'; // Import Cause interface
import { image } from '../utils/helpers';
// import conflict from '../public/images/conflict.jpg';
// import health from '../public/images/health.jpg';
// import natural from '../public/images/natural.jpg';
// import water from '../public/images/water.jpg';
// import hurricane from '../public/images/hurricane-relief.jpg';


const HomePage: React.FC = () => {
  const [latestCauses, setLatestCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCauses = async (): Promise<Cause[]> => {
    // In a real application, this would be an API call
    
  return fetch("http://localhost:8000/causes")
    .then(response => response.json())
  };

  useEffect(() => {
    // Simulate fetching causes data
      console.log(process.env.PUBLIC_URL);
        console.log("Fetching causes...");
        setLoading(true);
        fetchCauses().then(causes => {
          console.log(causes.slice(0, 3));
          setLatestCauses(causes.slice(0, 3));
          setLoading(false);
        }).catch(error => {
          console.error('Error fetching causes:', error);
          setLoading(false);
        });
  }, []);

  return (
    <main className="home-page">
      <Hero />
      <CauseCategories />
      <LatestCauses causes={latestCauses} loading={loading} />
    </main>
  );
};

// CauseCategories component
const CauseCategories: React.FC = () => {
  const categories = [
    {
      title: "Natural Disasters",
      icon: "🌪️",
      description: "Send emergency relief instantly to local responders"
    },
    {
      title: "Conflict Zone",
      icon: "🏛️",
      description: "Crypto-powered donations reach borderless aid networks"
    },
    {
      title: "Health Emergencies",
      icon: "🩺",
      description: "Fund life-saving supplies with full transparency"
    },
    {
      title: "Food & Water Crisis",
      icon: "💧",
      description: "Help fund direct access to basic human needs"
    }
  ];

  return (
    <section className="categories-section">
      <div className="container">
        <h2 className="section-title">Categories</h2>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <div key={index} className="category-card">
              <div className="category-icon">{category.icon}</div>
              <h3 className="category-title">{category.title}</h3>
              <p className="category-description">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// LatestCauses component
interface LatestCausesProps {
  causes: Cause[];
  loading: boolean;
}

const LatestCauses: React.FC<LatestCausesProps> = ({ causes, loading }) => {
  if (loading) {
    return (
      <section className="latest-causes-section">
        <div className="container">
          <h2 className="section-title">Latest Causes</h2>
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="latest-causes-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Latest Causes</h2>
          <a href="/causes" className="view-all-link">
            View All Causes →
          </a>
        </div>
        
        <div className="causes-grid">
          {causes.map((cause: Cause) => (
            <div key={cause.cause_id} className="cause-card">
              <div className="cause-image">
                <img 
                  src={image[cause.imageUrl]} 
                  alt={cause.name}
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/causes/placeholder.svg';
                  }}
                />
              </div>
              
              <div className="cause-content">
                <div className="cause-category">
                  <span>{cause.category}</span>
                </div>
                <h3 className="cause-title">{cause.name}</h3>
                <p className="cause-description">
                  {typeof cause.description === 'string' 
                    ? `${cause.description.substring(0, 120)}...`
                    : ''}
                </p>
                
                <div className="cause-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${Math.min(100, (cause.raised / cause.goal) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="cause-stats">
                  <div className="cause-goal">
                    <p className="stat-label">Goal: ${cause.goal.toLocaleString()}</p>
                    <p className="stat-value">Raised: ${cause.raised.toLocaleString()}</p>
                  </div>
                  <div className="cause-donations">
                    <p className="stat-label">{cause.donations}</p>
                    <p className="stat-value">donations</p>
                  </div>
                </div>
                
                <a href={`/causes/${cause.cause_id}`} className="view-details-button">
                  VIEW DETAILS
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomePage; 