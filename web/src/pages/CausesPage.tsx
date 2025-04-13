import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CausesPage.css';
import { image } from '../utils/helpers';
import CauseCardV2 from '../components/CauseCardV2';
// Define the Cause interface
interface Cause {
  name: string;
  description: string;
  goal: number;
  raised: number;
  donations: number;
  imageUrl: string;
  category: string;
  cause_id: string;
}

const CausesPage: React.FC = () => {
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const fetchCauses = async (): Promise<Cause[]> => {
  return fetch("http://localhost:8000/causes")
    .then(response => response.json())
  };

  useEffect(() => {
    // Simulate fetching causes data
        console.log("Fetching causes...");
        setLoading(true);
        fetchCauses().then(causes => {
          setCauses(causes);
          setLoading(false);
        }).catch(error => {
          console.error('Error fetching causes:', error);
          setLoading(false);
        });
  }, []);

  const categories = [
    'All',
    'Natural Disasters',
    'Conflict Zone',
    'Health Emergencies',
    'Food & Water Crisis'
  ];

  const filteredCauses = activeCategory === 'All' 
    ? causes 
    : causes.filter(cause => cause.category === activeCategory);

  return (
    <div className="causes-container">
      
      <main className="causes-main">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <div className="breadcrumb-content">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">{" > "}</span>
            <span className="breadcrumb-current">Causes</span>
          </div>
        </div>
        
        {/* Category Filter */}
        <div className="category-filter">
          <div className="filter-buttons">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-button ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Causes Grid */}
        <div className="causes-grid-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : filteredCauses.length === 0 ? (
            <div className="no-causes">
              <h3>No causes found</h3>
              <p>There are currently no active causes in this category.</p>
            </div>
          ) : (
            <div className="causes-grid">
              {filteredCauses.map((cause) => (
                <CauseCardV2 key={cause.cause_id} cause={cause} />
                // <div key={cause.cause_id} className="cause-card">
                //   <div className="cause-image">
                //     <img 
                //       src={image[cause.imageUrl]} 
                //       alt={cause.name}
                //       onError={(e) => {
                //         // Fallback to placeholder if image fails to load
                //         const target = e.target as HTMLImageElement;
                //         target.src = '/images/placeholder.jpg';
                //       }}
                //     />
                //   </div>
                  
                //   <div className="cause-content">
                //     <div className="cause-category">
                //       <span>{cause.category}</span>
                //     </div>
                //     <h3 className="cause-name">{cause.name}</h3>
                //     <p className="cause-description">{cause.description}</p>
                    
                //     <div className="progress-container">
                //       <div className="progress-bar">
                //         <div 
                //           className="progress-fill" 
                //           style={{ width: `${Math.min(100, (cause.raised / cause.goal) * 100)}%` }}
                //         ></div>
                //       </div>
                //     </div>
                    
                //     <div className="cause-stats">
                //       <div className="cause-goal">
                //         <p className="stat-label">Goal: ${cause.goal.toLocaleString()}</p>
                //         <p className="stat-value">Raised: ${cause.raised.toLocaleString()}</p>
                //       </div>
                //       <div className="cause-donations">
                //         <p className="stat-label">{cause.donations}</p>
                //         <p className="stat-value">donations</p>
                //       </div>
                //     </div>
                    
                //     <Link to={`/causes/${cause.cause_id}`} className="view-details-button">
                //       VIEW DETAILS
                //     </Link>
                //   </div>
                // </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
    </div>
  );
};

export default CausesPage; 