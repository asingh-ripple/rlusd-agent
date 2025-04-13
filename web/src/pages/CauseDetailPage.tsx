import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {  } from 'react-router-dom';
import './CauseDetailPage.css';

// Components
import DonationForm from '../components/DonationForm';
import ConfirmationModal from '../components/DonationConfirmationModal';

// Utils
import { formatCurrency, calculatePercentage, formatDate, getShareableUrl, getSocialShareUrls, image } from '../utils/helpers';

// Define the Cause interface for type safety
export interface Cause {
  cause_id: string;
  name: string;
  description: string;
  goal: number;
  raised: number;
  donations: number;
  imageUrl: string;
  category: 'Natural Disasters' | 'Conflict Zone' | 'Health Emergencies' | 'Food & Water Crisis';
  // Add additional fields for the detailed page
  story?: string;
  updates?: Update[];
  relatedCauses?: RelatedCause[];
}

interface Update {
  id: string;
  date: string;
  title: string;
  content: string;
}

interface RelatedCause {
  cause_id: string;
  title: string;
  imageUrl: string;
  category: string;
}

// Mock data for fund allocation
const fundAllocation = [
  { category: "Emergency Shelter", allocation: "30%" },
  { category: "Clean Water & Sanitation", allocation: "20%" },
  { category: "Food & Nutrition", allocation: "20%" },
  { category: "Medical Aid", allocation: "15%" },
  { category: "Local Logistics", allocation: "10%" },
  { category: "Operational Support", allocation: "5%" }
];

// Mock data for testimonials
const testimonials = [
  {
    quote: "The emergency supplies delivered by this organization saved lives in our village. With our roads destroyed, we had no way to reach the city for help. Their rapid response made all the difference.",
    author: "Maria S., Honduras"
  },
  {
    quote: "When the earthquake hit, we lost everything. The medical team arrived within hours and set up a field hospital. My daughter received treatment that likely saved her life.",
    author: "Carlos M., Ecuador"
  }
];

// Organization info
const aboutOrg = {
  name: "Global Relief Network",
  differentiators: [
    "24-hour emergency response in 97% of deployments",
    "97 cents of every dollar goes directly to field operations",
    "Uses blockchain verification for transparent fund tracking",
    "Local partnerships in 43 countries ensure culturally-appropriate aid"
  ],
  description: "Global Relief Network was founded in 2005 by Dr. Sarah Chen, who witnessed firsthand the critical importance of rapid response after the Southeast Asian tsunami.\n\nToday, GRN operates with a network of over 5,000 trained emergency responders worldwide, ready to deploy within hours of a disaster. Our innovative use of technology - including drone surveys, satellite communications, and blockchain-verified supply chains - allows us to reach affected communities faster and more efficiently than traditional models.\n\nWe believe in a community-led approach, working alongside local partners to ensure aid is culturally appropriate, sustainable, and empowering rather than creating dependency."
};

