"""
XRPL check operations.
"""

from typing import Optional
from datetime import datetime, timedelta

from xrpl.models import CheckCreate, CheckCash, IssuedCurrencyAmount
from xrpl.utils import datetime_to_ripple_time, xrp_to_drops
from xrpl.asyncio.transaction import submit_and_wait
from xrpl.wallet import Wallet

from config.logger_config import setup_logger
from db.database import get_db

from .client import get_client
from .wallet import get_wallet_pair


# Set up logging
logger = setup_logger(__name__)

# Initialize database and client
db = get_db()
client = get_client()

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
        expiration_days: Number of days until the check expires (default: 1)
        
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
        logger.error(f"Error creating check: {str(e)}")
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
        beneficiary_id: The ID of the customer cashing the check
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
        logger.info(f"Check ID: {check_id}")
        logger.info(f"Amount: {amount} {currency}")
        logger.info(f"Receiver: {receiver_wallet.address}")

        # Update check status in database
        if stxn_result['meta']['TransactionResult'] == "tesSUCCESS":
            db.update_check_cash(check_id, stxn_result['hash'])
    
    except Exception as e:
        logger.error(f"Error cashing check: {str(e)}")
        raise 