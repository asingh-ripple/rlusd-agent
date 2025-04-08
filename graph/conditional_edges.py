"""
Conditional Edge Functions for Workflow Control

This module contains functions that determine the flow of the workflow based on the current state.
These functions are used to make decisions about whether to continue processing or generate a final response.
"""

from config.logger_config import setup_logger
# Configure logging
logger = setup_logger(__name__)

def should_continue(state) -> str:
    # Get the last message from the conversation history
    messages = state["messages"]
    last_message = messages[-1]
    
    # Check if we need more information or can generate the final response
    if not last_message.tool_calls:
        logger.info("DECISION: No more tool calls needed, proceeding to response")
        return "respond"
    else:
        logger.info("DECISION: More tool calls needed, continuing")
        return "continue" 