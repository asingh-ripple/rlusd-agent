"""
XRPL wallet operations.
"""

from typing import Tuple
from xrpl.wallet import Wallet
from xrpl.asyncio.wallet import generate_faucet_wallet
from xrpl.asyncio.account import get_balance
from config.logger_config import setup_logger
from db.database import CustomerType, init_db, get_db
from db.sqlite_config import get_connection_string
from .client import get_client
# Set up logging
logger = setup_logger(__name__)

# Initialize database
init_db(get_connection_string())
db = get_db()
client = get_client()

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

async def create_wallet(customer_id: str) -> Wallet:
    """Create a wallet for a customer.
    
    Args:
        customer_id: The ID of the customer

    """
    try:
        wallet = await generate_faucet_wallet(client)
        print(f"Wallet: {wallet}")
        db.add_customer(customer_id, wallet.seed, CustomerType.RECEIVER, wallet.address, customer_id+"@metaco.com")
        return wallet
    except Exception as e:
        logger.error(f"Error creating wallet: {str(e)}")
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