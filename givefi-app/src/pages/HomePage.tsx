import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import './HomePage.css';
import { Cause } from './CauseDetailPage'; // Import Cause interface

const HomePage: React.FC = () => {
  const [latestCauses, setLatestCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate fetching causes data
    const fetchCauses = async () => {
      try {
        // In a real application, this would be an API call
        setTimeout(() => {
          setLatestCauses(mockCauses.slice(0, 3)); // Only show first 3 causes
          setLoading(false);
        }, 800);
        
      } catch (error) {
        console.error('Error fetching causes:', error);
        setLoading(false);
      }
    };

    fetchCauses();
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
          {causes.map((cause) => (
            <div key={cause.id} className="cause-card">
              <div className="cause-image">
                <img 
                  src={cause.imageUrl || '/images/causes/placeholder.svg'} 
                  alt={cause.title}
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
                <h3 className="cause-title">{cause.title}</h3>
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
                
                <a href={`/causes/${cause.id}`} className="view-details-button">
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

// Mock data for development
const mockCauses: Cause[] = [
  {
    id: "1",
    title: "Hurricane Relief in Florida",
    description: "Support communities affected by the recent devastating hurricane in Florida.",
    goal: 500000,
    raised: 342000,
    donations: 2547,
    imageUrl: "https://images.unsplash.com/photo-1569427575831-317b45c7a130?auto=format&fit=crop&q=80&w=1000",
    category: "Natural Disasters"
  },
  {
    id: "2",
    title: "Flood Recovery in Louisiana",
    description: "Help families rebuild after the devastating floods in Louisiana.",
    goal: 350000,
    raised: 125000,
    donations: 843,
    imageUrl: "https://images.unsplash.com/photo-1583488630027-58f4c80c74ff?auto=format&fit=crop&q=80&w=1000",
    category: "Natural Disasters"
  },
  {
    id: "3",
    title: "Wildfire Relief in California",
    description: "Provide support for communities affected by the devastating wildfires in California.",
    goal: 400000,
    raised: 278000,
    donations: 1892,
    imageUrl: "https://images.unsplash.com/photo-1602496849540-bf8fa67a6ef2?auto=format&fit=crop&q=80&w=1000",
    category: "Natural Disasters"
  },
  {
    id: "4",
    title: "Emergency Aid for Gaza",
    description: "Provide critical humanitarian assistance to civilians caught in the conflict in Gaza.",
    goal: 750000,
    raised: 523000,
    donations: 4271,
    imageUrl: "https://images.unsplash.com/photo-1628511954475-4fc8b0ed4193?auto=format&fit=crop&q=80&w=1000",
    category: "Conflict Zone"
  },
  {
    id: "5",
    title: "Ukraine Humanitarian Crisis",
    description: "Support families displaced by the ongoing conflict in Ukraine with essential aid.",
    goal: 1000000,
    raised: 867000,
    donations: 7423,
    imageUrl: "https://images.unsplash.com/photo-1655123613624-56376576e4a5?auto=format&fit=crop&q=80&w=1000",
    category: "Conflict Zone"
  }
];

export default HomePage; 