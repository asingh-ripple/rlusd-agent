#!/usr/bin/env python3
"""
Script to create a wallet for receiver-4.
"""

import asyncio
from blockchain.wallet import create_wallet
from config.logger_config import setup_logger

# Set up logging
logger = setup_logger(__name__)

async def main():
    """Create wallet for receiver-4."""
    try:
        print("\nCreating wallet for receiver-4...")
        wallet = await create_wallet("receiver-6")
        
        print("\nWallet created successfully!")
        print(f"Wallet Address: {wallet.address}")
        print(f"Wallet Seed: {wallet.seed}")
        print(f"Wallet Public Key: {wallet.public_key}")
        
        logger.info("Wallet creation completed successfully")
    except Exception as e:
        logger.error(f"Failed to create wallet: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main()) 