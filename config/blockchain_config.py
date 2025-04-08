"""
Blockchain configuration settings.
"""

# XRPL Testnet URL
XRPL_TESTNET_URL = "https://s.altnet.rippletest.net:51234"

# XRPL Mainnet URL (uncomment when ready for production)
# XRPL_MAINNET_URL = "https://s2.ripple.com:51234"

# Default network to use
DEFAULT_NETWORK = "testnet"  # Options: "testnet", "mainnet"

# Network URLs mapping
NETWORK_URLS = {
    "testnet": XRPL_TESTNET_URL,
    "mainnet": "https://s2.ripple.com:51234"  # Uncomment when ready for production
}

def get_network_url(network: str = None) -> str:
    """
    Get the XRPL network URL based on the specified network.
    
    Args:
        network: The network to use ("testnet" or "mainnet")
        
    Returns:
        str: The network URL
    """
    network = network or DEFAULT_NETWORK
    return NETWORK_URLS.get(network, XRPL_TESTNET_URL) 