#!/usr/bin/env python3
"""
Script to run experiments with blockchain module and database.
"""

import asyncio
import traceback
import json
from typing import List, Dict, Any
from xrpl.models.requests import AccountTx
from xrpl.models.response import ResponseStatus
from db.database import get_db
from blockchain.client import get_client
from blockchain.payment_edge import PaymentEdge, ConsolidatedPaymentEdge
from blockchain.trace_utils import extract_payment_transactions, print_payment_transactions, get_unique_receivers
db = get_db()
async def get_transaction_history(sender_wallet_address: str) -> List[PaymentEdge]:
    """
    Get transaction history for a customer.
    
    Args:
        customer_id: The customer's ID
        
    Returns:
        List of PaymentNode objects representing the transactions
    """
    client = None
    try:
        # Get customer from database
            
        # Get XRPL client
        client = get_client()
        
        # Get payment transactions from XRPL
        request = AccountTx(account=sender_wallet_address, ledger_index_max=-1, limit=20)  # Increased limit
        response = await client.request(request)
        
        # # Print complete response
        # print("\nComplete XRPL Response:")
        # print(json.dumps(response.result, indent=2))
        
        if response.status != ResponseStatus.SUCCESS:
            print(f"Error getting transactions: {response.result}")
            return []
            
        # Extract payment transactions
        payment_edges = extract_payment_transactions(response, sender_wallet_address)
            
        return payment_edges
        
    except Exception as e:
        print("Full error traceback:")
        traceback.print_exc()
        return []
    
async def get_consolidated_payment_edges(sender_wallet_address: str) -> List[ConsolidatedPaymentEdge]:
    """
    Get consolidated payment edges for a customer.
    """
    payment_nodes = await get_transaction_history(sender_wallet_address)
    if not payment_nodes:
        print("No transactions found")
        return
        
    print(f"\nFound {len(payment_nodes)} transactions for {sender_wallet_address}:")
    for node in payment_nodes:
        print("\n" + str(node))  # This will use the colored __str__ method

    consolidated_payment_edges = ConsolidatedPaymentEdge.from_payment_edges(payment_nodes)
    print(f"\nConsolidated payment edges:")
    for edge in consolidated_payment_edges:
        print("\n" + str(edge))
    return consolidated_payment_edges

async def get_all_consolidated_edges(customer_id: str, max_depth: int = 10) -> List[ConsolidatedPaymentEdge]:
    """
    Get all consolidated payment edges up to a specified depth.
    
    Args:
        customer_id: The customer's ID to start from
        max_depth: Maximum depth to traverse (default: 10)
        
    Returns:
        List of all ConsolidatedPaymentEdge objects found
    """
    all_consolidated_edges = [] # List of all consolidated edges
    visited_addresses = set() # Set of visited addresses
    unique_receivers_queue = asyncio.Queue() # Queue of unique receivers
    
    # Get initial customer's wallet address
    sender_wallet_address = db.get_customer(customer_id).wallet_address

    # Initialize the queue with the first node to visit
    await unique_receivers_queue.put(sender_wallet_address)
    
    # Process receivers up to max_depth
    depth = 0
    while not unique_receivers_queue.empty() and depth < max_depth:
        depth += 1
        current_address = await unique_receivers_queue.get()
        
        # Get consolidated edges for this receiver
        consolidated_payment_edges = await get_consolidated_payment_edges(current_address)
        if consolidated_payment_edges:
            all_consolidated_edges.extend(consolidated_payment_edges)
            
            # Get new unique receivers
            adjacent_nodes = get_unique_receivers(consolidated_payment_edges)
            if adjacent_nodes:
                for adjacent_node in adjacent_nodes:
                    if adjacent_node not in visited_addresses:
                        await unique_receivers_queue.put(adjacent_node)
        
        # Add current address to visited set
        visited_addresses.add(current_address)
    
    return all_consolidated_edges

async def main():
    """Main function to demonstrate transaction history retrieval."""
    # Test customer ID
    customer_id = "sender-1"
    max_depth = 10

    print(f"\nGetting transaction history for customer {customer_id}...")
    all_edges = await get_all_consolidated_edges(customer_id, max_depth)
    
    # Print all consolidated edges
    print(f"\nFound {len(all_edges)} consolidated edges:")
    for edge in all_edges:
        print("\n" + str(edge))

if __name__ == "__main__":
    asyncio.run(main()) 