from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from workflow.temporal_client import execute_disaster_workflow
from blockchain.traces import get_all_consolidated_edges
from typing import List, Optional

# ============================================================================
# API SERVER SETUP
# ============================================================================
# This is the main entry point for the disaster monitoring system.
# It provides a REST API that clients can use to request disaster analysis.

# Initialize FastAPI app with metadata
app = FastAPI(
    title="Disaster Monitor API",
    description="API for monitoring and analyzing disaster situations",
    version="1.0.0"
)

# ============================================================================
# DATA MODELS
# ============================================================================
# Define the structure of incoming requests and outgoing responses

class DisasterRequest(BaseModel):
    customer_id: str
    beneficiary_id: str
    location: str
    query: str

# Response model: Defines the structure of the API response
class DisasterResponse(BaseModel):
    result: dict      # Contains the structured disaster analysis result

class ConsolidatedEdgeResponse(BaseModel):
    sender: str
    receiver: str
    payment_type: str
    amounts: List[str]
    hashes: List[str]
    fees: List[str]
    timestamps: List[str]
    total_amount: str
    first_transaction_timestamp: str
    last_transaction_timestamp: str
    total_transactions: int

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.post("/analyze", response_model=DisasterResponse)
async def analyze_disaster(request: DisasterRequest):
    """
    Analyze a disaster situation based on the provided parameters.
    
    This endpoint is the main entry point for disaster analysis requests.
    It takes customer information and a query, then:
    1. Passes the request to the Temporal workflow
    2. Waits for the workflow to complete
    3. Returns the structured analysis result
    
    Args:
        request (DisasterRequest): The disaster analysis request containing customer_id, location, and query
        
    Returns:
        DisasterResponse: The analysis result as a structured JSON object
    """
    try:
        # Execute the disaster workflow via the Temporal client
        # This is an asynchronous call that may take some time to complete
        result_dict = await execute_disaster_workflow(
            customer_id=request.customer_id,
            location=request.location,
            query=request.query,
            beneficiary_id=request.beneficiary_id
        )
        
        # Return the dictionary directly as a JSON response
        return DisasterResponse(result=result_dict)
    
    except Exception as e:
        # Handle any errors that occur during processing
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.get("/payment-trace/{customer_id}", response_model=List[ConsolidatedEdgeResponse])
async def get_payment_trace(customer_id: str, max_depth: Optional[int] = 10):
    """
    Get all consolidated payment edges for a customer up to a specified depth.
    
    Args:
        customer_id: The ID of the customer to get payment edges for
        max_depth: Maximum depth to traverse (default: 10)
        
    Returns:
        List of consolidated payment edges as JSON
    """
    try:
        # Get all consolidated edges
        edges = await get_all_consolidated_edges(customer_id, max_depth)
        
        # Convert edges to response format
        response = []
        for edge in edges:
            response.append(ConsolidatedEdgeResponse(
                sender=edge.sender,
                receiver=edge.receiver,
                payment_type=edge.payment_type,
                amounts=edge.amounts,
                hashes=edge.hashes,
                fees=edge.fees,
                timestamps=[ts.isoformat() for ts in edge.timestamps],
                total_amount=edge.total_amount,
                first_transaction_timestamp=edge.first_transaction_timestamp.isoformat(),
                last_transaction_timestamp=edge.last_transaction_timestamp.isoformat(),
                total_transactions=len(edge.amounts)
            ))
        
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting payment edges: {str(e)}")


@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify the API is running.
    
    This is a simple endpoint that clients can use to check if the API is operational.
    It's useful for monitoring and load balancing.
    
    Returns:
        dict: A simple status message
    """
    return {"status": "healthy"}

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================
if __name__ == "__main__":
    # Run the FastAPI server when this file is executed directly
    # This starts the web server on port 8000 and enables auto-reload during development
    # Run the FastAPI server
    print("\nSTART: Disaster Monitor API Server")
    print("=================================")
    print("API documentation available at:")
    print("- Swagger UI: http://localhost:8000/docs")
    print("- ReDoc: http://localhost:8000/redoc")
    print("\nPress Ctrl+C to stop the server")
    print("=================================")
    uvicorn.run("api_server:app", host="0.0.0.0", port=8000, reload=True) 