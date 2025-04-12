import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './CauseDetailPage.css';

// Components
import DonationForm from '../components/DonationForm';

// Utils
import { formatCurrency, calculatePercentage, formatDate, getShareableUrl, getSocialShareUrls } from '../utils/helpers';

// Define the Cause interface for type safety
export interface Cause {
  id: string;
  title: string;
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
  id: string;
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
  const { id } = useParams<{ id: string }>();
  const [cause, setCause] = useState<Cause | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'story' | 'updates'>('story');

  useEffect(() => {
    // Simulate API call to get cause details
    const fetchCauseDetails = async () => {
      setLoading(true);
      try {
        // In a real application, this would be a fetch request to your API
        // For now, we'll use mock data
        setTimeout(() => {
          const foundCause = mockCauses.find(cause => cause.id === id);
          if (foundCause) {
            setCause(foundCause);
          }
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching cause details:", error);
        setLoading(false);
      }
    };

    fetchCauseDetails();
  }, [id]);

  const handleDonationSubmit = (amount: number, paymentMethod: string, formData: any) => {
    // In a real app, this would submit to a payment processor
    alert(`Thank you for your donation of ${formatCurrency(amount)}!`);
    console.log('Payment method:', paymentMethod);
    console.log('Form data:', formData);
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
  const shareUrl = getShareableUrl(cause.id);
  const socialUrls = getSocialShareUrls(shareUrl, cause.title);

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
            <span className="breadcrumb-current">{cause.title}</span>
          </div>
        </div>

        {/* Hero section */}
        <div className="cause-hero">
          <div className="cause-hero-image">
            <img src={cause.imageUrl} alt={cause.title} />
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
              <h1 className="cause-title">{cause.title}</h1>
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
                  <div className="stat-value">{cause.donations.toLocaleString()}</div>
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
              causeTitle={cause.title}
              onSubmit={handleDonationSubmit}
            />

            {/* Related causes */}
            {cause.relatedCauses && cause.relatedCauses.length > 0 && (
              <div className="related-causes">
                <h3>Related Causes</h3>
                <div className="related-causes-list">
                  {cause.relatedCauses.map(relatedCause => (
                    <Link 
                      to={`/causes/${relatedCause.id}`} 
                      key={relatedCause.id}
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
    </div>
  );
};

// Mock data for development and testing
const mockCauses: Cause[] = [
  {
    id: "1",
    title: "Hurricane Relief in Florida",
    description: "Support communities affected by the recent devastating hurricane in Florida.",
    story: "The recent category 5 hurricane that struck the Florida coast has left thousands of families without homes, access to clean water, or electricity. The destruction has been unprecedented, with entire neighborhoods swept away by storm surges and high winds.\n\nEmergency services are stretched thin, and many communities in rural areas remain cut off due to infrastructure damage. These families need immediate assistance with temporary shelter, food supplies, clean water, and medical attention.\n\nYour donation will directly support the deployment of emergency response teams, provision of temporary shelters, distribution of clean water and food supplies, and medical assistance to those injured or displaced by the hurricane.\n\nWe're working with local authorities and community leaders to ensure aid reaches those most in need as quickly as possible. Every dollar makes a difference in helping these communities begin the long process of recovery and rebuilding.",
    goal: 500000,
    raised: 342000,
    donations: 2547,
    imageUrl: "https://images.unsplash.com/photo-1569427575831-317b45c7a130?auto=format&fit=crop&q=80&w=1000",
    category: "Natural Disasters",
    updates: [
      {
        id: "u1",
        date: "October 15, 2023",
        title: "First Emergency Supplies Delivered",
        content: "Thanks to your generous donations, we've delivered the first batch of emergency supplies to affected communities in Tampa Bay area. This includes 5,000 gallons of clean water, 2,000 meal kits, and 500 emergency blankets."
      },
      {
        id: "u2",
        date: "October 10, 2023",
        title: "Emergency Response Teams Deployed",
        content: "We've successfully deployed 5 emergency response teams to the most affected areas. These teams are currently assessing the damage and coordinating with local authorities to distribute aid effectively."
      }
    ],
    relatedCauses: [
      {
        id: "2",
        title: "Flood Recovery in Louisiana",
        imageUrl: "https://images.unsplash.com/photo-1583488630027-58f4c80c74ff?auto=format&fit=crop&q=80&w=1000",
        category: "Natural Disasters"
      },
      {
        id: "3",
        title: "Wildfire Relief in California",
        imageUrl: "https://images.unsplash.com/photo-1602496849540-bf8fa67a6ef2?auto=format&fit=crop&q=80&w=1000",
        category: "Natural Disasters"
      }
    ]
  },
  {
    id: "2",
    title: "Flood Recovery in Louisiana",
    description: "Help families rebuild after the devastating floods in Louisiana.",
    story: "Louisiana has experienced one of the worst flooding events in recent history, with record-breaking rainfall causing rivers to overflow and levees to breach. Thousands of homes and businesses are now underwater, and many families have lost everything they own.\n\nThe situation is especially dire for low-income communities that were already struggling before this disaster. Many residents did not have flood insurance and now face the impossible task of rebuilding their lives from scratch.\n\nYour donation will fund critical recovery efforts including debris removal, home repairs, replacement of essential household items, and support for temporary housing while homes are being restored. We're also providing mental health services to help survivors cope with the trauma of this disaster.\n\nBy contributing to this cause, you're giving hope to families who are facing the darkest moment of their lives. Together, we can help Louisiana communities recover and rebuild stronger than before.",
    goal: 350000,
    raised: 125000,
    donations: 843,
    imageUrl: "https://images.unsplash.com/photo-1583488630027-58f4c80c74ff?auto=format&fit=crop&q=80&w=1000",
    category: "Natural Disasters",
    updates: [
      {
        id: "u1",
        date: "September 28, 2023",
        title: "Temporary Housing Units Secured",
        content: "We've secured 50 temporary housing units for families whose homes were completely destroyed. The first 15 families will be moving in this week."
      }
    ],
    relatedCauses: [
      {
        id: "1",
        title: "Hurricane Relief in Florida",
        imageUrl: "https://images.unsplash.com/photo-1569427575831-317b45c7a130?auto=format&fit=crop&q=80&w=1000",
        category: "Natural Disasters"
      }
    ]
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

export default CauseDetailPage; 