"""
Utility functions for working with XRPL transactions.
"""

from typing import Set, List
from .payment_edge import PaymentEdge, ConsolidatedPaymentEdge

def extract_payment_transactions(transactions_response: dict, sender_wallet_address: str) -> List[PaymentEdge]:
    """
    Extract payment transactions from an XRPL transaction response.
    
    Args:
        transactions_response: Response from xrpl.account.get_account_payment_transactions
        
    Returns:
        List of PaymentEdge objects representing payment transactions
    """
    payment_nodes = []
    
    # Get the transactions list from the response
    transactions = transactions_response.result.get('transactions', [])
    
    for transaction in transactions:
        # Create PaymentEdge and let it handle the filtering
        payment_node = PaymentEdge.from_transaction(transaction, sender_wallet_address)
        if payment_node and payment_node.currency == "RLUSD":
            payment_nodes.append(payment_node)
    
    return payment_nodes

def print_payment_transactions(payment_nodes: List[PaymentEdge]) -> None:
    """
    Print payment transactions in a readable format.
    
    Args:
        payment_nodes: List of PaymentEdge objects to print
    """
    # for i, node in enumerate(payment_nodes, 1):
    #     print(f"\nTransaction {i}:")
    #     print(f"Hash: {node.transaction_hash}")
    #     print(f"Timestamp: {node.timestamp}")
    #     print(f"From: {node.sender_address}")
    #     print(f"To: {node.receiver_address}")
    #     print(f"Amount: {node.delivered_amount} drops")
    #     print(f"Fee: {node.fee} drops")

def get_unique_receivers(consolidated_payment_edges: List[ConsolidatedPaymentEdge]) -> Set[str]:
    """
    Get a list of unique receiver addresses from a list of consolidated payment edges.
    
    Args:
        consolidated_payment_edges: List of ConsolidatedPaymentEdge objects

    Returns:
        List of unique receiver addresses
    """
    if not consolidated_payment_edges:
        return None
    return set(edge.receiver for edge in consolidated_payment_edges)
