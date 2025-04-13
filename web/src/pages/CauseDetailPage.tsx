import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './CauseDetailPage.css';

// Components
import DonationForm from '../components/DonationForm';
import ConfirmationModal from '../components/DonationConfirmationModal';
import CharityFlowGraph from '../components/CharityFlowGraph';

// Utils
import { formatCurrency, calculatePercentage, formatDate, getShareableUrl, getSocialShareUrls, image } from '../utils/helpers';
import CharityFlowVisualization from '../components/CharityFlowVisualization';

// Define the Cause interface for type safety
export interface Cause {
  cause_id: string;
  name: string;
  customer_id: string;
  description: string;
  goal: number;
  raised: number;
  balance: number;
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

interface Transaction {
  transaction_hash: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  receiver_name: string;
  amount: number;
  currency: string;
  transaction_type: string;
  status: string;
}

// For CharityFlowVisualization
interface GraphData {
  nodes: {
    id: string;
    name: string;
    level: number;
    totalOutgoing?: number;
    totalIncoming?: number;
  }[];
  edges: {
    source: string;
    target: string;
    amount: number;
    label: string;
    rawAmount: string;
    hashes: string[];
  }[];
  levels: {
    [key: string]: any[];
  };
}

// Mock data for fund allocation
const fundAllocation = [
  { category: "Emergency Response", allocation: "45%" },
  { category: "Medical Supplies", allocation: "30%" },
  { category: "Temporary Housing", allocation: "15%" },
  { category: "Administrative", allocation: "10%" }
];

// Mock data for about organization
const aboutOrg = {
  name: "ShelterNow",
  differentiators: [
    "100% transparency with blockchain-tracked fund distribution",
    "90% of donations go directly to on-the-ground operations",
    "Local partnership model that builds community capacity",
    "Sustainable rebuilding practices with environmental considerations"
  ],
  description: "ShelterNow specializes in post-disaster recovery and sustainable rebuilding efforts. Our organization works directly with local communities to rebuild homes using local labor and sustainable materials.\n\nBy tracking every dollar on the blockchain, we provide unprecedented transparency to donors. You can see exactly where your contribution goes and how it makes an impact."
};

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

const CauseDetailPage: React.FC = () => {
  const params = useParams();
  const [cause, setCause] = useState<Cause | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'story' | 'updates'>('story');
  const [donation, setDonation] = useState<string>('');
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [donorGraphData, setDonorGraphData] = useState<GraphData | null>(null);
  
  const fetchCause = async (causeId: string): Promise<Cause> => {
    // In a real application, this would be an API call
    return fetch(`http://localhost:8000/causes/${causeId}`)
      .then(response => response.json())
  };

  const fetchTransactions = async (customer_id: string, donor_id: string): Promise<Transaction[]> => {
    // In a real application, this would be an API call
    return fetch(`http://localhost:8000/transactions/${customer_id}/${donor_id}`)
      .then(response => response.json())
  };

  // Function to format transactions into GraphData for CharityFlowVisualization
  const formatTransactionsToGraphData = (transactions: Transaction[]): GraphData => {
    // Map to keep track of unique nodes
    const nodesMap = new Map();
    
    // Create a donor node (always level 0)
    nodesMap.set("donor-1", {
      id: "donor-1",
      name: "You (Donor)",
      level: 0,
      totalOutgoing: 0
    });

    // Create organization node (level 1)
    if (cause) {
      nodesMap.set(cause.customer_id, {
        id: cause.customer_id,
        name: cause.name || "Organization",
        level: 1,
        totalIncoming: 0,
        totalOutgoing: 0
      });
    }

    // Add all receivers as nodes (level 2)
    transactions.forEach(tx => {
      if (!nodesMap.has(tx.receiver_id) && tx.receiver_id !== cause?.customer_id) {
        nodesMap.set(tx.receiver_id, {
          id: tx.receiver_id,
          name: tx.receiver_name,
          level: 2,
          totalIncoming: 0
        });
      }
    });

    // Create edges from transactions
    const edges = transactions.map(tx => {
      // Calculate total amounts for nodes
      const sourceNode = nodesMap.get(tx.sender_id);
      const targetNode = nodesMap.get(tx.receiver_id);
      
      if (sourceNode) {
        sourceNode.totalOutgoing = (sourceNode.totalOutgoing || 0) + tx.amount;
      }
      
      if (targetNode) {
        targetNode.totalIncoming = (targetNode.totalIncoming || 0) + tx.amount;
      }
      
      return {
        source: tx.sender_id,
        target: tx.receiver_id,
        amount: tx.amount,
        label: `${tx.amount.toFixed(1)} ${tx.currency}`,
        rawAmount: `${tx.amount} ${tx.currency}`,
        hashes: [tx.transaction_hash]
      };
    });

    // Group nodes by level
    const levels: { [key: string]: any[] } = {};
    nodesMap.forEach((node) => {
      const levelKey = node.level.toString();
      if (!levels[levelKey]) {
        levels[levelKey] = [];
      }
      levels[levelKey].push(node);
    });

    // If no real transactions, add a default edge from donor to organization
    if (edges.length === 0 && cause) {
      edges.push({
        source: "donor-1",
        target: cause.customer_id,
        amount: 0,
        label: "0.0 RLUSD",
        rawAmount: "0 RLUSD",
        hashes: ["pending-transaction"]
      });
    }

    return {
      nodes: Array.from(nodesMap.values()),
      edges,
      levels
    };
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

  useEffect(() => {
    if (cause?.customer_id) {
      fetchTransactions(cause.customer_id, "donor-1").then(transactions => {
        setTransactions(transactions);
        // Format transactions into GraphData
        const graphData = formatTransactionsToGraphData(transactions);
        setDonorGraphData(graphData);
      }).catch(error => {
        console.error('Error fetching transactions:', error);
      });
    }
  }, [cause?.customer_id]);

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
              <h1 className="cause-title">{cause.name}</h1>
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
                    <>
                      <p>{cause.description}</p>
                      <h2 className="section-title">Where does the money go?</h2>
                      <p>This interactive visualization shows how funds flow from donors through our organization to the local charities on the ground.</p>
                      
                      <div className="fund-flow-visualization">
                        <CharityFlowVisualization />
                      </div>

                      <h2 className="section-title">Your Impact</h2>
                      <p>See how your donations directly impact communities in need. Every transaction is tracked on the blockchain for complete transparency.</p>
 
                      <h2 className="section-title">Where has my money gone?</h2>
                      <p>This visualization shows the flow of your specific donations through our organization to the local partners on the ground. Each node represents an organization, and each line represents a transaction that has been permanently recorded on the blockchain.</p>
                      
                      <div className="fund-flow-visualization">
                        {donorGraphData && <CharityFlowVisualization graphData={donorGraphData} />}
                      </div>
                    </>
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