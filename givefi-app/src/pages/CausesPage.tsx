import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CausesPage.css';

// Define the Cause interface
interface Cause {
  id: number;
  title: string;
  description: string;
  goal: number;
  raised: number;
  donations: number;
  imageUrl: string;
  category: string;
}

const CausesPage: React.FC = () => {
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    const fetchCauses = async () => {
      try {
        // Mock API call - in a real app, this would be a real API endpoint
        setTimeout(() => {
          setCauses(mockCauses);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching causes:', error);
        setLoading(false);
      }
    };

    fetchCauses();
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
        
        {/* Page Title */}
        <div className="page-title">
          <h1>All Causes</h1>
          <p>Browse all our active causes and make an impact today.</p>
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
                <div key={cause.id} className="cause-card">
                  <div className="cause-image">
                    <img 
                      src={cause.imageUrl || '/images/placeholder.jpg'} 
                      alt={cause.title}
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder.jpg';
                      }}
                    />
                  </div>
                  
                  <div className="cause-content">
                    <div className="cause-category">
                      <span>{cause.category}</span>
                    </div>
                    <h3 className="cause-title">{cause.title}</h3>
                    <p className="cause-description">{cause.description}</p>
                    
                    <div className="progress-container">
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
                    
                    <Link to={`/causes/${cause.id}`} className="view-details-button">
                      VIEW DETAILS
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
    </div>
  );
};

// Mock data for causes
const mockCauses: Cause[] = [
  {
    id: 1,
    title: "Global Relief Disaster Response",
    description: "GRN delivers emergency food, shelter, and water within 24 hours of natural disasters. Your donation helps their rapid-response teams reach areas hit by floods, earthquakes, and hurricanes around the world.",
    goal: 50000,
    raised: 27400,
    donations: 14,
    imageUrl: "/images/disaster-relief.jpg",
    category: "Natural Disasters"
  },
  {
    id: 2,
    title: "Rebuilding After the Storm with ShelterNow",
    description: "Specializing in post-disaster recovery, ShelterNow helps communities build homes using local labor and sustainable materials. Support long-term recovery after natural catastrophes.",
    goal: 15000,
    raised: 12200,
    donations: 25,
    imageUrl: "/images/shelter-rebuild.jpg",
    category: "Natural Disasters"
  },
  {
    id: 3,
    title: "Mobile Clinics For Crisis Zones With HealthBridge",
    description: "HealthBridge deploys mobile clinics in underserved areas affected by conflicts and pandemics. Every donation fuels life-saving diagnoses and care in real time.",
    goal: 200000,
    raised: 87000,
    donations: 6,
    imageUrl: "/images/mobile-clinics.jpg",
    category: "Health Emergencies"
  },
  {
    id: 4,
    title: "Emergency Aid in Gaza with Humanity Frontline",
    description: "Providing food, medical aid, and psychological support for families affected by conflict in Gaza. Your donation goes directly to vetted local workers on the ground.",
    goal: 60000,
    raised: 32500,
    donations: 12,
    imageUrl: "/images/gaza-aid.jpg",
    category: "Conflict Zone"
  },
  {
    id: 5,
    title: "Combating Cholera with CleanMedic Haiti",
    description: "Fighting the cholera outbreak with emergency IV fluids, antibiotics, and bed treatment. Your contribution supports local nurses and medics on the frontlines.",
    goal: 220000,
    raised: 80000,
    donations: 24,
    imageUrl: "/images/cholera-haiti.jpg",
    category: "Health Emergencies"
  },
  {
    id: 6,
    title: "Feeding Children in Drought with NourishNow",
    description: "Providing school meals and nutritional support in East Africa where children face severe food insecurity due to drought. $1 can feed a child for a day.",
    goal: 120000,
    raised: 35000,
    donations: 8,
    imageUrl: "/images/drought-children.jpg",
    category: "Food & Water Crisis"
  }
];

export default CausesPage; 