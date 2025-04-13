import React, { useEffect, useState, useRef } from 'react';

interface CharityFlowGraphProps {
  data: {
    source: {
      name: string;
      id: string;
    };
    intermediary: {
      name: string;
      id: string;
    };
    destinations: {
      name: string;
      id: string;
      percentage: number;
    }[];
  };
}

const CharityFlowGraph: React.FC<CharityFlowGraphProps> = ({ data }) => {
  const [graphLayout, setGraphLayout] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate a unique ID for this instance to avoid SVG marker conflicts
  const uniqueId = useRef(`graph-${Math.random().toString(36).substr(2, 9)}`);
  
  // Default data if none is provided
  const defaultData = {
    source: {
      name: "Global Charity",
      id: "global-charity"
    },
    intermediary: {
      name: "Global Relief Disaster Response",
      id: "global-relief"
    },
    destinations: [
      {
        name: "Relief Riders Kenya",
        id: "relief-riders",
        percentage: 25
      },
      {
        name: "CleanWater Uganda",
        id: "cleanwater",
        percentage: 20
      },
      {
        name: "ShelterNow Nairobi",
        id: "shelternow",
        percentage: 30
      },
      {
        name: "Mobile Medics Africa",
        id: "mobile-medics",
        percentage: 15
      },
      {
        name: "Unknown Address",
        id: "unknown",
        percentage: 10
      }
    ]
  };

  const graphData = data || defaultData;

  useEffect(() => {
    const calculateLayout = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      // Adjust height based on number of destinations but keep a reasonable minimum
      const containerHeight = Math.max(500, graphData.destinations.length * 100);
      
      // Position Source node on the left side
      const sourceX = Math.max(120, containerWidth * 0.15);
      const sourceY = containerHeight / 2;
      
      // Position Intermediary node in the center
      const intermediaryX = containerWidth / 2;
      const intermediaryY = containerHeight / 2;
      
      // Position Destination nodes on the right side
      const destinationX = Math.min(containerWidth - 120, containerWidth * 0.85);
      const destinationYSpacing = containerHeight / (graphData.destinations.length + 1);
      
      const destinations = graphData.destinations.map((dest, index) => ({
        ...dest,
        x: destinationX,
        y: destinationYSpacing * (index + 1)
      }));
      
      setGraphLayout({
        containerWidth,
        containerHeight,
        source: { ...graphData.source, x: sourceX, y: sourceY },
        intermediary: { ...graphData.intermediary, x: intermediaryX, y: intermediaryY },
        destinations
      });
      setIsLoading(false);
    };
    
    // Set a small timeout to ensure the component is mounted and has correct dimensions
    const timer = setTimeout(() => {
      calculateLayout();
    }, 100);
    
    window.addEventListener('resize', calculateLayout);
    return () => {
      window.removeEventListener('resize', calculateLayout);
      clearTimeout(timer);
    };
  }, [graphData]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '300px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f7fa',
        borderRadius: '10px',
        padding: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '50%',
          borderTop: '4px solid #4f46e5',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (!graphLayout) {
    return (
      <div style={{
        minHeight: '300px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f7fa',
        borderRadius: '10px',
        padding: '20px'
      }}>
        <p>Unable to render graph</p>
      </div>
    );
  }

  const NodeBox = ({ name, x, y, isIntermediary, isSource }: { 
    name: string; 
    x: number; 
    y: number; 
    isIntermediary?: boolean; 
    isSource?: boolean 
  }) => {
    // Responsive width calculation, smaller on mobile
    const width = Math.min(220, graphLayout.containerWidth * 0.25);
    const height = 60;
    
    return (
      <div style={{
        position: 'absolute',
        left: x - width / 2,
        top: y - height / 2,
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isIntermediary ? '#3D4B5C' : isSource ? '#3D4B5C' : 'white',
        color: isIntermediary || isSource ? 'white' : '#3D4B5C',
        border: '2px solid #3D4B5C',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        fontWeight: '600',
        fontSize: width < 180 ? '14px' : '16px',
        textAlign: 'center',
        padding: '8px',
        zIndex: 2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {name}
      </div>
    );
  };

  const Edge = ({ from, to, percentage }: { 
    from: { x: number; y: number }; 
    to: { x: number; y: number }; 
    percentage?: number 
  }) => {
    // Calculate control points for a curved line
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    
    // Calculate line length for placing the percentage label
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate unit vector along the line
    const ux = dx / length;
    const uy = dy / length;
    
    // Place label slightly offset from the midpoint
    const labelX = midX + uy * 15; // Perpendicular offset
    const labelY = midY - ux * 15;
    
    const path = `M ${from.x} ${from.y} Q ${midX} ${midY}, ${to.x} ${to.y}`;
    
    return (
      <>
        <path 
          d={path} 
          stroke="#3D4B5C" 
          strokeWidth="2" 
          fill="none" 
          markerEnd={`url(#${uniqueId.current}-arrowhead)`}
        />
        {percentage !== undefined && (
          <g transform={`translate(${labelX}, ${labelY})`}>
            <rect
              x="-20"
              y="-12"
              width="40"
              height="24"
              rx="12"
              ry="12"
              fill="white"
              stroke="#3D4B5C"
              strokeWidth="1"
            />
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fontWeight="bold"
              fill="#3D4B5C"
            >
              {percentage}%
            </text>
          </g>
        )}
      </>
    );
  };

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        minHeight: '300px',
        height: `${graphLayout.containerHeight}px`, 
        position: 'relative',
        padding: '20px',
        backgroundColor: '#f5f7fa',
        borderRadius: '10px',
        overflow: 'hidden'
      }}
    >
      {/* Source Node */}
      <NodeBox 
        name={graphLayout.source.name} 
        x={graphLayout.source.x} 
        y={graphLayout.source.y}
        isSource={true}
      />
      
      {/* Intermediary Node */}
      <NodeBox 
        name={graphLayout.intermediary.name} 
        x={graphLayout.intermediary.x} 
        y={graphLayout.intermediary.y}
        isIntermediary={true}
      />
      
      {/* Destination Nodes */}
      {graphLayout.destinations.map((dest: any, index: number) => (
        <NodeBox
          key={dest.id}
          name={dest.name}
          x={dest.x}
          y={dest.y}
        />
      ))}
      
      {/* SVG for paths and arrows */}
      <svg style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        zIndex: 1
      }}>
        <defs>
          <marker
            id={`${uniqueId.current}-arrowhead`}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#3D4B5C" />
          </marker>
        </defs>
        
        {/* Edge from Source to Intermediary */}
        <Edge 
          from={graphLayout.source} 
          to={graphLayout.intermediary} 
        />
        
        {/* Edges from Intermediary to Destinations */}
        {graphLayout.destinations.map((dest: any, index: number) => (
          <Edge
            key={dest.id}
            from={graphLayout.intermediary}
            to={dest}
            percentage={dest.percentage}
          />
        ))}
      </svg>
    </div>
  );
};

export default CharityFlowGraph; 