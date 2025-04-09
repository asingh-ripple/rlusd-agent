"""
XRPL client initialization and common utilities.
"""

from xrpl.asyncio.clients import AsyncJsonRpcClient
from config.logger_config import setup_logger
from config.blockchain_config import get_network_url

# Set up logging for the module
logger = setup_logger(__name__)

def get_client() -> AsyncJsonRpcClient:
    """Get a new XRPL client instance."""
    return AsyncJsonRpcClient(get_network_url())

async def set_network(network: str) -> None:
    """
    Set the network for the XRPL client.
    
    Args:
        network: The network to use ("testnet" or "mainnet")
    """
    logger.info(f"XRPL client network set to: {network}") 