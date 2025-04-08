from temporalio.client import Client
from workflow.disaster_analysis_workflow import DisasterMonitorWorkflow, DisasterQuery
from datetime import datetime

# ============================================================================
# TEMPORAL CLIENT
# ============================================================================
# This module provides a client interface to the Temporal workflow engine.
# It handles the communication between the API server and the Temporal server.

async def execute_disaster_workflow(customer_id: str, beneficiary_id: str, location: str, query: str) -> dict:
    """Execute the disaster management workflow with the given parameters.
    
    This function is the bridge between the API server and the Temporal workflow engine.
    It:
    1. Connects to the Temporal server
    2. Creates a unique workflow ID
    3. Packages the request parameters into a DisasterQuery object
    4. Executes the workflow and waits for the result
    5. Returns the structured analysis result
    
    Args:
        customer_id (str): The ID of the customer
        location (str): The location of the disaster
        query (str): The query to analyze about the disaster situation
        
    Returns:
        dict: The structured response containing the analysis
    """
    # Connect to Temporal server running on localhost
    # In production, this would point to a dedicated Temporal server
    client = await Client.connect("localhost:7233")
    
    # Create a unique workflow ID with the format: customerid-location-disaster-analysis
    formatted_location = location.lower().replace(" ", "-")
    workflow_id = f"{customer_id}-{formatted_location}-disaster-analysis"
    query_date = datetime.now().strftime("%Y-%m-%d")

    # Create the query object that will be passed to the workflow
    # This encapsulates all the parameters needed for the analysis
    disaster_query = DisasterQuery(
        customer_id=customer_id,
        beneficiary_id=beneficiary_id,
        location=location,
        query=query,
        query_date=query_date
    )
    
    # Execute the workflow and wait for the result
    # This is an asynchronous operation that may take some time
    # The workflow will be executed by a worker process
    result = await client.execute_workflow(
        DisasterMonitorWorkflow.run,        # The workflow function to execute
        disaster_query,                     # The input parameters
        id=workflow_id,                     # The unique workflow ID
        task_queue="disaster-monitor-queue" # The queue to use for this workflow
    )
    
    # Return the result directly to the API server
    return result 