"""
XRPL client initialization and common utilities.
"""

from xrpl.asyncio.clients import AsyncJsonRpcClient
from config.logger_config import setup_logger
from config.blockchain_config import get_network_url

# Set up logging for the module
logger = setup_logger(__name__)

# Initialize XRPL client with URL from config
client = AsyncJsonRpcClient(get_network_url())

def get_client() -> AsyncJsonRpcClient:
    """Get the XRPL client instance."""
    return client

def set_network(network: str) -> None:
    """
    Set the network for the XRPL client.
    
    Args:
        network: The network to use ("testnet" or "mainnet")
    """
    global client
    client = AsyncJsonRpcClient(get_network_url(network))
    logger.info(f"XRPL client network set to: {network}") 