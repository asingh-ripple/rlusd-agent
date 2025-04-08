"""
XRPL client initialization and common utilities.
"""

from xrpl.asyncio.clients import AsyncJsonRpcClient
from config.logger_config import setup_logger

# Set up logging for the module
logger = setup_logger(__name__)

# Initialize XRPL client
client = AsyncJsonRpcClient("https://s.altnet.rippletest.net:51234")

def get_client() -> AsyncJsonRpcClient:
    """Get the XRPL client instance."""
    return client 