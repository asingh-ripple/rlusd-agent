"""
XRPL transaction operations.
"""

from typing import Dict, Any, Optional
from xrpl.models.transactions import Payment
from xrpl.asyncio.transaction import submit_and_wait
from xrpl.models.requests import Tx
from config.logger_config import setup_logger
from .client import get_client
from .wallet import get_wallet_pair, get_wallet_balance
from workflow.workflow_models import DisasterQuery
from db.database import TransactionStatus, TransactionType, init_db, get_db
from db.sqlite_config import get_connection_string
import asyncio
from xrpl.models.transactions import Payment
from xrpl.asyncio.transaction import submit_and_wait

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

async def execute_payment(sender_id, beneficiary_id, currency, amount):
    """
    Sends RLUSD from a wallet to a destination address
    
    Parameters:
    sender_id: The ID of the sending customer
    beneficiary_id: The ID of the receiving customer
    currency: The currency to send (RLUSD or XRP)
    amount: Amount to send
    
    Returns:
        Tuple of (success: bool, transaction_hash: Optional[str])
    """
    try:
        # Get wallet pair
        sender_wallet, receiver_wallet = await get_wallet_pair(sender_id, beneficiary_id)
        currency = currency.upper()
        if currency == "RLUSD":
            # Convert currency code to hex
            currency_hex = "524C555344000000000000000000000000000000"  # Hex for "RLUSD"
            issuer_address = "rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV"
        else:
            currency_hex = "XRP"  # Hex for "XRP"
            issuer_address = ""
        
        # Prepare payment transaction
        payment = Payment(
            account=sender_wallet.classic_address,
            amount={
                "currency": currency_hex,
                "value": str(amount),
                "issuer": issuer_address
            },
            destination=receiver_wallet.classic_address,
        )
        
        print("\n=== Sending RLUSD ===")
        print(f"From: {sender_wallet.classic_address}")
        print(f"To: {receiver_wallet.classic_address}")
        print(f"Amount: {amount} RLUSD")
        print(f"Issuer: {issuer_address}")
        
        # Get client
        client = get_client()
        
        # Submit and wait for validation
        response = await submit_and_wait(payment, client, sender_wallet)
        
        # Check the result
        if response.is_successful():
            print("\nPayment successful!")
            print(f"Transaction hash: {response.result['hash']}")
            db.insert_transaction(
                transaction_hash=response.result['hash'],
                sender_id=sender_id,
                receiver_id=beneficiary_id,
                amount=amount,
                currency=currency,
                transaction_type=TransactionType.PAYMENT,
                status=TransactionStatus.SUCCESS
            )
            return True, response.result['hash']
        else:
            print("\nPayment failed")
            print(f"Error: {response.result.get('engine_result_message')}")
            return False, None
            
    except Exception as e:
        print(f"\nError sending payment: {str(e)}")
        return False, None

async def main():
    await execute_payment(sender_id="sender-1", beneficiary_id="receiver-1", currency="RLUSD", amount=1)

if __name__ == "__main__":
    asyncio.run(main()) 