// AdminPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

// Define interfaces for component props
interface NewsCardProps {
  source: string;
  time: string;
  title: string;
  content: string;
}

interface CharityCardProps {
  name: string;
}

// News Card Component
const NewsCard: React.FC<NewsCardProps> = ({ source, time, title, content }) => {
  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          marginBottom: '15px' 
        }}>
          {title}
        </h3>
        <div style={{ 
          color: '#666', 
          fontSize: '12px', 
          marginBottom: '10px' 
        }}>
          {source} • {time}
        </div>
        <p style={{ 
          fontSize: '14px', 
          lineHeight: '1.5', 
          color: '#333' 
        }}>
          {content}
        </p>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '15px'
      }}>
        {/* <FiExternalLink style={{ fontSize: '18px' }} /> */}
      </div>
    </div>
  );
};

// Charity Card Component
const CharityCard: React.FC<CharityCardProps> = ({ name }) => {
  return (
    <div style={{
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: '20px',
      marginBottom: '20px'
    }}>
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: 'bold', 
        marginBottom: '15px' 
      }}>
        {name}
      </h3>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '15px'
      }}>
        <div style={{ flex: 1 }}>
          <p style={{ 
            fontSize: '14px', 
            marginBottom: '5px' 
          }}>
            Amount
          </p>
          <div style={{ 
            height: '35px', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '4px' 
          }}></div>
        </div>
        <div style={{ width: '60px' }}>
          <p style={{ 
            fontSize: '14px', 
            marginBottom: '5px' 
          }}>
            %
          </p>
          <div style={{ 
            height: '35px', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '4px' 
          }}></div>
        </div>
      </div>
    </div>
  );
};

// Pagination Component
const Pagination: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: '10px',
      margin: '20px 0'
    }}>
      <select 
        style={{
          padding: '5px 10px',
          borderRadius: '4px',
          border: '1px solid #ccc'
        }}
        defaultValue="1"
      >
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
      </select>
      <span style={{ color: '#666', fontSize: '14px' }}>of 4 pages</span>
      <button style={{
        border: '1px solid #ccc',
        backgroundColor: 'white',
        width: '30px',
        height: '30px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}>
        &gt;
      </button>
      <button style={{
        border: '1px solid #ccc',
        backgroundColor: 'white',
        width: '30px',
        height: '30px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}>
        &raquo;
      </button>
    </div>
  );
};

const AdminPage: React.FC = () => {
    return (
      <div>
        <div style={{ padding: '20px 5%' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            marginBottom: '15px'
          }}>
            <Link to="/" style={{ 
              color: '#666', 
              textDecoration: 'none', 
              fontSize: '14px'
            }}>
              Home
            </Link>
            <span style={{ color: '#666' }}>&gt;</span>
            <span style={{ 
              color: '#333', 
              fontSize: '14px'
            }}>
              Distribute fund
            </span>
          </div>
  
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px'
          }}>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold' 
            }}>
              Global Relief Disaster Response
            </h1>
            <button style={{
              backgroundColor: '#7f8c8d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              DISTRIBUTE
            </button>
          </div>
  
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '30px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '40px',
            marginBottom: '40px'
          }}>
            <div>
              <p style={{ 
                color: '#666', 
                fontSize: '16px', 
                marginBottom: '10px' 
              }}>
                Total Raised
              </p>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold' 
              }}>
                $ 24,850 USD
              </h2>
            </div>
            <div>
              <p style={{ 
                color: '#666', 
                fontSize: '16px', 
                marginBottom: '10px' 
              }}>
                Total Distributed
              </p>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold' 
              }}>
                $ 0 USD
              </h2>
            </div>
            <div>
              <p style={{ 
                color: '#666', 
                fontSize: '16px', 
                marginBottom: '10px' 
              }}>
                Remaining
              </p>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold' 
              }}>
                $ 24,850 USD
              </h2>
            </div>
            <div>
              <p style={{ 
                color: '#666', 
                fontSize: '16px', 
                marginBottom: '10px' 
              }}>
                Number of Donor
              </p>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold' 
              }}>
                124
              </h2>
            </div>
          </div>
  
          {/* AI News Section */}
          <section>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold',
              marginBottom: '15px'
            }}>
              Keep you up to date with AI
            </h2>
            <p style={{ 
              fontSize: '16px', 
              color: '#555',
              marginBottom: '30px'
            }}>
              AI-curated news helps you make smarter funding decisions by surfacing real-time events, local risks, and emerging needs — so you can allocate support where it matters most.
            </p>
  
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              marginBottom: '20px'
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
  
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <div style={{ color: '#666', fontSize: '14px' }}>
                12 Results
              </div>
              <Pagination />
            </div>
          </section>
  
          {/* Local Charities Section */}
          <section style={{ marginTop: '40px' }}>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold',
              marginBottom: '30px'
            }}>
              Local charity that is ready to action
            </h2>
  
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '30px'
            }}>
              <CharityCard name="Relief Riders Kenya" />
              <CharityCard name="CleanWater Uganda" />
              <CharityCard name="ShelterNow Nairobi" />
              <CharityCard name="Mobile Medics Africa" />
              <CharityCard name="SafeStart Philippines" />
              <CharityCard name="FoodForward Colombia" />
              <CharityCard name="Hands for Hope Nepal" />
              <CharityCard name="EquipDR Haiti" />
              <CharityCard name="RebuildTogether Morocco" />
            </div>
          </section>
        </div>
      </div>
    );
  };

export default AdminPage;