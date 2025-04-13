from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import uvicorn
from workflow.temporal_client import execute_disaster_workflow
from blockchain.traces import get_all_consolidated_edges
from blockchain.transaction import execute_payment
from typing import List, Optional
from db.database import get_db, Customer, CustomerType, Donations, DonationStatus
from enum import Enum
from blockchain.payment_edge import ConsolidatedPaymentEdge
from blockchain.balance import get_formatted_balance
from sqlalchemy.orm import Session
from sqlalchemy import text
from config.logger_config import setup_logger
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uuid

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

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = get_db()

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

class CauseDetailsResponse(BaseModel):
    cause_id: str
    name: Optional[str]
    goal: Optional[float]
    description: Optional[str]
    imageUrl: Optional[str]
    category: Optional[str]
    customer_id: Optional[str]
    balance: Optional[float] = 0
    donations: Optional[int] = 0
    raised: Optional[int] = 0

class TransactionDetailsResponse(BaseModel):
    transaction_hash: str
    sender_id: str
    sender_name: str
    receiver_id: str
    receiver_name: str
    amount: float
    currency: str
    transaction_type: str
    status: str

    class Config:
        from_attributes = True

class PaymentRequest(BaseModel):
    sender_id: str
    cause_id: str
    receiver_id: str
    currency: str
    amount: float

class DisbursementInfo(BaseModel):
    donation_id: str
    customer_id: str
    original_amount: float
    amount: float

class PaymentResponse(BaseModel):
    success: bool
    message: str
    transaction_hash: Optional[str] = None
    disbursements: List[DisbursementInfo] = []

    class Config:
        from_attributes = True

class DonationRequest(BaseModel):
    """Request model for donation registration."""
    customer_id: str
    cause_id: str
    amount: float
    currency: str = "RLUSD"

class DonationResponse(BaseModel):
    """Response model for donation registration."""
    donation_id: str
    customer_id: str
    cause_id: str
    amount: float
    currency: str
    donation_date: datetime
    status: DonationStatus
    success: bool
    message: str

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
                sender_id=sender_details.customer_id if sender_details and sender_details.customer_id else "Unknown",
                sender_name=sender_details.customer_name if sender_details and sender_details.customer_name else "Unknown",
                receiver=edge.receiver,
                receiver_id=receiver_details.customer_id if receiver_details and receiver_details.customer_id else "Unknown",
                receiver_name=receiver_details.customer_name if receiver_details and receiver_details.customer_name else "Unknown",
                currency=edge.currency,
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

@app.get("/causes/{cause_id}", response_model=CauseDetailsResponse)
async def get_cause_details(cause_id: str):
    """Get all customer details with a left join between customers and customer_details tables."""
    try:
        cause = db.get_cause(cause_id)
        cause_with_donations = db.get_cause_with_donations(cause_id)
        
        # Convert to response format
        cause_dict = {
            "cause_id": cause.cause_id,
            "name": cause.name,
            "goal": cause.goal,
            "description": cause.description,
            "imageUrl": cause.imageUrl,
            "category": cause.category,
            "customer_id": cause.customer_id,
            "balance": cause.balance,
            "donations": cause_with_donations.donation_count if cause_with_donations.donation_count else 0,
            "raised": cause_with_donations.total_donation_amount if cause_with_donations.total_donation_amount else 0
        }
        
        return CauseDetailsResponse(**cause_dict)
    except Exception as e:
        logger.error(f"Error retrieving cause details: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving cause details: {str(e)}")


@app.get("/causes", response_model=List[CauseDetailsResponse])
async def get_cause_details(limit: Optional[int] = 10):
    """Get all customer details with a left join between customers and customer_details tables."""
    try:
        causes = db.get_all_causes_with_donations()
        
        # Convert to response format
        cause_dict = []
        for cause in causes:
            cause_dict.append({
                "cause_id": cause.cause_id,
                "name": cause.name,
                "goal": cause.goal,
                "description": cause.description,
                "imageUrl": cause.imageUrl,
                "category": cause.category,
                "customer_id": cause.customer_id,
                "balance": cause.balance,
                "donations": cause.donation_count if cause.donation_count else 0,
                "raised": cause.total_donation_amount if cause.total_donation_amount else 0
            })
        
        return cause_dict
    except Exception as e:
        logger.error(f"Error retrieving cause details: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving cause details: {str(e)}")

