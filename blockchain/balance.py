#!/usr/bin/env python3
"""
Module for handling account balance operations on the XRPL blockchain.
This module provides functionality to:
- Get account balances
- Monitor balance changes
- Track balance history
"""

import asyncio
from typing import Dict, List, Optional
from xrpl.models.requests import AccountInfo
from xrpl.models.response import ResponseStatus

from .client import get_client
# from ..config.logger_config import setup_logger

# logger = setup_logger(__name__)

async def get_account_balance(account_address: str) -> Optional[Dict]:
    """
    Get the current balance for an XRPL account.
    
    Args:
        account_address: The XRPL account address to query
        
    Returns:
        Dictionary containing balance information or None if error occurs
    """
    try:
        client = get_client()
        request = AccountInfo(account=account_address)
        response = await client.request(request)
        
        if response.status != ResponseStatus.SUCCESS:
            # logger.error(f"Error getting account balance: {response.result}")
            return None
            
        return response.result
        
    except Exception as e:
        # logger.error(f"Exception getting account balance: {str(e)}")
        return None

async def get_formatted_balance(account_address: str) -> Optional[Dict]:
    """
    Get formatted balance information for an account.
    
    Args:
        account_address: The XRPL account address to query
        
    Returns:
        Dictionary containing formatted balance information or None if error occurs
    """
    try:
        print(f"\nGetting balance for account: {account_address}")
        if not account_address:
            print("Error: Empty account address provided")
            return None
            
        balance_info = await get_account_balance(account_address)
        if not balance_info:
            print(f"Error: Could not get balance info for account {account_address}")
            return None
            
        print(f"Raw balance info: {balance_info}")
        account_data = balance_info.get('account_data', {})
        
        if not account_data:
            print(f"Error: No account data found for {account_address}")
            return None
            
        formatted_balance = {
            'public_address': account_address,
            'balance': account_data.get('Balance', '0'),
            'sequence': account_data.get('Sequence', 0)
        }
        
        print(f"Formatted balance: {formatted_balance}")
        return formatted_balance
        
    except Exception as e:
        print(f"Exception in get_formatted_balance: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return None

async def main():
    """Main function to demonstrate balance retrieval."""
    # Example usage
    account_address = "rQBsLAh7nQLdRJTJnCapCsbng5Eu8oTUHW"
    balance_info = await get_account_balance(account_address)
    
    if balance_info:
        print(f"\nBalance information for {account_address}:")
        print(f"Account Data: {balance_info.get('account_data', {})}")
    else:
        print("\nFailed to get balance information")

if __name__ == "__main__":
    asyncio.run(main()) 