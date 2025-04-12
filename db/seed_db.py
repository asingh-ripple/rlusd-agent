#!/usr/bin/env python3
"""
Script to seed the database with test data.
"""

from database import get_db, Customer, CustomerType, Transaction, TransactionType, TransactionStatus
from sqlite_config import get_connection_string
from config.logger_config import setup_logger
from datetime import datetime

logger = setup_logger(__name__)

# Test data
TEST_CUSTOMERS = [
    {
        "customer_id": "sender-1",
        "email_address": "sender1@example.com",
        "wallet_address": "rQBsLAh7nQLdRJTJnCapCsbng5Eu8oTUHW",
        "customer_type": CustomerType.SENDER
    },
    {
        "customer_id": "sender-2",
        "email_address": "sender2@example.com",
        "wallet_address": "rMQhytkyM4dwSJkmoAY3qxThRX2M2Py8wc",
        "customer_type": CustomerType.SENDER
    },
    {
        "customer_id": "receiver-1",
        "email_address": "receiver1@example.com",
        "wallet_address": "rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV",
        "customer_type": CustomerType.RECEIVER
    },
    {
        "customer_id": "receiver-2",
        "email_address": "receiver2@example.com",
        "wallet_address": "rMQhytkyM4dwSJkmoAY3qxThRX2M2Py8wc",
        "customer_type": CustomerType.RECEIVER
    }
]

# Test relationships
TEST_RELATIONSHIPS = [
    {"sender_id": "sender-1", "receiver_id": "receiver-1"},
    {"sender_id": "sender-1", "receiver_id": "receiver-2"},
    {"sender_id": "sender-2", "receiver_id": "receiver-1"},
    {"sender_id": "sender-2", "receiver_id": "receiver-2"}
]

# Test transactions
TEST_TRANSACTIONS = [
    {
        "transaction_hash": "tx1",
        "sender_id": "sender-1",
        "receiver_id": "receiver-1",
        "amount": 1000.0,
        "currency": "RLUSD",
        "transaction_type": TransactionType.PAYMENT,
        "status": TransactionStatus.SUCCESSFUL
    },
    {
        "transaction_hash": "tx2",
        "sender_id": "sender-2",
        "receiver_id": "receiver-2",
        "amount": 2000.0,
        "currency": "RLUSD",
        "transaction_type": TransactionType.PAYMENT,
        "status": TransactionStatus.SUCCESSFUL
    }
]

def seed_database():
    """Seed the database with test data."""
    db = get_db()
    
    print("\n=== Seeding Database ===")
    
    # Clear existing data
    print("\nClearing existing data...")
    db.clear_all_data()
    
    # Add customers
    print("\nAdding customers...")
    for customer_data in TEST_CUSTOMERS:
        try:
            print(f"\nAdding customer: {customer_data['customer_id']}")
            db.insert_customer(
                customer_id=customer_data['customer_id'],
                email_address=customer_data['email_address'],
                wallet_address=customer_data['wallet_address'],
                customer_type=customer_data['customer_type']
            )
            print(f"✓ Successfully added {customer_data['customer_id']}")
        except Exception as e:
            print(f"Error adding {customer_data['customer_id']}: {str(e)}")
    
    # Add relationships
    print("\nAdding customer relationships...")
    for relationship in TEST_RELATIONSHIPS:
        try:
            print(f"\nAdding relationship: {relationship['sender_id']} -> {relationship['receiver_id']}")
            db.add_relationship(
                sender_id=relationship['sender_id'],
                receiver_id=relationship['receiver_id']
            )
            print(f"✓ Successfully added relationship")
        except Exception as e:
            print(f"Error adding relationship: {str(e)}")
    
    # Add transactions
    print("\nAdding transactions...")
    for transaction in TEST_TRANSACTIONS:
        try:
            print(f"\nAdding transaction: {transaction['transaction_hash']}")
            db.insert_transaction(
                transaction_hash=transaction['transaction_hash'],
                sender_id=transaction['sender_id'],
                receiver_id=transaction['receiver_id'],
                amount=transaction['amount'],
                currency=transaction['currency'],
                transaction_type=transaction['transaction_type'],
                status=transaction['status']
            )
            print(f"✓ Successfully added transaction")
        except Exception as e:
            print(f"Error adding transaction: {str(e)}")
    
    # Verify the data
    print("\nVerifying seeded data...")
    
    # Verify customers
    customers = db.get_all_customers()
    print(f"\nFound {len(customers)} customers:")
    for customer in customers:
        print(f"\nCustomer: {customer.customer_id}")
        print(f"Type: {customer.customer_type}")
        print(f"Wallet: {customer.wallet_address}")
    
    # Verify relationships
    print("\nVerifying relationships...")
    for customer in customers:
        if customer.customer_type == CustomerType.SENDER:
            receivers = db.get_receivers(customer.customer_id)
            print(f"\nSender {customer.customer_id} has {len(receivers)} receivers:")
            for receiver in receivers:
                print(f"- {receiver.customer_id}")
    
    print("\n=== Database Seeding Complete ===")

if __name__ == "__main__":
    seed_database() 