@app.get("/transactions/{customer_id}/{donor_id}", response_model=List[TransactionDetailsResponse])
async def get_transactions(customer_id: str, donor_id: str):
    """Get all customer details with a left join between customers and customer_details tables."""
    try:
        print(f"Getting transactions for customer {customer_id}")
        transactions = db.get_customer_sent_transactions(customer_id, donor_id)
        
        # Convert to response format
        donation_dict = []
        for transaction in transactions:
            donation_dict.append({
                "transaction_hash": transaction.transaction_hash,
                "sender_id": transaction.sender_id,
                "sender_name": transaction.sender_name,
                "receiver_id": transaction.receiver_id,
                "receiver_name": transaction.receiver_name,
                "amount": transaction.amount,
                "currency": transaction.currency,
                "transaction_type": transaction.transaction_type,
                "status": transaction.status
            })
        
        return donation_dict
    except Exception as e:
        logger.error(f"Error retrieving transactions: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving transactions: {str(e)}")

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
        db.insert_customer(
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

@app.post("/disburse", response_model=PaymentResponse)
async def execute_payment_endpoint(payment_request: PaymentRequest):
    """
    Execute a payment transaction between two customers.
    
    Args:
        payment_request: Payment details including sender, receiver, currency, and amount
        
    Returns:
        PaymentResponse with success status, transaction details, and disbursement information
    """
    try:
        # Execute the payment
        success, transaction_hash, disbursements = await execute_payment(
            sender_id=payment_request.sender_id,
            cause_id=payment_request.cause_id,
            beneficiary_id=payment_request.receiver_id,
            currency=payment_request.currency,
            amount=payment_request.amount
        )
        
        if success:
            return PaymentResponse(
                success=True,
                message="Payment executed successfully",
                transaction_hash=transaction_hash,
                disbursements=[
                    DisbursementInfo(
                        donation_id=d['donation_id'],
                        customer_id=d['customer_id'],
                        original_amount=d['original_amount'],
                        amount=d['amount']
                    ) for d in disbursements
                ]
            )
        else:
            return PaymentResponse(
                success=False,
                message="Payment failed",
                transaction_hash=transaction_hash,
                disbursements=[]
            )
            
    except Exception as e:
        logger.error(f"Error executing payment: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error executing payment: {str(e)}"
        )

@app.post("/donate", response_model=DonationResponse)
async def register_donation(request: DonationRequest):
    """
    Register a new donation in the database.
    
    Args:
        request: DonationRequest containing customer_id, cause_id, amount, and currency
        
    Returns:
        DonationResponse with complete donation details, success status, and message
    """
    try:
        # Get database instance
        db = get_db()
        
        # Insert donation using the database function
        donation_id = db.insert_donation(
            customer_id=request.customer_id,
            cause_id=request.cause_id,
            amount=request.amount,
            currency=request.currency
        )
        
        # Get the complete donation object
        session = db.Session()
        try:
            donation = session.query(Donations).filter_by(donation_id=donation_id).first()
            if not donation:
                raise HTTPException(status_code=500, detail="Donation not found after insertion")
            
            return DonationResponse(
                donation_id=donation.donation_id,
                customer_id=donation.customer_id,
                cause_id=donation.cause_id,
                amount=donation.amount,
                currency=donation.currency,
                donation_date=donation.donation_date,
                status=donation.status,
                success=True,
                message="Donation registered successfully"
            )
        finally:
            session.close()
            
    except Exception as e:
        logger.error(f"Error in donation registration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error registering donation: {str(e)}")

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