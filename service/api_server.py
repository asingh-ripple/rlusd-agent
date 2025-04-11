from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import uvicorn
from workflow.temporal_client import execute_disaster_workflow
from blockchain.traces import get_all_consolidated_edges
from typing import List, Optional
from db.database import get_db, Customer, CustomerType, CustomerDetails
from enum import Enum
from blockchain.payment_edge import ConsolidatedPaymentEdge
from blockchain.balance import get_formatted_balance
from sqlalchemy.orm import Session
from sqlalchemy import text
from config.logger_config import setup_logger

logger = setup_logger(__name__)
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

class CustomerBalanceResponse(BaseModel):
    customer_id: str
    public_address: str
    balance: str
    sequence: int

class CustomersBalanceResponse(BaseModel):
    customers: List[CustomerBalanceResponse]

class CustomerDetailsResponse(BaseModel):
    customer_id: str
    customer_type: str
    wallet_address: Optional[str]
    email: Optional[str]
    name: Optional[str]
    goal: Optional[float]
    description: Optional[str]
    total_donations: Optional[int]
    amount_raised: Optional[int]

    class Config:
        from_attributes = True

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

@app.get("/customers/balances", response_model=CustomersBalanceResponse)
async def get_all_customers_balances():
    """
    Get balances for all customers in the system.
    
    Returns:
        List of all customers with their balances
        
    Raises:
        HTTPException: If there's an error retrieving balances
    """
    try:
        print("\nGetting all customers...")
        customers = get_db().get_all_customers()
        print(f"Found {len(customers) if customers else 0} customers")
        
        if not customers:
            print("No customers found in database")
            return CustomersBalanceResponse(customers=[])
            
        balances = []
        for customer in customers:
            print(f"\nProcessing customer: {customer.customer_id}")
            print(f"Wallet address: {customer.wallet_address}")
            
            if not customer.wallet_address:
                print(f"Warning: Customer {customer.customer_id} has no wallet address")
                continue
                
            balance_info = await get_formatted_balance(customer.wallet_address)
            print(f"Balance info: {balance_info}")
            
            if balance_info:
                balances.append(
                    CustomerBalanceResponse(
                        customer_id=customer.customer_id,
                        public_address=balance_info['public_address'],
                        balance=balance_info['balance'],
                        sequence=balance_info['sequence']
                    )
                )
                print(f"Added balance info for customer {customer.customer_id}")
            else:
                print(f"Warning: Could not get balance info for customer {customer.customer_id}")
                
        if not balances:
            print("No balances found for any customers")
            return CustomersBalanceResponse(customers=[])
            
        print(f"\nReturning balances for {len(balances)} customers")
        return CustomersBalanceResponse(customers=balances)
        
    except Exception as e:
        print(f"\nError in get_all_customers_balances: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving customer balances: {str(e)}"
        )

@app.get("/customers/details", response_model=List[CustomerDetailsResponse])
async def get_customer_details():
    """Get all customer details with a left join between customers and customer_details tables."""
    try:
        # Get all customers
        customers = get_db().get_all_customers()
        
        # Convert to response format
        response = []
        for customer in customers:
            # Get customer details if they exist
            details = get_db().get_customer_details(customer.customer_id)
            
            customer_dict = {
                "customer_id": customer.customer_id,
                "customer_type": customer.customer_type,
                "wallet_address": customer.wallet_address,
                "email": customer.email_address,
                "name": details.name if details else None,
                "goal": details.goal if details else None,
                "description": details.description if details else None,
                "total_donations": details.total_donations if details else None,
                "amount_raised": details.amount_raised if details else None
            }
            response.append(customer_dict)
        
        return response
    except Exception as e:
        logger.error(f"Error retrieving customer details: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving customer details: {str(e)}")

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
        print(f"Attempting to get customer with ID: {customer_id}")
        db = get_db()
        print(f"Database instance: {db}")
        
        # First check if customer exists
        customer = db.get_customer(customer_id)
        print(f"Customer lookup result: {customer}")
        
        if not customer:
            print(f"Customer {customer_id} not found in database")
            raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")
            
        print(f"Found customer: {customer.customer_id}")
        return CustomerResponse(
            customer_id=customer.customer_id,
            email_address=customer.email_address,
            wallet_address=customer.wallet_address,
        )
    except Exception as e:
        print(f"Error retrieving customer: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving customer: {str(e)}")

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