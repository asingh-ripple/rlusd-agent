"""
Class to represent payment transactions from the XRPL.
"""

from dataclasses import dataclass
from typing import Optional, List
from datetime import datetime
import json

# ANSI color codes
COLORS = {
    'header': '\033[1;36m',  # Cyan
    'label': '\033[1;33m',   # Yellow
    'value': '\033[0;37m',   # White
    'address': '\033[0;32m', # Green
    'amount': '\033[1;35m',  # Purple
    'timestamp': '\033[0;34m', # Blue
    'reset': '\033[0m'       # Reset
}

@dataclass
class PaymentEdge:
    """Represents a payment transaction from the XRPL."""
    sender_address: str
    receiver_address: str
    delivered_amount: str
    currency: str
    transaction_hash: str
    timestamp: datetime
    fee: str
    transaction_type: str

    @classmethod
    def from_transaction(cls, transaction: dict, sender_wallet_address: str) -> Optional['PaymentEdge']:
        """
        Create a PaymentEdge from a transaction dictionary.
        
        Args:
            transaction: Dictionary containing transaction details from XRPL
            
        Returns:
            PaymentEdge if the transaction is a payment, check cash, or check create, None otherwise
        """
        tx_json = transaction['tx_json']
        meta = transaction['meta']
        
        # Handle Payment transaction
        if tx_json['TransactionType'] == 'Payment':
            if tx_json['Destination'] == sender_wallet_address:
                return None
            print(f"Payment transaction: {json.dumps(tx_json, indent=2)}")
            
            # Handle delivered amount and currency
            delivered_amount = meta.get('delivered_amount', '0')
            currency = 'XRP'  # Default to XRP
            
            if isinstance(delivered_amount, dict):
                # For RLUSD or other issued currencies
                currency = 'RLUSD'  # or extract from currency field if needed
                delivered_amount = delivered_amount['value']
            
            return cls(
                sender_address=sender_wallet_address,
                receiver_address=tx_json['Destination'],
                delivered_amount=delivered_amount,
                currency=currency,
                transaction_hash=transaction['hash'],
                timestamp=datetime.fromisoformat(transaction['close_time_iso'].replace('Z', '+00:00')),
                fee=tx_json['Fee'],
                transaction_type='Payment'
            )
            
        # Handle CheckCash transaction
        elif tx_json['TransactionType'] == 'CheckCash':
            if tx_json['Account'] == sender_wallet_address:
                return None
            
            # Handle delivered amount and currency
            delivered_amount = meta.get('delivered_amount', '0')
            currency = 'XRP'  # Default to XRP
            
            if isinstance(delivered_amount, dict):
                # For RLUSD or other issued currencies
                currency = 'RLUSD'  # or extract from currency field if needed
                delivered_amount = delivered_amount['value']
            
            return cls(
                sender_address=sender_wallet_address,
                receiver_address=tx_json['Account'],
                delivered_amount=delivered_amount,
                currency=currency,
                transaction_hash=transaction['hash'],
                timestamp=datetime.fromisoformat(transaction['close_time_iso'].replace('Z', '+00:00')),
                fee=tx_json['Fee'],
                transaction_type='Payment'
            )
        return None

    def to_dict(self) -> dict:
        """Convert the PaymentEdge to a dictionary."""
        return {
            'sender_address': self.sender_address,
            'receiver_address': self.receiver_address,
            'delivered_amount': self.delivered_amount,
            'currency': self.currency,
            'transaction_hash': self.transaction_hash,
            'timestamp': self.timestamp.isoformat(),
            'fee': self.fee,
            'transaction_type': self.transaction_type,
        }

    def __str__(self) -> str:
        """String representation of the PaymentEdge."""
        # Format the timestamp
        formatted_time = self.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC")
        
        # Format the amount (convert drops to XRP if needed)
        amount = self.delivered_amount
        if len(amount) > 6:  # If more than 6 digits, it's in drops
            xrp_amount = float(amount) / 1_000_000
            amount_str = f"{amount} drops ({xrp_amount:.6f} XRP)"
        else:
            amount_str = f"{amount} drops"
            
        # Format the fee
        fee_xrp = float(self.fee) / 1_000_000
        fee_str = f"{self.fee} drops ({fee_xrp:.6f} XRP)"
        
        return (
            f"{COLORS['header']}Payment Transaction Details:{COLORS['reset']}\n"
            f"{COLORS['header']}-------------------------{COLORS['reset']}\n"
            f"{COLORS['label']}Type:{COLORS['reset']} {COLORS['value']}{self.transaction_type}{COLORS['reset']}\n"
            f"{COLORS['label']}Currency:{COLORS['reset']} {COLORS['value']}{self.currency}{COLORS['reset']}\n"
            f"{COLORS['label']}Hash:{COLORS['reset']} {COLORS['value']}{self.transaction_hash}{COLORS['reset']}\n"
            f"{COLORS['label']}Timestamp:{COLORS['reset']} {COLORS['timestamp']}{formatted_time}{COLORS['reset']}\n"
            f"{COLORS['label']}From:{COLORS['reset']} {COLORS['address']}{self.sender_address}{COLORS['reset']}\n"
            f"{COLORS['label']}To:{COLORS['reset']} {COLORS['address']}{self.receiver_address}{COLORS['reset']}\n"
            f"{COLORS['label']}Amount:{COLORS['reset']} {COLORS['amount']}{amount_str}{COLORS['reset']}\n"
            f"{COLORS['label']}Fee:{COLORS['reset']} {COLORS['amount']}{fee_str}{COLORS['reset']}"
        )

