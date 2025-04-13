import React, { useState, useEffect } from 'react';
import './CharityFlowVisualization.css';

// Define interfaces for the data structures
interface Transaction {
  hash: string;
}

interface Edge {
  source: string;
  target: string;
  amount: number;
  label: string;
  rawAmount: string;
  hashes: string[];
}

interface Node {
  id: string;
  name: string;
  level: number;
  totalOutgoing?: number;
  totalIncoming?: number;
}

interface Position {
  x: number;
  y: number;
}

interface EdgePathInfo {
  path: string;
  midpoint: Position;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
  levels: {
    [key: string]: Node[];
  };
}

interface CopyNotification {
  show: boolean;
  text: string;
  isError: boolean;
}

interface MockEdge {
  sender: string;
  sender_id: string;
  sender_name: string;
  receiver: string;
  receiver_id: string;
  receiver_name: string;
  currency: string;
  total_amount: string;
  total_transactions: number;
  hashes: string[];
}

// Add this interface for clicked nodes/edges state
interface ClickedState {
  nodes: Set<string>;
  edges: Set<string>;
}

const CharityFlowVisualization: React.FC<{ graphData?: GraphData }> = ({ graphData: initialGraphData }) => {
  const [loading, setLoading] = useState<boolean>(!initialGraphData);
  const [graphData, setGraphData] = useState<GraphData | null>(initialGraphData || null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  // Add clicked state for nodes and edges
  const [clickedState, setClickedState] = useState<ClickedState>({ 
    nodes: new Set<string>(), 
    edges: new Set<string>() 
  });
  const [copyNotification, setCopyNotification] = useState<CopyNotification>({ 
    show: false, 
    text: '',
    isError: false
  });

  // Functions to handle click state
  const toggleNodeClicked = (nodeId: string): void => {
    setClickedState(prevState => {
      const newNodes = new Set(prevState.nodes);
      if (newNodes.has(nodeId)) {
        newNodes.delete(nodeId);
      } else {
        newNodes.add(nodeId);
      }
      return { ...prevState, nodes: newNodes };
    });
  };

  const toggleEdgeClicked = (edgeId: string): void => {
    setClickedState(prevState => {
      const newEdges = new Set(prevState.edges);
      if (newEdges.has(edgeId)) {
        newEdges.delete(edgeId);
      } else {
        newEdges.add(edgeId);
      }
      return { ...prevState, edges: newEdges };
    });
  };

  // Copy text to clipboard helper function
  const copyToClipboard = (text: string, successMessage: string): void => {
    try {
      // Fallback copy method if clipboard API isn't available
      const fallbackCopy = (textToCopy: string): boolean => {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        
        // Make the textarea out of viewport
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          console.log('Fallback: Copying text command was successful');
        } catch (err) {
          console.error('Fallback: Unable to copy', err);
          return false;
        }
        
        document.body.removeChild(textArea);
        return true;
      };
      
      // Try to use the Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(() => {
            console.log("Text copied to clipboard successfully");
            showNotification(successMessage || 'Copied to clipboard');
          })
          .catch(err => {
            console.warn('Could not copy text with Clipboard API: ', err);
            // Try the fallback method
            if (fallbackCopy(text)) {
              showNotification(successMessage || 'Copied to clipboard');
            } else {
              showNotification('Failed to copy to clipboard', true);
            }
          });
      } else {
        // Clipboard API not available, use fallback
        console.log("Clipboard API not available, using fallback");
        if (fallbackCopy(text)) {
          showNotification(successMessage || 'Copied to clipboard');
        } else {
          showNotification('Failed to copy to clipboard', true);
        }
      }
    } catch (err) {
      console.error('Copy operation failed:', err);
      showNotification('Failed to copy to clipboard', true);
    }
  };
  
  // Helper to show notification
  const showNotification = (message: string, isError: boolean = false): void => {
    setCopyNotification({ 
      show: true, 
      text: message,
      isError: isError
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setCopyNotification({ show: false, text: '', isError: false });
    }, 3000);
  };

  // For a more accurate edge path and better midpoint
  const getEdgePathInfo = (source: Position, target: Position): EdgePathInfo => {
    // Source is on the right side of the starting node
    const sourceX = source.x + 240; // Right side of the source node
    const sourceY = source.y;
    
    // Target is on the left side of the ending node
    const targetX = target.x;
    const targetY = target.y;
    
    // Control points for the bezier curve
    const dx = targetX - sourceX;
    const controlX = sourceX + dx / 2;
    
    // Path - a cubic bezier curve
    const path = `M ${sourceX} ${sourceY} C ${controlX} ${sourceY}, ${controlX} ${targetY}, ${targetX} ${targetY}`;
    
    // True midpoint for a cubic bezier with these control points
    // For this specific type of curve (symmetric control points), the midpoint is simpler
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;
    
    return {
      path,
      midpoint: { x: midX, y: midY }
    };
  };

  useEffect(() => {
    // Update graphData if initialGraphData changes
    if (initialGraphData) {
      // Make sure we have at least two nodes (donor and charity)
      if (initialGraphData.nodes.length > 0) {
        // Find donor node (level 0) and charity node (level 1)
        const donorNode = initialGraphData.nodes.find(node => node.level === 0);
        const charityNode = initialGraphData.nodes.find(node => node.level === 1);
        
        // If we have both donor and charity nodes but no edges, add a default edge
        if (donorNode && charityNode && (initialGraphData.edges.length === 0 || 
            !initialGraphData.edges.some(edge => edge.source === donorNode.id && edge.target === charityNode.id))) {
          
          // Create a modified version of the graph data with the donor-charity edge
          const enhancedGraphData = {
            ...initialGraphData,
            edges: [
              ...initialGraphData.edges,
              {
                source: donorNode.id,
                target: charityNode.id,
                amount: 0,
                label: "Donation Flow",
                rawAmount: "0 RLUSD",
                hashes: ["pending-transaction"]
              }
            ]
          };
          
          setGraphData(enhancedGraphData);
        } else {
          setGraphData(initialGraphData);
        }
      } else {
        setGraphData(initialGraphData);
      }
      
      setLoading(false);
      return;
    }
    
    // Simulate loading data for demo purposes only when no initialGraphData is provided
    const timer = setTimeout(() => {
      // Process the edge list to create graph data
      const mockEdgeList: MockEdge[] = [
        {
          "sender": "rQBsLAh7nQLdRJTJnCapCsbng5Eu8oTUHW",
          "sender_id": "customer-1",
          "sender_name": "Global Relief Fund",
          "receiver": "rMQhytkyM4dwSJkmoAY3qxThRX2M2Py8wc",
          "receiver_id": "customer-2",
          "receiver_name": "Flood Recovery in Louisiana",
          "currency": "RLUSD",
          "total_amount": "6.0 RLUSD",
          "total_transactions": 6,
          "hashes": [
            "8880476EF3514CA212CBC1390BDDE97A67D74333A1ED5AE2B6C073E529A62F94",
            "BA6876140B48F0BDDD4E645D4870AA680F5CEECDE35874A9A2EE02B6934BD46A",
            "E7EBE31578F4F504B78E42A9B98A319321E1F6321A6AAB221D39314918C3E43B",
            "D3915AE1D43F3F6DCA0F5FA8373039EDF5A5D2074CB57F935470363896D917E0",
            "1A56697D0825AD880D0DD566EB508184DB5EA60F67033C1E8E4555A00C23B318",
            "B40242AE5DEBB99CAFAC53CEB8A77BD52CCDE0B6D3069623DCA13283AFB65F6C"
          ]
        },
        {
          "sender": "rQBsLAh7nQLdRJTJnCapCsbng5Eu8oTUHW",
          "sender_id": "customer-1",
          "sender_name": "Global Relief Fund",
          "receiver": "rJcYDNsHc5zAEbnPMj4y27GdbL6k2XvtuX",
          "receiver_id": "customer-4",
          "receiver_name": "Unknown",
          "currency": "RLUSD",
          "total_amount": "1.0 RLUSD",
          "total_transactions": 1,
          "hashes": [
            "841567A8950DE0E65D6F272A235DBDE2426CD45C91FF0D9E71FB0C8FD51C94EC"
          ]
        },
        {
          "sender": "rQBsLAh7nQLdRJTJnCapCsbng5Eu8oTUHW",
          "sender_id": "customer-1",
          "sender_name": "Global Relief Fund",
          "receiver": "rEK9ZdnAxMX3eqvF8HKJdBhftcepK3by55",
          "receiver_id": "customer-3",
          "receiver_name": "Hurricane Harvey Relief",
          "currency": "RLUSD",
          "total_amount": "1.0 RLUSD",
          "total_transactions": 1,
          "hashes": [
            "1DCFE9C4F3DDD57A9B86071E06EED731DAF7F60A1F3BDD8288163F0E555387A7"
          ]
        },
        {
          "sender": "rMQhytkyM4dwSJkmoAY3qxThRX2M2Py8wc",
          "sender_id": "customer-2",
          "sender_name": "Flood Recovery in Louisiana",
          "receiver": "rJcYDNsHc5zAEbnPMj4y27GdbL6k2XvtuX",
          "receiver_id": "customer-4",
          "receiver_name": "Unknown",
          "currency": "RLUSD",
          "total_amount": "1.0 RLUSD",
          "total_transactions": 1,
          "hashes": [
            "CC9A151CDC962ED7ED1890D60E00E792475A21E98DB59F85C41E66F4851E9139"
          ]
        }
      ];

      // Extract unique nodes
      const nodes = new Map<string, Node>();
      mockEdgeList.forEach(edge => {
        if (!nodes.has(edge.sender)) {
          nodes.set(edge.sender, {
            id: edge.sender,
            name: edge.sender_name,
            level: 0,
            totalOutgoing: 0
          });
        }
        
        if (!nodes.has(edge.receiver)) {
          nodes.set(edge.receiver, {
            id: edge.receiver,
            name: edge.receiver_name === "Unknown" ? "Unknown Address" : edge.receiver_name,
            level: 1,
            totalIncoming: 0
          });
        }
      });

      // Calculate total amounts and assign levels
      mockEdgeList.forEach(edge => {
        const amount = parseFloat(edge.total_amount.split(' ')[0]);
        const sourceNode = nodes.get(edge.sender);
        const targetNode = nodes.get(edge.receiver);
        
        if (sourceNode && targetNode) {
          sourceNode.totalOutgoing = (sourceNode.totalOutgoing || 0) + amount;
          targetNode.totalIncoming = (targetNode.totalIncoming || 0) + amount;
        }
      });

      // Create edges with amounts and transaction hashes
      const edges: Edge[] = mockEdgeList.map(edge => {
        const amount = parseFloat(edge.total_amount.split(' ')[0]);
        const currency = edge.total_amount.split(' ')[1] || '';
        
        return {
          source: edge.sender,
          target: edge.receiver,
          amount: amount,
          label: `${amount.toFixed(1)} ${currency}`,
          rawAmount: edge.total_amount,
          hashes: edge.hashes || []
        };
      });

      // Determine node levels (for DAG layout)
      const visited = new Set<string>();
      const assignLevels = (nodeId: string, level: number): void => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        
        const node = nodes.get(nodeId);
        if (node) {
          node.level = Math.max(node.level, level);
          
          mockEdgeList.forEach(edge => {
            if (edge.sender === nodeId) {
              assignLevels(edge.receiver, level + 1);
            }
          });
        }
      };

      // Find root nodes (no incoming edges)
      const hasIncoming = new Set<string>();
      mockEdgeList.forEach(edge => {
        hasIncoming.add(edge.receiver);
      });
      
      // Start with root nodes
      nodes.forEach((node, id) => {
        if (!hasIncoming.has(id)) {
          assignLevels(id, 0);
        }
      });

      // Group nodes by level
      const levels: { [key: string]: Node[] } = {};
      nodes.forEach(node => {
        const levelKey = node.level.toString();
        if (!levels[levelKey]) {
          levels[levelKey] = [];
        }
        levels[levelKey].push(node);
      });

      // Finalize the graph data
      setGraphData({
        nodes: Array.from(nodes.values()),
        edges,
        levels
      });
      
      setLoading(false);
    }, 1500); // Simulate 1.5s loading time

    return () => clearTimeout(timer);
  }, [initialGraphData]);

  // Calculate positions for nodes and edges
  const calculateLayout = (): Record<string, Position> => {
    if (!graphData) return {};
    
    const levelGap = 400; // Increased horizontal gap between levels (was 300)
    const nodeGap = 100; // Vertical gap between nodes in same level
    const nodeWidth = 240;
    const nodeHeight = 60;
    
    // Calculate positions for each node
    const nodePositions: Record<string, Position> = {};
    const levelKeys = Object.keys(graphData.levels).sort((a, b) => parseInt(a) - parseInt(b));
    
    levelKeys.forEach((level, levelIndex) => {
      const nodesInLevel = graphData.levels[level];
      const levelHeight = nodesInLevel.length * nodeHeight + (nodesInLevel.length - 1) * nodeGap;
      const startY = -levelHeight / 2;
      
      nodesInLevel.forEach((node, nodeIndex) => {
        nodePositions[node.id] = {
          x: levelIndex * levelGap,
          y: startY + nodeIndex * (nodeHeight + nodeGap) + nodeHeight / 2
        };
      });
    });
    
    return nodePositions;
  };

  // If we have graph data, render the visualization
  if (graphData) {
    const nodePositions = calculateLayout();
    
    // Type assertion for nodePositions when using Object.values
    const positions = Object.values(nodePositions) as Position[];
    
    const svgWidth = Math.max(
      ...positions.map(pos => pos.x + 240)
    ) + 60;
    
    const svgHeight = Math.max(
      ...positions.map(pos => Math.abs(pos.y) * 2)
    ) + 120;
    
    const viewBoxHeight = Math.max(svgHeight, 400);

    return (
      <div className="fund-flow-visualization">
        {copyNotification.show && (
          <div className={`notification ${copyNotification.isError ? 'error' : 'success'}`}>
            {copyNotification.text}
          </div>
        )}
        
        <div className="overflow-auto">
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 -${viewBoxHeight/2} ${svgWidth} ${viewBoxHeight}`} 
            className="max-w-full"
            style={{ minHeight: '400px' }}
          >
            {/* Render edges */}
            {graphData.edges.map((edge) => {
              const sourcePos = nodePositions[edge.source];
              const targetPos = nodePositions[edge.target];
              
              if (!sourcePos || !targetPos) return null;
              
              const { path, midpoint } = getEdgePathInfo(sourcePos, targetPos);
              const edgeId = `${edge.source}-${edge.target}`;
              const isHovered = hoveredEdge === edgeId;
              const isClicked = clickedState.edges.has(edgeId);
              
              return (
                <g 
                  key={edgeId}
                  onMouseEnter={() => setHoveredEdge(edgeId)}
                  onMouseLeave={() => setHoveredEdge(null)}
                  onClick={() => {
                    toggleEdgeClicked(edgeId);
                    copyToClipboard(edge.hashes.join('\n'), `${edge.hashes.length} transaction hash${edge.hashes.length !== 1 ? 'es' : ''} copied to clipboard`);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <path
                    d={path}
                    fill="none"
                    stroke={isClicked ? "#4f46e5" : isHovered ? "#6366f1" : "#64748b"}
                    strokeWidth={isClicked || isHovered ? "3" : "2"}
                    markerEnd={isClicked ? "url(#arrowhead-clicked)" : isHovered ? "url(#arrowhead-hover)" : "url(#arrowhead)"}
                    style={{
                      transition: "stroke 0.2s, stroke-width 0.2s"
                    }}
                  />
                  {/* Amount label */}
                  <g transform={`translate(${midpoint.x}, ${midpoint.y})`}>
                    <rect
                      x="-40"
                      y="-12"
                      width="80"
                      height="24"
                      rx="4"
                      fill="white"
                      fillOpacity="0.9"
                      stroke={isClicked ? "#4f46e5" : isHovered ? "#6366f1" : "#e2e8f0"}
                      strokeWidth={isClicked || isHovered ? "2" : "1"}
                      style={{
                        transition: "stroke 0.2s, stroke-width 0.2s"
                      }}
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fill={isClicked ? "#4f46e5" : isHovered ? "#6366f1" : "#64748b"}
                      className="text-sm font-medium"
                      style={{
                        transition: "fill 0.2s"
                      }}
                    >
                      {edge.label}
                    </text>
                  </g>
                </g>
              );
            })}
            
            {/* Render nodes */}
            {graphData.nodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;
              
              const level = node.level;
              const isSource = level === 0;
              const isHovered = hoveredNode === node.id;
              const isClicked = clickedState.nodes.has(node.id);
              
              return (
                <g 
                  key={node.id} 
                  transform={`translate(${pos.x}, ${pos.y - 30})`}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => {
                    toggleNodeClicked(node.id);
                    copyToClipboard(node.id, `Wallet address copied to clipboard`);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x="0"
                    y="0"
                    width="240"
                    height="60"
                    rx="8"
                    ry="8"
                    fill={isSource 
                      ? isClicked ? "#4338ca" : isHovered ? "#4f46e5" : "#6366f1" 
                      : isClicked ? "#eef2ff" : isHovered ? "#f1f5f9" : "#fff"}
                    stroke={isClicked ? "#4338ca" : isHovered ? "#4f46e5" : "#e2e8f0"}
                    strokeWidth={isClicked || isHovered ? "3" : "2"}
                    style={{
                      transition: "fill 0.2s, stroke 0.2s, stroke-width 0.2s"
                    }}
                  />
                  <text
                    x="120"
                    y="30"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill={isSource ? "#fff" : isClicked ? "#4338ca" : isHovered ? "#4f46e5" : "#64748b"}
                    fontWeight="500"
                    className="text-base"
                    style={{
                      transition: "fill 0.2s"
                    }}
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
            
            {/* Node hover tooltips - rendered at the end to stay on top */}
            {graphData.nodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;
              
              const isHovered = hoveredNode === node.id;
              const level = node.level;
              const isSource = level === 0;
              // Adjust x position for leftmost nodes to prevent overflow
              const tooltipX = isSource ? Math.max(pos.x, 40) : pos.x - 40;
              
              return isHovered ? (
                <foreignObject
                  key={`tooltip-${node.id}`}
                  x={tooltipX}
                  y={pos.y - 100}
                  width="320"
                  height="80"
                  style={{ pointerEvents: "none", zIndex: 1000 }}
                >
                  <div className="node-tooltip">
                    <div className="node-name">{node.name}</div>
                    <div className="address">{node.id}</div>
                    <div className="instruction">Click to copy address</div>
                    {node.totalOutgoing !== undefined && (
                      <div className="node-stats">Outgoing: {node.totalOutgoing.toFixed(2)}</div>
                    )}
                    {node.totalIncoming !== undefined && (
                      <div className="node-stats">Incoming: {node.totalIncoming.toFixed(2)}</div>
                    )}
                  </div>
                </foreignObject>
              ) : null;
            })}
            
            {/* Edge hover tooltips - rendered at the end to stay on top */}
            {graphData.edges.map((edge) => {
              const sourcePos = nodePositions[edge.source];
              const targetPos = nodePositions[edge.target];
              
              if (!sourcePos || !targetPos) return null;
              
              const { midpoint } = getEdgePathInfo(sourcePos, targetPos);
              const edgeId = `${edge.source}-${edge.target}`;
              const isHovered = hoveredEdge === edgeId;
              
              // Find source and target node names
              const sourceNode = graphData.nodes.find(n => n.id === edge.source);
              const targetNode = graphData.nodes.find(n => n.id === edge.target);
              const sourceName = sourceNode ? sourceNode.name : 'Unknown';
              const targetName = targetNode ? targetNode.name : 'Unknown';
              
              // Check if this is a real transaction or just a display edge
              const isPendingTransaction = edge.hashes.length === 1 && edge.hashes[0] === 'pending-transaction';
              
              return isHovered ? (
                <foreignObject
                  key={`tooltip-${edge.source}-${edge.target}`}
                  x={midpoint.x + 50}
                  y={midpoint.y - 15 - (isPendingTransaction ? 0 : edge.hashes.length * 20)}
                  width="360"
                  height={isPendingTransaction ? 100 : (edge.hashes.length * 28 + 100)}
                  style={{ pointerEvents: "none", zIndex: 1000 }}
                >
                  <div className="edge-tooltip">
                    <div className="title">{sourceName} → {targetName}</div>
                    <div className="amount">{edge.rawAmount}</div>
                    
                    {isPendingTransaction ? (
                      <div className="pending-message">
                        No transactions recorded yet. Make a donation to see transaction details.
                      </div>
                    ) : (
                      <>
                        <div className="title">Transaction Hashes:</div>
                        <div className="hash-list">
                          {edge.hashes.map((hash, index) => (
                            <div key={index} className="hash">{hash}</div>
                          ))}
                        </div>
                        <div className="instruction">Click to copy all transaction hashes</div>
                      </>
                    )}
                  </div>
                </foreignObject>
              ) : null;
            })}
            
            {/* Arrow marker definitions */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
              </marker>
              <marker
                id="arrowhead-hover"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
              </marker>
              <marker
                id="arrowhead-clicked"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#4f46e5" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>
    );
  }

  // Return loading state if data isn't ready
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">Loading visualization...</p>
      </div>
    );
  }

  return null;
};

export default CharityFlowVisualization;