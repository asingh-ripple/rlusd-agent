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
      const containerHeight = Math.max(400, graphData.destinations.length * 90);
      
      // Position Source node on the left side (about 20% of the width)
      const sourceX = containerWidth * 0.2;
      const sourceY = containerHeight / 2;
      
      // Position Intermediary node in the center
      const intermediaryX = containerWidth * 0.5;
      const intermediaryY = containerHeight / 2;
      
      // Position Destination nodes on the right side (about 80% of the width)
      const destinationX = containerWidth * 0.8;
      
      // Calculate spacing between destinations
      const destinationYStart = containerHeight * 0.1;
      const destinationYEnd = containerHeight * 0.9;
      const destinationYRange = destinationYEnd - destinationYStart;
      const destinationYStep = destinationYRange / (graphData.destinations.length - 1 || 1);
      
      const destinations = graphData.destinations.map((dest, index) => ({
        ...dest,
        x: destinationX,
        y: destinationYStart + (index * destinationYStep)
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

  const NodeBox = ({ name, x, y, isIntermediary, isSource, isDestination }: { 
    name: string; 
    x: number; 
    y: number; 
    isIntermediary?: boolean; 
    isSource?: boolean;
    isDestination?: boolean;
  }) => {
    // Different sizes for different types of nodes
    let width = 220;
    let height = 60;
    
    if (isSource) {
      width = 200;
      height = 60;
    } else if (isIntermediary) {
      width = 220;
      height = 100;
    } else if (isDestination) {
      width = 220;
      height = 50;
    }
    
    return (
      <div style={{
        position: 'absolute',
        left: x - width / 2,
        top: y - height / 2,
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: isDestination ? '8px' : '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isIntermediary || isSource ? '#3D4B5C' : 'white',
        color: isIntermediary || isSource ? 'white' : '#3D4B5C',
        border: '2px solid #3D4B5C',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        fontWeight: '600',
        fontSize: '16px',
        textAlign: 'center',
        padding: '8px',
        zIndex: 2,
        whiteSpace: 'pre-wrap'
      }}>
        {name}
      </div>
    );
  };

  const Edge = ({ from, to, percentage, isSourceToIntermediary }: { 
    from: { x: number; y: number }; 
    to: { x: number; y: number }; 
    percentage?: number;
    isSourceToIntermediary?: boolean;
  }) => {
    // For source to intermediary connection - straight line with a small bend
    if (isSourceToIntermediary) {
      const midX = (from.x + to.x) / 2;
      const path = `M ${from.x} ${from.y} H ${midX} L ${to.x} ${to.y}`;
      
      return (
        <path 
          d={path} 
          stroke="#3D4B5C" 
          strokeWidth="2" 
          fill="none" 
          markerEnd={`url(#${uniqueId.current}-arrowhead)`}
        />
      );
    }
    
    // For intermediary to destination connections
    // Horizontal line with bend near the end
    const midX = to.x - 25; // Bend point closer to destination
    
    // Path that creates a horizontal line with a bend
    const path = `M ${from.x} ${from.y} H ${midX} L ${to.x} ${to.y}`;
    
    // Calculate position for percentage label
    const labelX = from.x + (to.x - from.x) * 0.65; // Position label at 65% along the horizontal path
    const labelY = from.y + (to.y - from.y) * 0.4; 
    
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
        minHeight: '400px',
        height: `${graphLayout.containerHeight}px`, 
        position: 'relative',
        padding: '20px',
        backgroundColor: '#f5f7fa',
        borderRadius: '10px',
        overflow: 'hidden'
      }}
    >
      {/* SVG for paths and arrows - placed first so it's under the nodes */}
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
          isSourceToIntermediary={true}
        />
        
        {/* Edges from Intermediary to Destinations */}
        {graphLayout.destinations.map((dest: any) => (
          <Edge
            key={dest.id}
            from={graphLayout.intermediary}
            to={dest}
            percentage={dest.percentage}
          />
        ))}
      </svg>
      
      {/* Source Node */}
      <NodeBox 
        name={graphLayout.source.name} 
        x={graphLayout.source.x} 
        y={graphLayout.source.y}
        isSource={true}
      />
      
      {/* Intermediary Node - multi-line text */}
      <NodeBox 
        name={graphLayout.intermediary.name.replace(' ', '\n')} 
        x={graphLayout.intermediary.x} 
        y={graphLayout.intermediary.y}
        isIntermediary={true}
      />
      
      {/* Destination Nodes */}
      {graphLayout.destinations.map((dest: any) => (
        <NodeBox
          key={dest.id}
          name={dest.name}
          x={dest.x}
          y={dest.y}
          isDestination={true}
        />
      ))}
    </div>
  );
};

export default CharityFlowGraph; 