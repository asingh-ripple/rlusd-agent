"""
XRPL wallet operations and transaction management.

This module provides functionality to:
1. Create and manage XRPL wallets
2. Send XRP payments between wallets
"""

import asyncio
from typing import Dict, Any, Optional, Tuple, Union
from config.logger_config import setup_logger
from datetime import datetime, timedelta

# Import XRPL client and transaction modules
from xrpl.asyncio.clients import AsyncJsonRpcClient  # Async client for XRPL JSON-RPC API
from xrpl.models.transactions import Payment          # Payment transaction model
from xrpl.asyncio.wallet import generate_faucet_wallet  # Generate testnet wallets
from xrpl.wallet import Wallet
from xrpl.asyncio.transaction import submit_and_wait    # Submit and wait for transaction
from xrpl.models.requests import Tx                     # Transaction lookup request
from xrpl.asyncio.account import get_balance # Get account balance
from xrpl.clients import JsonRpcClient
from xrpl.models import CheckCreate, IssuedCurrencyAmount, CheckCash
from xrpl.utils import datetime_to_ripple_time, xrp_to_drops

from db.database import TransactionStatus, TransactionType, CheckType

# Set up logging for the module
logger = setup_logger(__name__)

# Initialize XRPL client
client = AsyncJsonRpcClient("https://s.altnet.rippletest.net:51234")

# Initialize database
from db import init_db, get_db
from db.sqlite_config import get_connection_string
from workflow.workflow_models import DisasterQuery

# Initialize the database
init_db(get_connection_string())
db = get_db()

