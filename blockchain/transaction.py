"""
XRPL transaction operations.
"""

from typing import Dict, Any, Optional, List, Tuple
from xrpl.models.transactions import Payment
from xrpl.asyncio.transaction import submit_and_wait
from xrpl.models.requests import Tx
from config.logger_config import setup_logger
from .client import get_client
from .wallet import get_wallet_pair, get_wallet_balance
from workflow.workflow_models import DisasterQuery
from db.database import (
    TransactionStatus, 
    TransactionType, 
    init_db, 
    get_db, 
    Donations, 
    DonationStatus,
    DisbursementsDonations
)
from db.sqlite_config import get_connection_string
import asyncio
from xrpl.models.transactions import Payment
from xrpl.asyncio.transaction import submit_and_wait
import uuid
from datetime import datetime

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

def process_disbursement(cause_id: str, sender_id: str, beneficiary_id: str, amount: float, transaction_hash: str) -> List[Dict[str, Any]]:
    """
    Process disbursement for a cause with the given amount.
    
    Args:
        cause_id: The cause ID to process donations for
        amount: The amount available for disbursement
        transaction_hash: The hash of the transaction that triggered this disbursement
        
    Returns:
        List of disbursement records created
    """
    print(f"\nProcessing disbursement:")
    print(f"  Cause ID: {cause_id}")
    print(f"  Sender ID: {sender_id}")
    print(f"  Beneficiary ID: {beneficiary_id}")
    print(f"  Amount: {amount} RLUSD")
    print(f"  Transaction Hash: {transaction_hash}")
    
    db = get_db()
    session = db.Session()
    disbursements_created = []
    
    try:
        # Get all donations in database for debugging
        all_donations = session.query(Donations).all()
        print("\nAll donations in database:")
        for donation in all_donations:
            print(f"  - ID: {donation.donation_id}")
            print(f"    Customer: {donation.customer_id}")
            print(f"    Cause: {donation.cause_id}")
            print(f"    Status: {donation.status}")
            print(f"    Amount: {donation.amount} {donation.currency}")
        
        # Get pending donations for the cause
        pending_donations = session.query(Donations).filter(
            Donations.cause_id == cause_id,
            Donations.status == DonationStatus.PENDING
        ).order_by(Donations.donation_date.asc()).all()
        
        if not pending_donations:
            print(f"No pending donations found for cause {cause_id}")
            return []
            
        print("\nPending donations:")
        for donation in pending_donations:
            print(f"  - ID: {donation.donation_id}")
            print(f"    Customer: {donation.customer_id}")
            print(f"    Amount: {donation.amount} {donation.currency}")
            print(f"    Status: {donation.status}")
            print(f"    Cause ID: {donation.cause_id}")
        
        # Calculate disbursements
        remaining_amount = float(amount)
        
        for donation in pending_donations:
            if remaining_amount <= 0:
                break
                
            # Calculate fulfillment amount
            donation_amount = float(donation.amount)
            fulfillment_amount = min(donation_amount, remaining_amount)
            
            # Create disbursement record
            disbursement = DisbursementsDonations(
                id=str(uuid.uuid4()),
                donation_id=donation.donation_id,
                disbursement_id=transaction_hash,
                cause_id=cause_id,
                donor_id=donation.customer_id,
                amount=fulfillment_amount,
                created_at=datetime.utcnow()
            )
            session.add(disbursement)
            disbursements_created.append({
                'donation_id': donation.donation_id,
                'customer_id': donation.customer_id,
                'original_amount': donation_amount,
                'amount': fulfillment_amount
            })
            print(f"Created disbursement for donation {donation.donation_id}: {fulfillment_amount} RLUSD")
            
            # Update donation status
            if fulfillment_amount >= donation_amount:
                donation.status = DonationStatus.COMPLETED
            
            remaining_amount -= fulfillment_amount
        
        # Print disbursement results
        print("\nDisbursement results:")
        for disbursement in disbursements_created:
            print(f"  - Donation ID: {disbursement['donation_id']}")
            print(f"    Customer: {disbursement['customer_id']}")
            print(f"    Original Amount: {disbursement['original_amount']} RLUSD")
            print(f"    Amount to Fulfill: {disbursement['amount']} RLUSD")
        
        # Print summary
        unique_donors = set(d['customer_id'] for d in disbursements_created)
        total_amount = sum(d['amount'] for d in disbursements_created)
        print(f"\nUnique donors: {unique_donors}")
        print(f"Total amount disbursed: {total_amount} RLUSD")
        print("-" * 50)
        
        session.commit()
        print("Successfully recorded disbursements")
        return disbursements_created
        
    except Exception as e:
        session.rollback()
        print(f"Error processing disbursement: {str(e)}")
        raise
    finally:
        session.close()

async def execute_payment(cause_id, sender_id, beneficiary_id, currency, amount):
    """
    Sends RLUSD from a wallet to a destination address
    
    Parameters:
    sender_id: The ID of the sending customer
    beneficiary_id: The ID of the receiving customer
    currency: The currency to send (RLUSD or XRP)
    amount: Amount to send
    
    Returns:
        Tuple of (success: bool, transaction_hash: Optional[str], disbursements: List[Dict[str, Any]])
    """
    try:
        # Get wallet pair
        sender_wallet, receiver_wallet = await get_wallet_pair(sender_id, beneficiary_id)
        currency = currency.upper()
        if currency == "RLUSD" or currency == "USD":
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
            print(f"response: {response}")
            print("\nPayment successful!")
            print(f"Transaction hash: {response.result['hash']}")
            
            # Insert transaction record
            db.insert_transaction(
                transaction_hash=response.result['hash'],
                sender_id=sender_id,
                receiver_id=beneficiary_id,
                amount=amount,
                currency=currency,
                transaction_type=TransactionType.PAYMENT,
                status=TransactionStatus.SUCCESS
            )

            sender_balance = await get_wallet_balance(sender_wallet.address, client)
            db.upsert_cause_balance(cause_id, amount)

            # Process disbursements to notify the donor in FIFO order
            disbursements = []
            try:
                disbursements = process_disbursement(
                    cause_id=cause_id,
                    sender_id=sender_id,
                    beneficiary_id=beneficiary_id,
                    amount=amount,
                    transaction_hash=response.result['hash']
                )
                print(f"Created {len(disbursements)} disbursement records")
            except Exception as e:
                print(f"Error processing disbursements: {str(e)}")
                # Continue since payment was successful
            
            return True, response.result['hash'], disbursements
        else:
            print("\nPayment failed")
            print(f"Error: {response.result.get('engine_result_message')}")
            return False, None, []
            
    except Exception as e:
        print(f"\nError sending payment: {str(e)}")
        return False, None, []

async def main():
    await execute_payment(sender_id="sender-1", beneficiary_id="receiver-1", currency="RLUSD", amount=1)

if __name__ == "__main__":
    asyncio.run(main()) 