const CauseDetailPage: React.FC = () => {
  const params = useParams();
  const [cause, setCause] = useState<Cause | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'story' | 'updates'>('story');
  const [donation, setDonation] = useState<string>('');
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);

  const fetchCause = async (causeId: string): Promise<Cause> => {
    // In a real application, this would be an API call
    
  return fetch(`http://localhost:8000/causes/${causeId}`)
    .then(response => response.json())
  };

  useEffect(() => {
    // Simulate API call to get cause details
    const causeIdString = params.id || '';
    fetchCause(causeIdString).then(cause => {
      console.log(cause);
      setCause(cause);
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching cause details:', error);
      setLoading(false);
    });
  }, [params.id, donation]);

  useEffect(() => {
    if (donation) {
      setShowConfirmationModal(true);
    }
  }, [donation]);

  const handleDonationSubmit = (amount: number, cause_id: string, customer_id: string) => {
    // In a real app, this would submit to a payment processor
    fetch(`http://localhost:8000/donate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        cause_id: cause_id,
        customer_id: customer_id,
        currency: 'USD'
      })
    }).then(response => response.json())
      .then(data => {
        setDonation(data.donation_id);
      })
      .catch(error => {
        console.error('Error submitting donation:', error);
      });
  };

  const handleCloseModal = () => {
    setShowConfirmationModal(false);
  };

  if (loading) {
    return (
      <div className="cause-detail-page">
        <div className="cause-detail-loading">
          <div className="loading-spinner"></div>
          <p>Loading cause details...</p>
        </div>
      </div>
    );
  }

  if (!cause) {
    return (
      <div className="cause-detail-page">
        <div className="cause-detail-not-found">
          <h2>Cause Not Found</h2>
          <p>The cause you're looking for doesn't exist or has been removed.</p>
          <Link to="/causes" className="back-button">Back to Causes</Link>
        </div>
      </div>
    );
  }

  const progressPercentage = calculatePercentage(cause.raised, cause.goal);
  const shareUrl = getShareableUrl(cause.cause_id);
  const socialUrls = getSocialShareUrls(shareUrl, cause.name);

  return (
    <div className="cause-detail-page">
      <div className="cause-detail-container">
        {/* Breadcrumb navigation */}
        <div className="breadcrumb">
          <div className="breadcrumb-content">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <Link to="/causes" className="breadcrumb-link">Causes</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{cause.name}</span>
          </div>
        </div>

        {/* Hero section */}
        <div className="cause-hero">
          <div className="cause-hero-image">
            <img src={image[cause.imageUrl]} alt={cause.name} />
          </div>
        </div>

        {/* Main content */}
        <div className="cause-detail-content">
          <div className="cause-detail-main">
            {/* Cause header */}
            <div className="cause-header">
              <div className="cause-category">
                <span>{cause.category}</span>
              </div>
              <h1 className="cause-title">{cause.name || ' BLAH!!!!'}</h1>
              <p className="cause-description">{cause.description}</p>
            </div>

            {/* Cause progress */}
            <div className="cause-progress">
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="cause-stats">
                <div className="cause-raised">
                  <div className="stat-label">Raised</div>
                  <div className="stat-value">{formatCurrency(cause.raised)}</div>
                </div>
                <div className="cause-goal">
                  <div className="stat-label">Goal</div>
                  <div className="stat-value">{formatCurrency(cause.goal)}</div>
                </div>
                <div className="cause-donations">
                  <div className="stat-label">Donations</div>
                  <div className="stat-value">{cause.donations?.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="cause-tabs">
              <button 
                className={`tab-button ${activeTab === 'story' ? 'active' : ''}`}
                onClick={() => setActiveTab('story')}
              >
                Story
              </button>
              <button 
                className={`tab-button ${activeTab === 'updates' ? 'active' : ''}`}
                onClick={() => setActiveTab('updates')}
              >
                Updates ({cause.updates?.length || 0})
              </button>
            </div>

            {/* Tab content */}
            <div className="tab-content">
              {activeTab === 'story' ? (
                <div className="cause-story">
                  {cause.story ? (
                    <>
                      {cause.story.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="story-paragraph">{paragraph}</p>
                      ))}
                      
                      {/* Fund allocation section */}
                      <h2 className="section-title">Where Will My Money Go?</h2>
                      <p>Thanks to blockchain technology, every fund transfer is traceable. Here's a snapshot of where donations are going:</p>
                      
                      <div className="fund-allocation">
                        {fundAllocation.map((item, index) => (
                          <div key={index} className="allocation-item">
                            <span className="allocation-category">{item.category}</span>
                            <span className="allocation-percentage">{item.allocation}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Testimonials section */}
                      <h2 className="section-title">Real Stories from the Field</h2>
                      <div className="testimonials">
                        {testimonials.map((testimonial, index) => (
                          <div key={index} className="testimonial">
                            <blockquote>"{testimonial.quote}"</blockquote>
                            <cite>— {testimonial.author}</cite>
                          </div>
                        ))}
                      </div>
                      
                      {/* About organization */}
                      <h2 className="section-title">About {aboutOrg.name}</h2>
                      <div className="org-differentiators">
                        <h3>What Makes This Different</h3>
                        <ul>
                          {aboutOrg.differentiators.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="org-description">
                        {aboutOrg.description.split('\n').map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p>{cause.description}</p>
                  )}
                </div>
              ) : (
                <div className="cause-updates">
                  {cause.updates && cause.updates.length > 0 ? (
                    cause.updates.map(update => (
                      <div key={update.id} className="update-card">
                        <div className="update-date">{formatDate(update.date)}</div>
                        <h3 className="update-title">{update.title}</h3>
                        <p className="update-content">{update.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="no-updates">No updates available for this cause yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="cause-detail-sidebar">
            {/* Donation form */}
            <DonationForm 
              causeTitle={cause.name}
              cause_id={cause.cause_id}
              customer_id={"donor-1"}
              onSubmit={handleDonationSubmit}
            />

            {/* Related causes */}
            {cause.relatedCauses && cause.relatedCauses.length > 0 && (
              <div className="related-causes">
                <h3>Related Causes</h3>
                <div className="related-causes-list">
                  {cause.relatedCauses.map(relatedCause => (
                    <Link 
                      to={`/causes/${relatedCause.cause_id}`} 
                      key={relatedCause.cause_id}
                      className="related-cause-card"
                    >
                      <div className="related-cause-image">
                        <img src={relatedCause.imageUrl} alt={relatedCause.title} />
                      </div>
                      <div className="related-cause-info">
                        <div className="related-cause-category">{relatedCause.category}</div>
                        <h4 className="related-cause-title">{relatedCause.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share buttons */}
            <div className="share-container">
              <h3>Share This Cause</h3>
              <div className="share-buttons">
                <a 
                  href={socialUrls.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="share-button facebook"
                >
                  Facebook
                </a>
                <a 
                  href={socialUrls.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="share-button twitter"
                >
                  Twitter
                </a>
                <a 
                  href={socialUrls.email}
                  className="share-button email"
                >
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showConfirmationModal}
        onClose={handleCloseModal}
        title="Thank you!!"
        action="Donation Confirmed"
        message="— your donation has been received and recorded on the blockchain. We'll email you when your contribution is distributed or when there are important updates on the cause."
        buttonText="Done"
      />
    </div>
  );
};

export default CauseDetailPage; 