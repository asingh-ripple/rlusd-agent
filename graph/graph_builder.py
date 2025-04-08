"""Graph Builder for Disaster Monitoring System

This module constructs the graph that orchestrates the disaster monitoring process:
- Defines the nodes (agent, respond, tools) and their connections
- Sets up conditional edges to control the flow between nodes
- Generates a visual representation of the graph

The graph follows this pattern:
1. Agent node processes messages and decides whether to use tools
2. Tools node executes disaster analysis tools when needed
3. Respond node generates the final structured assessment
"""

from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from tools.disaster_analysis_tools import all_disaster_analyzers
from models.agent_models import AgentState
from .nodes import call_model, respond, validate
from .conditional_edges import should_continue
import os
import logging

# Set up logging
logger = logging.getLogger(__name__)

def build_graph(generate_visualization=False):
    """Create and return the graph.
    
    Args:
        generate_visualization (bool): Whether to generate a visual representation of the graph.
                                     Defaults to False to avoid timeouts.
    
    Returns:
        The compiled graph.
    """
    # Define state that the graph will use
    graph_builder = StateGraph(AgentState)

    # Add nodes to the graph
    graph_builder.add_node("agent", call_model)
    graph_builder.add_node("respond", respond)
    graph_builder.add_node("tools", ToolNode(all_disaster_analyzers))
    graph_builder.add_node("validate", validate)
    # Set the entry point
    graph_builder.set_entry_point("agent")

    # Add conditional edges to define the graph
    graph_builder.add_conditional_edges(
        "agent",
        should_continue,
        {
            "continue": "tools",
            "respond": "respond",
        }
    )

    # Add remaining edges to complete the graph
    graph_builder.add_edge("tools", "agent")
    graph_builder.add_edge("respond", "validate")
    graph_builder.add_edge("validate", END)
    graph = graph_builder.compile()

    # Generate and save the graph visualization if requested
    if generate_visualization:
        try:
            # Create charts directory if it doesn't exist
            os.makedirs("charts", exist_ok=True)
            
            # Generate the visualization
            png_bytes = graph.get_graph().draw_mermaid_png()
            
            # Save the visualization
            with open("charts/disaster_monitor_workflow.png", "wb") as f:
                f.write(png_bytes)
                
            logger.info("Successfully generated workflow visualization")
        except Exception as e:
            logger.warning(f"Failed to generate workflow visualization: {str(e)}")
            logger.warning("Continuing without visualization")
    
    return graph