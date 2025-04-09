from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from workflow.temporal_client import execute_disaster_workflow
from blockchain.traces import get_all_consolidated_edges
from typing import List, Optional
from db.database import get_db
from enum import Enum
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

class CustomerType(Enum):
    SENDER = "SENDER"
    RECEIVER = "RECEIVER"

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

class CustomerResponse(BaseModel):
    customer_id: str
    email_address: str
    wallet_address: str

class CustomersResponse(BaseModel):
    customers: List[CustomerResponse]

class CreateCustomerRequest(BaseModel):
    customer_id: str
    wallet_seed: str
    customer_type: CustomerType
    email_address: str
    wallet_address: str

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

@app.get("/customers/{customer_id}/payment-traces", response_model=List[ConsolidatedEdgeResponse])
async def get_payment_traces(customer_id: str, max_depth: int = 10):
    """
    Get consolidated payment edges for a customer and their network.
    
    Args:
        customer_id: The ID of the customer to trace payments for
        max_depth: Maximum depth to traverse (default: 10)
        
    Returns:
        List of consolidated payment edges
        
    Raises:
        HTTPException: If there's an error getting payment edges
    """
    try:
        edges = await get_all_consolidated_edges(customer_id, max_depth)
        return [
            ConsolidatedEdgeResponse(
                sender=edge.sender,
                receiver=edge.receiver,
                payment_type=edge.payment_type,
                amounts=edge.amounts,
                hashes=edge.hashes,
                fees=edge.fees,
                timestamps=edge.timestamps,
                total_amount=edge.total_amount,
                first_transaction_timestamp=edge.first_transaction_timestamp,
                last_transaction_timestamp=edge.last_transaction_timestamp,
                total_transactions=edge.total_transactions
            )
            for edge in edges
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting payment edges: {str(e)}")

@app.get("/customers/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: str):
    """
    Get customer details by ID.
    
    Args:
        customer_id: The ID of the customer to retrieve
        
    Returns:
        Customer details including ID, name, email, and wallet address
        
    Raises:
        HTTPException: If customer is not found
    """
    try:
        customer = get_db().get_customer(customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
            
        return CustomerResponse(
            customer_id=customer.customer_id,
            email_address=customer.email_address,
            wallet_address=customer.wallet_address,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving customer: {str(e)}")

@app.get("/customers", response_model=CustomersResponse)
async def get_all_customers():
    """
    Get all customers in the system.
    
    Returns:
        List of all customers with their details
        
    Raises:
        HTTPException: If there's an error retrieving customers
    """
    try:
        customers = get_db().get_all_customers()
        if not customers:
            return CustomersResponse(customers=[])
            
        return CustomersResponse(
            customers=[
                CustomerResponse(
                    customer_id=customer.customer_id,
                    email_address=customer.email_address,
                    wallet_address=customer.wallet_address
                )
                for customer in customers
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving customers: {str(e)}")

@app.post("/customer", response_model=CustomerResponse)
async def create_customer(customer: CreateCustomerRequest):
    """
    Create a new customer.
    
    Args:
        customer: Customer details including ID, email, and wallet address
        
    Returns:
        Created customer details
        
    Raises:
        HTTPException: If there's an error creating the customer
    """
    try:
        # Insert customer into database
        get_db().insert_customer(
            customer_id=customer.customer_id,
            email_address=customer.email_address,
            wallet_address=customer.wallet_address
        )
        
        # Return the created customer details
        return CustomerResponse(
            customer_id=customer.customer_id,
            email_address=customer.email_address,
            wallet_address=customer.wallet_address
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating customer: {str(e)}")

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