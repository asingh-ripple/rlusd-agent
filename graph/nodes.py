"""Node Functions for Disaster Monitoring Workflow

This module contains the core node functions that process messages through the LLM:
- call_model: Processes messages and makes tool calls to gather information
- respond: Generates the final structured response

The module initializes three LLM models with different capabilities:
- Base model for general processing
- Tool-enabled model for disaster analysis
- Structured output model for final response formatting
"""

from langchain_core.messages import HumanMessage, SystemMessage
from models.agent_models import DisasterResponse
from tools.disaster_analysis_tools import all_disaster_analyzers
from config.prompts import NEWS_SYSTEM_PROMPT, STRUCTURED_RESPONSE_PROMPT, VALIDATION_PROMPT
from config.llm_config import get_configured_llm
from config.logger_config import setup_logger

logger = setup_logger(__name__)

# Initialize LLM
logger.info("Initializing LLM...")
model = get_configured_llm()

# Model that can use disaster analysis tools
logger.info("Binding tools to model...")
model_with_tools = model.bind_tools(all_disaster_analyzers)

# Model that outputs structured data
model_with_structured_output = model.with_structured_output(DisasterResponse)

# Validation model
validation_model = model.with_structured_output(DisasterResponse)

def call_model(state):
    """Process the current state through the model."""
    # Add system prompt for first-time initialization
    if len(state["messages"]) == 1:
        logger.info("INITIALIZATION: Adding system message for severity analysis")
        system_message = SystemMessage(content=NEWS_SYSTEM_PROMPT)
        state["query"] = state["messages"][0].content
        state["messages"].insert(0, system_message)
    
    logger.info("ACTION: Starting model analysis...")
    response = model_with_tools.invoke(state["messages"])
     
    # Log any tool calls made by the model
    if hasattr(response, 'tool_calls') and response.tool_calls:
        for tool_call in response.tool_calls:
            if isinstance(tool_call, dict):
                logger.info(f"TOOL CALLED- {tool_call.get('name', 'unknown')}({tool_call.get('arguments', '')})")
            else:
                logger.info(f"- {tool_call}")
    return {"messages": [response]}


def respond(state):
    """Generate the final structured response."""
    logger.info("ACTION: Generating structured response")
    logger.info("REASON: Converting model analysis to structured format")
    
    # Use structured output model to format the final response
    structured_prompt = SystemMessage(content=STRUCTURED_RESPONSE_PROMPT)
    response = model_with_structured_output.invoke(
        [structured_prompt, HumanMessage(content=state["messages"][-2].content)]
    )

    return {"final_response": response}


def validate(state):
    """Validate the final response."""
    logger.info("ACTION: Validating response")
    logger.info("REASON: Ensuring response is valid")
    validation_prompt = SystemMessage(content=VALIDATION_PROMPT)
    
    # Get the query from the state, fallback to the 2nd message if not present
    # since the first message is the system message
    query = state.get("query")
    if query is None and state["messages"]:
        query = state["messages"][1].content
    
    logger.info(f"QUERY: {query}")
    
    # Create a validation message that includes the query date
    validation_message = f"""Original Query: {query}
    Query Date: {query.query_date}
    Response to validate: {state['final_response'].__str__()}"""
        
    response = validation_model.invoke(
        [validation_prompt, HumanMessage(content=validation_message)]
    )
    logger.info(f"VALIDATION RESPONSE: {response}")
    return {"final_response": response}