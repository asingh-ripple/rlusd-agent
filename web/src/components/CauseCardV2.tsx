import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, calculatePercentage, image } from '../utils/helpers';
import './CauseCard.css';

// Import the Cause interface
interface Cause {
  cause_id: string;
  name: string;
  description: string;
  goal: number;
  raised: number;
  donations: number;
  imageUrl: string;
  category: string;
}

interface CauseCardProps {
  cause: Cause;
  expanded?: boolean;
}

// Define proper TypeScript types for styles
interface StylesType {
  container: React.CSSProperties;
  card: React.CSSProperties;
  cardHover: React.CSSProperties;
  cardExpanded: React.CSSProperties;
  imageContainer: React.CSSProperties;
  image: React.CSSProperties;
  imageHover: React.CSSProperties;
  categoryTag: React.CSSProperties;
  categoryLabel: React.CSSProperties;
  contentContainer: React.CSSProperties;
  title: React.CSSProperties;
  titleCollapsed: React.CSSProperties;
  titleExpanded: React.CSSProperties;
  descriptionContainer: React.CSSProperties;
  descriptionContainerCollapsed: React.CSSProperties;
  descriptionContainerExpanded: React.CSSProperties;
  description: React.CSSProperties;
  descriptionCollapsed: React.CSSProperties;
  toggleButton: React.CSSProperties;
  progressContainer: React.CSSProperties;
  progressInfo: React.CSSProperties;
  progressPercentage: React.CSSProperties;
  progressRatio: React.CSSProperties;
  progressBar: React.CSSProperties;
  progressFill: React.CSSProperties;
  statsContainer: React.CSSProperties;
  donationsContainer: React.CSSProperties;
  donationsNumber: React.CSSProperties;
  donationsLabel: React.CSSProperties;
  detailsButton: React.CSSProperties;
  detailsButtonHover: React.CSSProperties;
  smallScreen: {
    container: React.CSSProperties;
    imageContainer: React.CSSProperties;
    contentContainer: React.CSSProperties;
    title: React.CSSProperties;
  };
  mediumScreen: {
    container: React.CSSProperties;
  };
  largeScreen: {
    container: React.CSSProperties;
  };
}

const styles: StylesType = {
  container: {
    maxWidth: "100%",
    margin: "0 auto",
    padding: "0 15px"
  },
  card: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    display: "flex",
    flexDirection: "column" as "column", // Type cast for TypeScript
    height: "100%"
  },
  cardHover: {
    transform: "translateY(-5px)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
  },
  cardExpanded: {
    zIndex: "10",
    position: "relative"
  },
  imageContainer: {
    height: "180px",
    overflow: "hidden",
    position: "relative",
    flexShrink: 0
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s ease"
  },
  imageHover: {
    transform: "scale(1.05)"
  },
  categoryTag: {
    position: "absolute",
    top: "12px",
    left: "12px",
    zIndex: "2"
  },
  categoryLabel: {
    backgroundColor: "rgba(79, 70, 229, 0.9)",
    color: "white",
    fontSize: "0.75rem",
    fontWeight: "600",
    padding: "0.25rem 0.75rem",
    borderRadius: "999px",
    display: "inline-block",
    backdropFilter: "blur(4px)"
  },
  contentContainer: {
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column" as "column", // Type cast for TypeScript
    flexGrow: 1,
    position: "relative",
    justifyContent: "space-between",
    gap: "0.75rem"
  },
  title: {
    fontSize: "1.125rem",
    fontWeight: "700",
    color: "#111827",
    lineHeight: "1.3",
    margin: "0",
    transition: "height 0.3s ease, max-height 0.3s ease"
  },
  titleCollapsed: {
    display: "-webkit-box",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxHeight: "2.8rem"
  },
  titleExpanded: {
    maxHeight: "none",
    overflow: "visible"
  },
  descriptionContainer: {
    position: "relative",
    transition: "max-height 0.3s ease",
    flexGrow: 1
  },
  descriptionContainerCollapsed: {
    maxHeight: "4.5rem",
    overflow: "hidden",
    marginBottom: "0"
  },
  descriptionContainerExpanded: {
    maxHeight: "500px"
  },
  description: {
    fontSize: "0.875rem",
    color: "#6b7280",
    lineHeight: "1.5",
    margin: "0 0 10px 0",
    transition: "opacity 0.2s ease"
  },
  descriptionCollapsed: {
    display: "-webkit-box",
    WebkitLineClamp: "3",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  toggleButton: {
    background: "none",
    border: "none",
    color: "#4f46e5",
    fontSize: "0.75rem",
    fontWeight: "600",
    padding: "0",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    display: "block",
    marginTop: "5px",
    textAlign: "left"
  },
  progressContainer: {
    marginBottom: "0.75rem"
  },
  progressInfo: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
    fontSize: "0.75rem"
  },
  progressPercentage: {
    fontWeight: "600",
    color: "#4f46e5"
  },
  progressRatio: {
    color: "#6b7280"
  },
  progressBar: {
    height: "0.4rem",
    backgroundColor: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4f46e5",
    borderRadius: "999px",
    minWidth: "2%"
  },
  statsContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "0.75rem",
    borderTop: "1px solid #e5e7eb",
    marginTop: "0.5rem"
  },
  donationsContainer: {
    display: "flex",
    flexDirection: "column" as "column" // Type cast for TypeScript
  },
  donationsNumber: {
    fontWeight: "700",
    fontSize: "1rem",
    color: "#111827",
    lineHeight: "1.2"
  },
  donationsLabel: {
    fontSize: "0.7rem",
    color: "#6b7280"
  },
  detailsButton: {
    display: "inline-block",
    backgroundColor: "#4f46e5",
    color: "white",
    textAlign: "center",
    padding: "0.4rem 0.75rem",
    fontSize: "0.7rem",
    fontWeight: "600",
    borderRadius: "0.25rem",
    textDecoration: "none",
    transition: "background-color 0.2s",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    whiteSpace: "nowrap"
  },
  detailsButtonHover: {
    backgroundColor: "#4338ca"
  },
  // Media query styles defined as objects
  smallScreen: {
    container: {
      padding: "0 10px"
    },
    imageContainer: {
      height: "150px"
    },
    contentContainer: {
      padding: "1rem"
    },
    title: {
      fontSize: "1rem"
    }
  },
  mediumScreen: {
    container: {
      maxWidth: "450px"
    }
  },
  largeScreen: {
    container: {
      maxWidth: "500px"
    }
  }
};

