#!/usr/bin/env python3
"""
Script to seed the database with test data.
"""

import os
import sys
from datetime import datetime
from sqlalchemy import create_engine, text, MetaData, inspect

# Add the parent directory to the path to import the database module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.database import (
    init_db, get_db, Customer, CustomerType, 
    Transaction, TransactionType, TransactionStatus,
    DonationStatus, Cause, Donations, DisbursementStatus
)
from db.config import SQLITE_URL
from config.logger_config import setup_logger
from db.seed_causes import seed_causes, seed_customers

logger = setup_logger(__name__)

# Test data
# TEST_CUSTOMERS = [
#     {
#         "customer_id": "sender-1",
#         "email_address": "sender1@example.com",
#         "wallet_address": "rQBsLAh7nQLdRJTJnCapCsbng5Eu8oTUHW",
#         "wallet_seed": "sEdSCgE57Qvs6NHJDc6aRkXPz5A1AE",
#         "customer_type": CustomerType.SENDER
#     },
#     {
#         "customer_id": "sender-2",
#         "email_address": "sender2@example.com",
#         "wallet_address": "rMQhytkyM4dwSJkmoAY3qxThRX2M2Py8wc",
#         "wallet_seed": "sEd56SLmRgdRENTjdEwU3AJezmGSD9",
#         "customer_type": CustomerType.SENDER
#     },
#     {
#         "customer_id": "receiver-1",
#         "email_address": "receiver1@example.com",
#         "wallet_address": "rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV",
#         "wallet_seed": "sEdVTRwb6r8ufPuUQ4fbUDhfLZxcZC",
#         "customer_type": CustomerType.RECEIVER
#     },
#     {
#         "customer_id": "receiver-2",
#         "email_address": "receiver2@example.com",
#         "wallet_address": "rMQhytkyM4dwSJkmoAY3qxThRX2M2Py8wc",
#         "wallet_seed": "sEdSzyFa6XP3RwYbNTrTFneMBuLxWy",
#         "customer_type": CustomerType.RECEIVER
#     }
# ]

# Test transactions
# TEST_TRANSACTIONS = [
#     {
#         "transaction_hash": "tx1",
#         "sender_id": "sender-1",
#         "receiver_id": "receiver-1",
#         "amount": 1000.0,
#         "currency": "RLUSD",
#         "transaction_type": TransactionType.PAYMENT,
#         "status": TransactionStatus.SUCCESS
#     },
#     {
#         "transaction_hash": "tx2",
#         "sender_id": "sender-2",
#         "receiver_id": "receiver-2",
#         "amount": 2000.0,
#         "currency": "RLUSD",
#         "transaction_type": TransactionType.PAYMENT,
#         "status": TransactionStatus.SUCCESS
#     }
# ]

# Test donations
TEST_DONATIONS = [
    {
        "donation_id": "don-1",
        "customer_id": "sender-1",
        "cause_id": "1",
        "amount": 500.0,
        "currency": "RLUSD",
        "status": DonationStatus.COMPLETED,
        "donation_date": datetime.utcnow()
    },
    {
        "donation_id": "don-2",
        "customer_id": "sender-2",
        "cause_id": "3",
        "amount": 750.0,
        "currency": "RLUSD",
        "status": DonationStatus.COMPLETED,
        "donation_date": datetime.utcnow()
    }
]

# Test disbursements
TEST_DISBURSEMENTS = [
    {
        "disbursement_id": "disb-1",
        "cause_id": "1",
        "amount": 350.0,
        "currency": "RLUSD",
        "status": DisbursementStatus.COMPLETED,
        "disbursement_date": datetime.utcnow()
    }
]

def clear_tables(db):
    """Clear all data from the database tables"""
    session = db.Session()
    try:
        print("Clearing existing data...")
        
        # If the database is a file, we can also delete and recreate it
        if SQLITE_URL.startswith('sqlite:///'):
            db_path = SQLITE_URL.replace('sqlite:///', '')
            session.close()
            if os.path.exists(db_path):
                print(f"Removing database file: {db_path}")
                os.remove(db_path)
                print("Database file removed")
        print("Database cleared successfully")
    except Exception as e:
        session.rollback()
        print(f"Error clearing database: {str(e)}")
        raise
    finally:
        session.close()

def seed_database():
    """Seed the database with test data."""
    # print("\n=== Clearing Database ===")
    # Clear existing data
    # clear_tables(db)

    print("\n=== Seeding Database ===")
    # Initialize the database
    init_db(SQLITE_URL)
    db = get_db()
    
    # Add transactions
    # print("\nAdding transactions...")
    # for transaction in TEST_TRANSACTIONS:
    #     try:
    #         print(f"\nAdding transaction: {transaction['transaction_hash']}")
    #         db.insert_transaction(
    #             transaction_hash=transaction['transaction_hash'],
    #             sender_id=transaction['sender_id'],
    #             receiver_id=transaction['receiver_id'],
    #             amount=transaction['amount'],
    #             currency=transaction['currency'],
    #             transaction_type=transaction['transaction_type'],
    #             status=transaction['status']
    #         )
    #         print(f"✓ Successfully added transaction")
    #     except Exception as e:
    #         print(f"Error adding transaction: {str(e)}")
    
    # Seed causes
    print("\nSeeding causes...")
    session = db.Session()
    try:
        print("Seeding causes...")
        seed_causes(session)
        print("Causes seeded successfully")
        print("Seeding customers...")
        seed_customers(session)
        print("Customers seeded successfully")
    except Exception as e:
        print(f"Error seeding causes: {str(e)}")
    
    # Verify the data
    print("\nVerifying seeded data...")
    
    # Verify customers
    customers = db.get_all_customers()
    print(f"\nFound {len(customers)} customers:")
    for customer in customers:
        print(f"\nCustomer: {customer.customer_id}")
        print(f"Type: {customer.customer_type}")
        print(f"Wallet: {customer.wallet_address}")
    causes = db.get_all_causes()
    print(f"\nFound {len(causes)} causes:")
    for cause in causes:
        print(f"\nCause: {cause.cause_id}")
        print(f"Name: {cause.name}")
        print(f"Balance: {cause.balance}")
    
    print("\n=== Database Seeding Complete ===")

if __name__ == "__main__":
    seed_database()