async def create_wallet_transaction(query: DisasterQuery, response: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create and execute a wallet transaction on the XRPL testnet.
    
    This function:
    1. Creates two test wallets using the XRPL faucet
    2. Checks initial balances
    3. Creates and submits a payment transaction
    4. Verifies the transaction on the ledger
    5. Checks final balances
    
    Args:
        response: Dictionary containing transaction details (not currently used)
        
    Returns:
        Dict containing transaction result
    """
    # Configure logging
    logger.info(f"Creating wallet transaction for response: {response}")
    
    

    # Create two test wallets using the XRPL faucet
    # The faucet provides test XRP for development purposes
    logger.info("Generating faucet wallets...")

    
    try:
        sender_wallet = Wallet.from_seed(db.get_customer_seed(query.customer_id))
        receiver_wallet = Wallet.from_seed(db.get_customer_seed(query.beneficiary_id))
    except Exception as e:
        logger.error(f"Error fetchings wallets: {e}")
        raise e

    # Check initial balances of both wallets
    # New faucet wallets should start with zero balance
    logger.info("Checking initial wallet balances:")
    logger.info(f"Wallet 1 ({sender_wallet.address}) balance: {await get_balance(sender_wallet.address, client)}")
    logger.info(f"Wallet 2 ({receiver_wallet.address}) balance: {await get_balance(receiver_wallet.address, client)}")

    # Create a Payment transaction object
    # This specifies the source, destination, and amount
    logger.info("Creating payment transaction...")
    payment_tx = Payment(
        account=sender_wallet.address,      # Source wallet address
        amount="1000",               # Amount in drops (1 XRP = 1,000,000 drops)
        destination=receiver_wallet.address,  # Destination wallet address
    )

    # Submit the transaction to the network
    # This will:
    # 1. Automatically fill in required fields (like fee)
    # 2. Sign the transaction with sender_wallet's private key
    # 3. Submit it to the network
    # 4. Wait for confirmation
    logger.info("Submitting payment transaction...")
    payment_response = await submit_and_wait(payment_tx, client, sender_wallet)
    logger.info("Transaction submitted successfully")

    # Look up the transaction on the ledger to verify it was validated
    logger.info("Looking up transaction on ledger...")
    tx_response = await client.request(Tx(transaction=payment_response.result["hash"]))

    # Check if the transaction was validated by the network
    logger.info(f"Transaction validated: {tx_response.result['validated']}")

    # Check final balances after the transaction
    # sender_wallet should have less XRP, receiver_wallet should have more
    logger.info("Checking final wallet balances:")
    logger.info(f"Wallet 1 ({sender_wallet.address}) balance: {await get_balance(sender_wallet.address, client)}")
    logger.info(f"Wallet 2 ({receiver_wallet.address}) balance: {await get_balance(receiver_wallet.address, client)}")
    logger.info(f"Wallet 1 seed: {sender_wallet.seed}")
    logger.info(f"Wallet 2 seed: {receiver_wallet.seed}")

async def create_check(
    customer_id: str,
    beneficiary_id: str,
    amount: float,
    currency: str = "XRP",
    issuer: Optional[str] = None,
    expiration_days: int = 1
) -> str:
    """Create a check on the XRPL.
    
    Args:
        customer_id: The ID of the customer creating the check
        beneficiary_id: The ID of the beneficiary receiving the check
        amount: The amount to send
        currency: The currency to send (default: "XRP")
        issuer: The issuer of the currency (required for non-XRP currencies)
        expiration_days: Number of days until the check expires (default: 5)
        
    Returns:
        str: The check_id (LedgerIndex) of the created check
    """
    try:
        # Set check to expire after specified days
        expiry_date = datetime_to_ripple_time(datetime.now() + timedelta(days=expiration_days))
        sender_wallet, receiver_wallet = await get_wallet_pair(customer_id, beneficiary_id)
    except Exception as e:
        logger.error(f"Error fetching wallet pair: {str(e)}")
        raise e
    
    # Build check create transaction
    if currency.upper() == "XRP":
            check_txn = CheckCreate(
                account=sender_wallet.address,
                destination=receiver_wallet.address,
                send_max=xrp_to_drops(amount),
                expiration=expiry_date
        )
    else:
        if not issuer:
            raise ValueError("Issuer is required for non-XRP currencies")
        
        check_txn = CheckCreate(
            account=sender_wallet.address,
            destination=receiver_wallet.address,
            send_max=IssuedCurrencyAmount(
                currency=currency,
                issuer=issuer,
                value=str(amount)
            ),
            expiration=expiry_date
            )
    try:    
        # Submit transaction and wait for result
        stxn_response = await submit_and_wait(check_txn, client, sender_wallet)
        stxn_result = stxn_response.result
        
        # Get the check_id from the created Check object
        check_id = None
        for node in stxn_result['meta']['AffectedNodes']:
            if 'CreatedNode' in node and node['CreatedNode']['LedgerEntryType'] == 'Check':
                check_id = node['CreatedNode']['LedgerIndex']
                break
        
        if not check_id:
            raise ValueError("Failed to find check_id in transaction result")
        
        # Log transaction details
        logger.info(f"Sender wallet: {sender_wallet.address}")
        logger.info(f"Receiver wallet: {receiver_wallet.address}")
        logger.info(f"Check created successfully:")
        logger.info(f"Status: {stxn_result['meta']['TransactionResult']}")
        logger.info(f"Transaction Hash: {stxn_result['hash']}")
        logger.info(f"Check ID: {check_id}")
        logger.info(f"Amount: {amount} {currency}")
        logger.info(f"Sender: {sender_wallet.address}")
        logger.info(f"Receiver: {receiver_wallet.address}")
        logger.info(f"Expiration: {expiry_date}")

        # Add transaction history to the database
        if stxn_result['meta']['TransactionResult'] == "tesSUCCESS":
            db.insert_check(check_id=check_id,
                            transaction_hash=stxn_result['hash'],
                            sender_id=customer_id,
                            receiver_id=beneficiary_id,
                            amount=amount,
                            currency=currency,
                            expiration_date=expiry_date)
        return check_id
    
    except Exception as e:
        logger.error(f"Error inserting check: {str(e)}")
        raise

async def cash_check(
    beneficiary_id: str,
    check_id: str,
    amount: float,
    currency: str = "XRP",
    issuer: Optional[str] = None
) -> None:
    """Cash a check on the XRPL.
    
    Args:
        receiver_id: The ID of the customer cashing the check
        check_id: The ID of the check to cash
        amount: The amount to cash
        currency: The currency of the check (default: "XRP")
        issuer: The issuer of the currency (required for non-XRP currencies)
    """
    try:
        # Get the customer's wallet
        receiver_wallet = Wallet.from_seed(db.get_customer_seed(beneficiary_id))
    except Exception as e:
        logger.error(f"Error fetching receiver wallet: {str(e)}")
        raise e
    # Build check cash transaction
    if currency.upper() == "XRP":
        check_txn = CheckCash(
            account=receiver_wallet.address,
            check_id=check_id,
            amount=xrp_to_drops(amount)
        )
    else:
        if not issuer:
            raise ValueError("Issuer is required for non-XRP currencies")
        
        check_txn = CheckCash(
            account=receiver_wallet.address,
            check_id=check_id,
            amount=IssuedCurrencyAmount(
                currency=currency,
                issuer=issuer,
                value=str(amount)
            )
        )
    try:    
        # Submit transaction and wait for result
        stxn_response = await submit_and_wait(check_txn, client, receiver_wallet)
        stxn_result = stxn_response.result
        
        # Log transaction details
        logger.info(f"Check cashed successfully:")
        logger.info(f"Status: {stxn_result['meta']['TransactionResult']}")
        logger.info(f"Transaction Hash: {stxn_result['hash']}")
        logger.info(f"Amount: {amount} {currency}")
        logger.info(f"Customer: {receiver_wallet.address}")
        logger.info(f"Check ID: {check_id}")

        check_details = db.get_check(check_id)
        sender_id = check_details.sender_id
        # Add transaction history to the database
        if stxn_result['meta']['TransactionResult'] == "tesSUCCESS":
            db.add_transaction(
                transaction_hash=stxn_result['hash'],
                sender_id=sender_id,
                receiver_id=beneficiary_id,  # Check cashing doesn't have a direct receiver
                amount=amount,
                currency=currency,
                transaction_type=TransactionType.PAYMENT,
                status=TransactionStatus.SUCCESS
            )

            db.update_check_cash(check_id=check_id, new_transaction_hash=stxn_result['hash'])
        return stxn_result['hash']
        
    except Exception as e:
        raise
    
async def get_wallet_pair(customer_id: str, beneficiary_id: str) -> Tuple[Wallet, Wallet]:
    """
    Get a pair of wallets for a customer and beneficiary.
    """
    sender_wallet = Wallet.from_seed(db.get_customer_seed(customer_id))
    receiver_wallet = Wallet.from_seed(db.get_customer_seed(beneficiary_id))
    return sender_wallet, receiver_wallet

async def main() -> None:
    """Test the XRPL check creation and cashing functionality."""
    # Test data for check creation
    test_customer_id = "sender-1"
    test_beneficiary_id = "receiver-1"
    test_amount = 10.00
    test_currency = "XRP"
    
    try:
        # First create a check
        logger.info("Testing check creation...")
        check_id = await create_check(
            customer_id=test_customer_id,
            beneficiary_id=test_beneficiary_id,
            amount=test_amount,
            currency=test_currency
        )
        
        logger.info(f"Check created successfully with ID: {check_id}")

        # Now cash the check
        logger.info("Testing check cashing...")
        await cash_check(
            beneficiary_id=test_beneficiary_id,  # The beneficiary is cashing the check
            check_id=check_id,
            amount=test_amount,
            currency=test_currency,
            issuer=None
        )
        
    except Exception as e:
        logger.error(f"Error in main: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(main())