"""
XRPL transaction operations.
"""

from typing import Dict, Any
from xrpl.models.transactions import Payment
from xrpl.asyncio.transaction import submit_and_wait
from xrpl.models.requests import Tx
from config.logger_config import setup_logger
from .client import get_client
from .wallet import get_wallet_pair, get_wallet_balance
from workflow.workflow_models import DisasterQuery
from db.database import init_db, get_db
from db.sqlite_config import get_connection_string
import asyncio

# Set up logging
logger = setup_logger(__name__)

# Initialize database
init_db(get_connection_string())
db = get_db()

# Initialize client
client = get_client()

async def create_wallet_transaction(query: DisasterQuery, response: Dict[str, Any]) -> Dict[str, Any]:
    """Create and execute a wallet transaction.
    
    This function:
    1. Creates two test wallets using the XRPL faucet
    2. Checks initial balances
    3. Creates and submits a payment transaction
    4. Verifies the transaction on the ledger
    5. Checks final balances
    
    Args:
        query: The disaster query containing customer and beneficiary IDs
        response: Dictionary containing transaction details
        
    Returns:
        Dict containing transaction result
    """
    logger.info(f"Creating wallet transaction for response: {response}")
    
    try:
        sender_wallet, receiver_wallet = await get_wallet_pair(query.customer_id, query.beneficiary_id)
    except Exception as e:
        logger.error(f"Error fetching wallets: {e}")
        raise e

    # Check initial balances
    logger.info("Checking initial wallet balances:")
    logger.info(f"Wallet 1 ({sender_wallet.address}) balance: {await get_wallet_balance(sender_wallet.address, client)}")
    logger.info(f"Wallet 2 ({receiver_wallet.address}) balance: {await get_wallet_balance(receiver_wallet.address, client)}")

    # Create payment transaction
    logger.info("Creating payment transaction...")
    payment_tx = Payment(
        account=sender_wallet.address,
        amount="1000",
        destination=receiver_wallet.address,
    )

    # Submit transaction
    logger.info("Submitting payment transaction...")
    payment_response = await submit_and_wait(payment_tx, client, sender_wallet)
    logger.info("Transaction submitted successfully")

    # Verify transaction
    logger.info("Looking up transaction on ledger...")
    tx_response = await client.request(Tx(transaction=payment_response.result["hash"]))
    logger.info(f"Transaction validated: {tx_response.result['validated']}")

    # Check final balances
    logger.info("Checking final wallet balances:")
    logger.info(f"Wallet 1 ({sender_wallet.address}) balance: {await get_wallet_balance(sender_wallet.address, client)}")
    logger.info(f"Wallet 2 ({receiver_wallet.address}) balance: {await get_wallet_balance(receiver_wallet.address, client)}")

    # Insert transaction into database
    # db.insert_transaction(query.customer_id, query.beneficiary_id, payment_response.result["hash"], payment_response.result["amount"], payment_response.result["destination"])

    return payment_response.result

async def main():
    """Main function to send money from sender-1 to receiver-2."""
    try:
        # Create a test query
        query = DisasterQuery(
            customer_id="sender-1",
            beneficiary_id="sender-2",
            location="Test Location",
            query="Test query for money transfer"
        )
        
        # Create a mock response
        response = {
            "reasoning": "Test transfer",
            "disasterType": "test",
            "severity": "low",
            "location": "Test Location",
            "status": "test",
            "isAidRequired": True,
            "estimatedAffected": 0,
            "requiredAidAmount": 1000,
            "aidCurrency": "XRP",
            "evacuationNeeded": False,
            "disasterDate": "2024-03-20",
            "timestamp": "2024-03-20T00:00:00",
            "confidenceScore": "100.00",
            "isValid": True,
            "validationReasoning": "Test transfer"
        }
        
        # Execute the transaction
        result = await create_wallet_transaction(query, response)
        logger.info(f"Transaction completed successfully: {result}")
        
    except Exception as e:
        logger.error(f"Error in main function: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main()) 