@dataclass
class ConsolidatedPaymentEdge:
    """Represents a consolidated payment edge between two addresses."""
    sender: str
    receiver: str
    currency: str
    payment_type: str
    amounts: List[str]
    hashes: List[str]
    fees: List[str]
    timestamps: List[datetime]
    total_amount: str
    first_transaction_timestamp: datetime
    last_transaction_timestamp: datetime
    total_transactions: int

    @classmethod
    def from_payment_edges(cls, edges: List[PaymentEdge]) -> List['ConsolidatedPaymentEdge']:
        """
        Create a list of ConsolidatedPaymentEdge objects from a list of PaymentEdge objects.
        Creates a separate consolidated edge for each unique sender-receiver-currency combination.
        
        Args:
            edges: List of PaymentEdge objects to consolidate
            
        Returns:
            List of ConsolidatedPaymentEdge objects
        """
        # Group edges by sender, receiver, and currency
        edge_groups = {}
        for edge in edges:
            key = (edge.sender_address, edge.receiver_address, edge.currency)
            if key not in edge_groups:
                edge_groups[key] = []
            edge_groups[key].append(edge)
        
        # Create consolidated edges
        consolidated_edges = []
        for (sender, receiver, currency), group_edges in edge_groups.items():
            # Sort edges by timestamp
            sorted_edges = sorted(group_edges, key=lambda x: x.timestamp)
            
            # Calculate total amount
            total_amount = sum(float(edge.delivered_amount) for edge in sorted_edges)
            
            consolidated_edge = cls(
                sender=sender,
                receiver=receiver,
                currency=currency,
                payment_type='ConsolidatedPayment',
                amounts=[edge.delivered_amount for edge in sorted_edges],
                hashes=[edge.transaction_hash for edge in sorted_edges],
                fees=[edge.fee for edge in sorted_edges],
                timestamps=[edge.timestamp for edge in sorted_edges],
                total_amount=f"{total_amount} {currency}",
                first_transaction_timestamp=sorted_edges[0].timestamp,
                last_transaction_timestamp=sorted_edges[-1].timestamp,
                total_transactions=len(sorted_edges)
            )
            consolidated_edges.append(consolidated_edge)
        
        return consolidated_edges

    def to_dict(self) -> dict:
        """Convert the ConsolidatedPaymentEdge to a dictionary."""
        return {
            'sender': self.sender,
            'receiver': self.receiver,
            'currency': self.currency,
            'payment_type': self.payment_type,
            'amounts': self.amounts,
            'hashes': self.hashes,
            'fees': self.fees,
            'timestamps': [ts.isoformat() for ts in self.timestamps],
            'total_amount': self.total_amount,
            'first_transaction_timestamp': self.first_transaction_timestamp.isoformat(),
            'last_transaction_timestamp': self.last_transaction_timestamp.isoformat(),
            'total_transactions': self.total_transactions
        }

    def __str__(self) -> str:
        """String representation of the ConsolidatedPaymentEdge."""
        # Format timestamps
        first_time = self.first_transaction_timestamp.strftime("%Y-%m-%d %H:%M:%S UTC")
        last_time = self.last_transaction_timestamp.strftime("%Y-%m-%d %H:%M:%S UTC")
        
        # Calculate total fees
        total_fees = sum(int(fee) for fee in self.fees)
        total_fees_xrp = float(total_fees) / 1_000_000
        
        return (
            f"{COLORS['header']}Consolidated Payment Details:{COLORS['reset']}\n"
            f"{COLORS['header']}-------------------------{COLORS['reset']}\n"
            f"{COLORS['label']}Type:{COLORS['reset']} {COLORS['value']}{self.payment_type}{COLORS['reset']}\n"
            f"{COLORS['label']}Currency:{COLORS['reset']} {COLORS['value']}{self.currency}{COLORS['reset']}\n"
            f"{COLORS['label']}From:{COLORS['reset']} {COLORS['address']}{self.sender}{COLORS['reset']}\n"
            f"{COLORS['label']}To:{COLORS['reset']} {COLORS['address']}{self.receiver}{COLORS['reset']}\n"
            f"{COLORS['label']}Total Amount:{COLORS['reset']} {COLORS['amount']}{self.total_amount}{COLORS['reset']}\n"
            f"{COLORS['label']}Total Fees:{COLORS['reset']} {COLORS['amount']}{total_fees} drops ({total_fees_xrp:.6f} XRP){COLORS['reset']}\n"
            f"{COLORS['label']}Total Transactions:{COLORS['reset']} {COLORS['value']}{self.total_transactions}{COLORS['reset']}\n"
            f"{COLORS['label']}First Transaction:{COLORS['reset']} {COLORS['timestamp']}{first_time}{COLORS['reset']}\n"
            f"{COLORS['label']}Last Transaction:{COLORS['reset']} {COLORS['timestamp']}{last_time}{COLORS['reset']}"
        )