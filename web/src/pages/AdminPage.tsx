// AdminPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import { FaExternalLinkAlt } from 'react-icons/fa';
import CharityDistributionInput from '../components/CharityDistributionInput';
import './AdminPage.css';
import { Cause } from './CauseDetailPage';
import ConfirmationModal from '../components/DonationConfirmationModal';
import { image } from '../utils/helpers';

// Define interfaces for component props
interface NewsCardProps {
  source: string;
  time: string;
  title: string;  
  content: string;
}

interface CharityAllocation {
  name: string;
  receiver_id: string;
  amount: number;
}

// News Card Component
const NewsCard = ({ source, time, title, content }: NewsCardProps) => {
  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }}>
      <div>
        <h3 style={{ 
          margin: '0 0 10px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#333'
        }}>{title}</h3>
        <div style={{
          fontSize: '13px',
          color: '#666',
          marginBottom: '12px'
        }}>{source} • {time}</div>
        <p style={{
          margin: '0',
          fontSize: '15px',
          lineHeight: '1.5',
          color: '#444'
        }}>{content}</p>
      </div>
      <div style={{
        marginLeft: '15px',
        color: '#5c6bc0'
      }}>
        {/* Icon placeholder */}
      </div>
    </div>
  );
};

// AdminPage Component
const AdminPage: React.FC = () => {
  const [cause, setCause] = useState<Cause | null>(null);
  const [distributeStatus, setDistributeStatus] = useState([]);
  const [allocations, setAllocations] = useState<CharityAllocation[]>([]);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  
  const handleCloseModal = () => {
    setShowConfirmationModal(false);
  };

  const charities = [
    {
      name: "Relief Riders Kenya",
      receiver_id: "charity-1",
      description: "Providing emergency transport services to deliver supplies and evacuate affected communities.",
      location: "Western Kenya"
    },
    {
      name: "CleanWater Uganda",
      receiver_id: "charity-2",
      description: "Supplying water purification systems and hygiene kits to flood-affected regions.",
      location: "Eastern Uganda"
    },
    {
      name: "ShelterNow Nairobi",
      receiver_id: "charity-3",
      description: "Providing temporary shelter and housing repair kits to displaced families.",
      location: "Nairobi, Kenya"
    },
    {
      name: "Mobile Medics Africa",
      receiver_id: "charity-4",
      description: "Deploying medical teams to provide critical healthcare services in isolated areas.",
      location: "Various locations"
    },
    {
      name: "SafeStart Philippines",
      receiver_id: "charity-5",
      description: "Focusing on children's safety, education continuity, and psychological support during crises.",
      location: "Philippines"
    },
    {
      name: "FoodForward Colombia",
      receiver_id: "charity-6",
      description: "Distributing emergency food supplies and agricultural recovery tools.",
      location: "Colombia"
    },
    {
      name: "Hands for Hope Nepal",
      receiver_id: "charity-7",
      description: "Community rebuilding projects focused on sustainable, disaster-resistant structures.",
      location: "Nepal"
    },
    {
      name: "EquipDR Haiti",
      receiver_id: "charity-8",
      description: "Providing equipment and training for local emergency response teams.",
      location: "Haiti"
    },
    {
      name: "RebuildTogether Morocco",
      receiver_id: "charity-9",
      description: "Coordinating community-based reconstruction efforts with a focus on traditional building methods.",
      location: "Morocco"
    }
  ];

  const fetchCause = () => {
    fetch("http://localhost:8000/causes/2", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(response => response.json()).then(data => {
      console.log(data);
      setCause(data);
    });
  };

  useEffect(() => {
    fetchCause();
  }, []);
  
  // Handle allocation change
  const handleAllocationChange = (name: string, receiver_id: string, amount: number, percentage: number) => {
    // Find if this charity already has an allocation
    const existingIndex = allocations.findIndex(a => a.name === name);
    
    let newAllocations = [...allocations];
    
    if (existingIndex >= 0) {
      // Update existing allocation
      if (amount === 0 && percentage === 0) {
        // Remove allocation if zeroed out
        newAllocations = newAllocations.filter(a => a.name !== name);
      } else if (percentage > 0) {
        // Update allocation
        newAllocations[existingIndex] = { name, amount, receiver_id };
      } else if (amount > 0) {
        // Update allocation
        newAllocations[existingIndex] = { name, amount, receiver_id };
      }
    } else if (amount > 0 || percentage > 0) {
      // Add new allocation
      newAllocations.push({ name, amount, receiver_id });
    }
    
    setAllocations(newAllocations);
    
    // Update total
    const newTotal = newAllocations.reduce((sum, item) => sum + item.amount, 0);
    setTotalAllocated(newTotal);
  };
  
  // Calculate remaining funds
  const remainingFunds = (cause?.goal ?? 0) - (cause?.raised ?? 0);
  const TOTAL_AVAILABLE_FUNDS = (cause?.raised ?? 0);
  
  // Handle distribute button click
  const handleDistribute = () => {
    // Validation check
    if (totalAllocated <= 0) {
      return;
    }
    
    if (totalAllocated > TOTAL_AVAILABLE_FUNDS) {
      return;
    }
    const promises = allocations.map(allocation => {
      console.log(allocation);
      return fetch("http://localhost:8000/disburse", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender_id: 'benefactor-1',
        receiver_id: allocation.receiver_id,
        currency: 'USD',
        amount: allocation.amount
        }),
      }).then(response => response.json()).then(data => {
        return data;
      });
    });
    Promise.all(promises).then((responses: any) => {
      setDistributeStatus(responses);
      setShowConfirmationModal(true);
    });
  };

  return (
    <div style={{
      fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      color: '#333',
      backgroundColor: '#f8f9fa',
      lineHeight: '1.5'
    }}>
      {/* Hero section */}
      <div style={{
        width: '100%',
        height: '250px',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: '30px'
      }}>
        <img 
          src={image[cause?.imageUrl ?? '']} 
          alt="Flood Recovery" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            filter: 'brightness(75%)'
          }}
        />
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 10px 0',
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>{cause?.name || 'Flood Recovery in Louisiana'}</h1>
          <p style={{
            fontSize: '18px',
            margin: '0',
            maxWidth: '700px',
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}>{cause?.description}</p>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <div style={{
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Link to="/" style={{
            color: '#5c6bc0',
            textDecoration: 'none',
            fontSize: '14px'
          }}>Home</Link>
          <span style={{
            margin: '0 10px',
            color: '#999'
          }}>&gt;</span>
          <span style={{
            color: '#666',
            fontSize: '14px'
          }}>Distribute fund</span>
        </div>
  
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            margin: '0',
            color: '#333'
          }}>{cause?.name || 'Flood Recovery in Louisiana'}</h1>
          <button 
            style={{
              backgroundColor: '#5c6bc0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: totalAllocated <= 0 || totalAllocated > TOTAL_AVAILABLE_FUNDS ? 'not-allowed' : 'pointer',
              opacity: totalAllocated <= 0 || totalAllocated > TOTAL_AVAILABLE_FUNDS ? '0.7' : '1',
              transition: 'all 0.2s ease'
            }}
            onClick={handleDistribute}
            disabled={totalAllocated <= 0 || totalAllocated > TOTAL_AVAILABLE_FUNDS}
          >
            Distribute
          </button>
        </div>
  
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease',
            border: '1px solid #f0f0f0'
          }}>
            <p style={{
              margin: '0 0 10px 0',
              fontSize: '14px',
              color: '#666',
              fontWeight: '700'
            }}>Total Raised</p>
            <h2 style={{
              margin: '0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#333'
            }}>$ {(cause?.raised ?? 0).toLocaleString()} USD</h2>
          </div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease',
            border: '1px solid #f0f0f0'
          }}>
            <p style={{
              margin: '0 0 10px 0',
              fontSize: '14px',
              color: '#666',
              fontWeight: '500'
            }}>Total Allocated</p>
            <h2 style={{
              margin: '0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#333'
            }}>$ {totalAllocated.toLocaleString()} USD</h2>
          </div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease',
            border: '1px solid #f0f0f0'
          }}>
            <p style={{
              margin: '0 0 10px 0',
              fontSize: '14px',
              color: '#666',
              fontWeight: '500'
            }}>Avaiable Funds</p>
            <h2 style={{
              margin: '0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#333'
            }}>$ {TOTAL_AVAILABLE_FUNDS.toLocaleString()} USD</h2>
          </div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease',
            border: '1px solid #f0f0f0'
          }}>
            <p style={{
              margin: '0 0 10px 0',
              fontSize: '14px',
              color: '#666',
              fontWeight: '500'
            }}>Goal Remaining</p>
            <h2 style={{
              margin: '0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#333'
            }}>$ {remainingFunds.toLocaleString()} USD</h2>
          </div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease',
            border: '1px solid #f0f0f0'
          }}>
            <p style={{
              margin: '0 0 10px 0',
              fontSize: '14px',
              color: '#666',
              fontWeight: '500'
            }}>Number of Donors</p>
            <h2 style={{
              margin: '0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#333'
            }}>{cause?.donations ?? 0}</h2>
          </div>
        </div>
  
        {/* AI News Section */}
        <section style={{
          marginBottom: '40px'
        }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#333',
            borderBottom: '2px solid #5c6bc0',
            paddingBottom: '8px'
          }}>Latest News</h2>
  
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            <NewsCard 
              source="Al Jazeera"
              time="2 hours ago" 
              title="Severe Flooding Displaces Thousands in Western Kenya"
              content="Torrential rains in the Kisumu region have left thousands homeless, prompting urgent calls for food and shelter. Local aid groups report shortages in clean water and emergency tents."
            />
            <NewsCard 
              source="Reuters"
              time="1 day ago"
              title="Cholera Outbreak Reported in Post-Flood Camps, Uganda"
              content="Following last week's floods, medical NGOs in eastern Uganda confirm a rising number of cholera cases in temporary camps. Clean water access and medical supplies are critically low."
            />
            <NewsCard 
              source="BBC News"
              time="3 days ago"
              title="Infrastructure Collapse Slows Supply Routes in Nairobi Suburbs"
              content="Collapsed roads and damaged infrastructure have slowed aid distribution in outer Nairobi. Relief workers are urging increased localized support from embedded teams."
            />
          </div>
        </section>
  
        {/* Local Charities Section */}
        <section style={{
          marginBottom: '40px'
        }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#333',
            borderBottom: '2px solid #5c6bc0',
            paddingBottom: '8px'
          }}>Local Charities</h2>Administering relief funds for families affected by devastating floods


          
          {totalAllocated > TOTAL_AVAILABLE_FUNDS && (
            <div style={{
              backgroundColor: '#ff6b6b',
              color: 'white',
              padding: '10px 15px',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Warning: You've allocated more than the available funds.
            </div>
          )}
  
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {charities.map(charity => (
              <div key={charity.name} style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                border: '1px solid #f0f0f0',
                transition: 'transform 0.2s ease',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '15px'
                }}>
                  <div>
                    <h3 style={{
                      margin: '0 0 6px 0',
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#333'
                    }}>{charity.name}</h3>
                    <div style={{
                      fontSize: '14px',
                      color: '#666',
                      marginBottom: '10px'
                    }}>{charity.location}</div>
                    <p style={{
                      margin: '0 0 15px 0',
                      fontSize: '15px',
                      color: '#444',
                      lineHeight: '1.5'
                    }}>{charity.description}</p>
                  </div>
                </div>
                <div>
                  <CharityDistributionInput 
                    name={charity.name}
                    receiver_id={charity.receiver_id}
                    maxAmount={TOTAL_AVAILABLE_FUNDS}
                    onChange={handleAllocationChange}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <ConfirmationModal 
        isOpen={showConfirmationModal}
        onClose={handleCloseModal}
        title="Funds Successfully Distributed!!"
        action="Funds Distributed"
        message="— your funds have been distributed to the local charities"
        buttonText="OK"
      />
    </div>
  );
};

export default AdminPage;