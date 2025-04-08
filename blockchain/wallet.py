"""
XRPL wallet operations.
"""

from typing import Tuple
from xrpl.wallet import Wallet
from xrpl.asyncio.account import get_balance
from config.logger_config import setup_logger
from db.database import get_db

# Set up logging
logger = setup_logger(__name__)

# Initialize database
db = get_db()

async def get_wallet_pair(customer_id: str, beneficiary_id: str) -> Tuple[Wallet, Wallet]:
    """Get a pair of wallets for customer and beneficiary.
    
    Args:
        customer_id: The ID of the customer
        beneficiary_id: The ID of the beneficiary
        
    Returns:
        Tuple[Wallet, Wallet]: The sender and receiver wallets
    """
    try:
        sender_wallet = Wallet.from_seed(db.get_customer_seed(customer_id))
        receiver_wallet = Wallet.from_seed(db.get_customer_seed(beneficiary_id))
        return sender_wallet, receiver_wallet
    except Exception as e:
        logger.error(f"Error fetching wallet pair: {str(e)}")
        raise e

async def get_wallet_balance(address: str, client) -> str:
    """Get the balance of a wallet.
    
    Args:
        address: The wallet address
        client: The XRPL client
        
    Returns:
        str: The wallet balance
    """
    return await get_balance(address, client) 