const CauseCardV2: React.FC<CauseCardProps> = ({ cause, expanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  // Update window width on resize
  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Get responsive styles based on window width
  const getResponsiveStyles = () => {
    if (windowWidth < 480) {
      return styles.smallScreen;
    } else if (windowWidth < 768) {
      return styles.mediumScreen;
    } else {
      return styles.largeScreen;
    }
  };
  
  const responsiveStyles = getResponsiveStyles();
  const progressPercentage = calculatePercentage(cause.raised, cause.goal);
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Use the image helper for proper image handling
  const imageUrl = image[cause.imageUrl] || cause.imageUrl;
  
  return (
    <div style={{
      ...styles.container,
      ...(responsiveStyles.container || {})
    }}>
      <div 
        style={{
          ...styles.card,
          ...(isExpanded ? styles.cardExpanded : {}),
          ...(isHovered ? styles.cardHover : {})
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image section */}
        <div style={{
          ...styles.imageContainer,
          // ...(responsiveStyles.imageContainer || {})
        }}>
          <img 
            src={imageUrl} 
            alt={cause.name}
            style={{
              ...styles.image,
              ...(isHovered ? styles.imageHover : {})
            }}
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = '/images/causes/placeholder.svg';
              setImageError(true);
            }}
          />
          <div style={styles.categoryTag}>
            <span style={styles.categoryLabel}>{cause.category}</span>
          </div>
        </div>
        
        {/* Content section */}
        <div style={{
          ...styles.contentContainer,
          // ...(responsiveStyles.contentContainer || {})
        }}>
          <h3 style={{
            ...styles.title,
            // ...(responsiveStyles.title || {}),
            ...(isExpanded ? styles.titleExpanded : styles.titleCollapsed)
          }}>
            {cause.name}
          </h3>
          
          {/* Description with expand/collapse functionality */}
          <div style={{
            ...styles.descriptionContainer,
            ...(isExpanded ? styles.descriptionContainerExpanded : styles.descriptionContainerCollapsed)
          }}>
            <p style={{
              ...styles.description,
              ...(isExpanded ? {} : styles.descriptionCollapsed)
            }}>
              {cause.description}
            </p>
            
            {cause.description.length > 120 && (
              <button 
                style={styles.toggleButton}
                onClick={toggleExpand}
                aria-label={isExpanded ? "Show less" : "Show more"}
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
          
          {/* Progress bar */}
          <div style={styles.progressContainer}>
            <div style={styles.progressInfo}>
              <span style={styles.progressPercentage}>{Math.round(progressPercentage)}% funded</span>
              <span style={styles.progressRatio}>{formatCurrency(cause.raised)} of {formatCurrency(cause.goal)}</span>
            </div>
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: `${progressPercentage}%`
                }}
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>
          
          {/* Stats and CTA */}
          <div style={styles.statsContainer}>
            <div style={styles.donationsContainer}>
              <span style={styles.donationsNumber}>{cause.donations}</span>
              <span style={styles.donationsLabel}>Donations</span>
            </div>
            <Link 
              to={`/causes/${cause.cause_id}`} 
              style={{
                ...styles.detailsButton,
                ...(isHovered ? styles.detailsButtonHover : {})
              }}
            >
              VIEW DETAILS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CauseCardV2;