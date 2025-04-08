from datetime import datetime, timedelta
import json
import logging
import sys

from temporalio import workflow, activity
from temporalio.common import RetryPolicy
from temporalio.workflow import execute_activity, start_activity

# Import from project root
from utils.utils import ensure_json_serializable, requires_aid_transfer
from .workflow_models import DisasterQuery
from config.logger_config import setup_logger


# ============================================================================
# LOGGING SETUP
# ============================================================================
# Configure logging for the workflow module
logger = setup_logger(__name__)

# Suppress httpx logs
logging.getLogger("httpx").setLevel(logging.WARNING)

# Set up logging for activities
disaster_activity_logger = setup_logger("analyze_disaster_activity")
blockchain_activity_logger = setup_logger("blockchain_activity")
# ============================================================================
# WORKFLOW DEFINITION
# ============================================================================
# The workflow is the main orchestrator of the disaster analysis process.
# It defines the steps and logic for processing a disaster query.

@workflow.defn
class DisasterMonitorWorkflow:
    """
    Temporal workflow for disaster management analysis.
    
    This workflow orchestrates the disaster analysis process:
    1. Receives a disaster query
    2. Executes the analysis activity
    3. Returns the structured analysis result
    4. Optionally starts an XRPL check transaction based on validation conditions
    
    The workflow is deterministic and can be retried if it fails.
    """
    def __init__(self):
        logger = setup_logger("disaster_workflow")
        
    @workflow.run
    async def run(self, query: DisasterQuery) -> dict:
        """Main workflow execution."""
        try:
            logger.info(f"Starting workflow for customer {query.customer_id}")
            
            # Execute the disaster analysis activity and get the result
            analysis_result = await execute_activity(
                analyze_disaster_activity,
                query,
                start_to_close_timeout=timedelta(minutes=5)
            )

            logger.info(f"ANALYSIS RESULT: {analysis_result}")
            
            # Start the XRPL check transaction as a separate activity
            # This will run after the analysis result is returned
            try:
                await start_activity(
                    blockchain_activity,
                    args=[query, analysis_result],  # Pass arguments as a list
                    start_to_close_timeout=timedelta(seconds=300),
                    retry_policy=RetryPolicy(
                        initial_interval=timedelta(seconds=1),
                        maximum_interval=timedelta(seconds=10),
                        maximum_attempts=3
                    )
                )
            except Exception as e:
                logger.error(f"Failed to start blockchain activity: {str(e)}")
            
            # Return the analysis result immediately
            return analysis_result
            
        except Exception as e:
            logger.error(f"Workflow failed: {str(e)}")
            raise

# ============================================================================
# ACTIVITY DEFINITION
# ============================================================================
# Activities are the actual work units in a Temporal workflow.
# They perform the specific tasks needed for disaster analysis.

@activity.defn
async def analyze_disaster_activity(query: DisasterQuery) -> dict:
    """
    Activity that performs the actual disaster analysis.
    
    This activity:
    1. Imports the necessary LangChain modules
    2. Builds the workflow graph
    3. Processes the query
    4. Returns the structured analysis result
    
    Args:
        query (DisasterQuery): The disaster analysis query
        
    Returns:
        dict: The structured analysis result
    """
    try:
        disaster_activity_logger.info(f"Starting disaster analysis for customer {query.customer_id} at location: {query.location}")
        
        # Set the query date in the format yyyy-mm-dd
        query.query_date = datetime.now().strftime("%Y-%m-%d")
        
        # Import LangChain modules here in the activity
        from langchain_core.messages import HumanMessage
        from graph import build_graph
        from models.agent_models import DisasterResponse
        
        disaster_activity_logger.info("Successfully imported LangChain and LangGraph modules")
        
        # Initialize the LangGraph workflow with visualization disabled
        disaster_agent = build_graph(generate_visualization=False)
        disaster_activity_logger.info("Successfully created LangGraph workflow")
        
        # Create the full query with location context
        full_query = f"Customer ID: {query.customer_id}\nLocation: {query.location}\nQuery: {query.query}"
        disaster_activity_logger.info(f"Processing query: {full_query}")
        
        # Run the LangGraph workflow
        agent_result = disaster_agent.invoke(
            input={
                "messages": [HumanMessage(content=full_query)],
                "query": query,
                "final_response": None
            }
        )
        
        # Extract the final response from the workflow result
        final_response = agent_result["final_response"]

        # Check if the response is a DisasterResponse object
        if isinstance(final_response, DisasterResponse):
            # Convert the DisasterResponse object to a dictionary
            response_dict = {
                "reasoning": final_response.reasoning,
                "disasterType": final_response.disaster_type,
                "severity": final_response.severity,
                "location": final_response.location,
                "status": final_response.status,
                "isAidRequired": final_response.is_aid_required,
                "estimatedAffected": final_response.estimated_affected,
                "requiredAidAmount": final_response.required_aid_amount,
                "aidCurrency": final_response.aid_currency,
                "evacuationNeeded": final_response.evacuation_needed,
                "disasterDate": final_response.disaster_date,
                "timestamp": final_response.timestamp.isoformat() if isinstance(final_response.timestamp, datetime) else str(final_response.timestamp),
                "confidenceScore": final_response.confidence_score,
                "isValid": final_response.is_valid.lower() == "true",
                "validationReasoning": final_response.validation_reasoning
            }
            
            # Log the response details using pretty-printed JSON
            disaster_activity_logger.info(f"Disaster analysis completed for customer {query.customer_id} at location: {query.location}")
            disaster_activity_logger.info(f"Query: {query}")
            disaster_activity_logger.info("Response details:")
            disaster_activity_logger.info(json.dumps(response_dict, indent=2, sort_keys=True))
            
            return response_dict
        else:
            # If it's not a DisasterResponse object, ensure it's JSON serializable
            result = ensure_json_serializable(final_response)
            if isinstance(result, str):
                try:
                    return json.loads(result)
                except json.JSONDecodeError:
                    return {"response": result}
            else:
                return result
                
    except Exception as e:
        disaster_activity_logger.error(f"Activity failed: {str(e)}")
        raise

@activity.defn
async def blockchain_activity(query: DisasterQuery, response: dict) -> bool:
    """
    Activity that creates an XRPL check transaction based on the disaster response.
    
    Args:
        query: The disaster query containing customer and beneficiary IDs
        response: The disaster analysis response containing aid requirements
        
    Returns:
        bool: True if the transaction was created successfully, False otherwise
    """
    try:
        from blockchain import create_wallet_transaction
        blockchain_activity_logger.info(f"Starting XRPL check transaction creation for response: {response}")
        blockchain_activity_logger.info(f"Query: {query}")
        
        # Create the wallet transaction
        transaction_result = await create_wallet_transaction(query, response)
        blockchain_activity_logger.info(f"Transaction result: {transaction_result}")
        
        return True
        
    except Exception as e:
        blockchain_activity_logger.error(f"Failed to create XRPL check transaction: {str(e)}")
        return False
        
        
