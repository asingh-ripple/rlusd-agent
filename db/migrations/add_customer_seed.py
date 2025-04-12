#!/usr/bin/env python3
"""
Migration script to add seed customers if they don't exist.
"""

import os
import sys
from pathlib import Path

# Add the project root directory to the Python path
project_root = str(Path(__file__).parent.parent.parent)
sys.path.append(project_root)

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from db.database import Customer, CustomerType, get_db
from db.sqlite_config import get_connection_string
from config.logger_config import setup_logger
from datetime import datetime

logger = setup_logger(__name__)

def get_existing_customers():
    """Get all existing customers from the database."""
    db = get_db()
    session = db.Session()
    
    try:
        customers = session.query(Customer).all()
        return {customer.customer_id: customer for customer in customers}
    finally:
        session.close()

# Seed data with actual customer information
SEED_CUSTOMERS = [
    {
        "customer_id": "sender-1",
        "wallet_seed": "sEdTbvYhVumc89LPr6ajiKe13km37h3",
        "customer_type": CustomerType.SENDER,
        "wallet_address": "rQBsLAh7nQLdRJTJnCapCsbng5Eu8oTUHW",
        "email_address": "sender_1@metaco.com",
        "created_at": datetime(2025, 4, 9, 3, 30, 29),
        "updated_at": datetime(2025, 4, 9, 3, 30, 29)
    },
    {
        "customer_id": "receiver-1",
        "wallet_seed": "sEd7Sok4VSed8Sw5m2z9LY2YbKLT5PG",
        "customer_type": CustomerType.RECEIVER,
        "wallet_address": "rMQhytkyM4dwSJkmoAY3qxThRX2M2Py8wc",
        "email_address": "receiver_1@metaco.com",
        "created_at": datetime(2025, 4, 9, 3, 30, 29),
        "updated_at": datetime(2025, 4, 9, 3, 30, 29)
    },
    {
        "customer_id": "receiver-3",
        "wallet_seed": "sEdTy9zRMrgjqs7d14944UCdFxXdGix",
        "customer_type": CustomerType.RECEIVER,
        "wallet_address": "rEK9ZdnAxMX3eqvF8HKJdBhftcepK3by55",
        "email_address": "sender_2@metaco.com",
        "created_at": datetime(2025, 4, 9, 3, 30, 29),
        "updated_at": datetime(2025, 4, 11, 19, 48, 18, 235466)
    },
    {
        "customer_id": "receiver-2",
        "wallet_seed": "sEdTeac7Bi6x6t6c3vz74Ux7s4MPcqe",
        "customer_type": CustomerType.RECEIVER,
        "wallet_address": "rJcYDNsHc5zAEbnPMj4y27GdbL6k2XvtuX",
        "email_address": "receiver_2@metaco.com",
        "created_at": datetime(2025, 4, 9, 3, 30, 29),
        "updated_at": datetime(2025, 4, 9, 3, 30, 29)
    },
    {
        "customer_id": "receiver-4",
        "wallet_seed": "sEd7QHq54A53HVB286ApCjh9EeakzbH",
        "customer_type": CustomerType.RECEIVER,
        "wallet_address": "rU1639GkScbLsUGbPDu7D1YHdMmM8E8NfL",
        "email_address": "receiver-4@metaco.com",
        "created_at": datetime(2025, 4, 11, 19, 59, 35, 821262),
        "updated_at": datetime(2025, 4, 11, 19, 59, 35, 821267)
    },
    {
        "customer_id": "receiver-5",
        "wallet_seed": "sEdScpmaSs5zM3YWjKTHPdsBTY6ZK3L",
        "customer_type": CustomerType.RECEIVER,
        "wallet_address": "rp7mh1AJKDfJxJMx7DL3urTuW9bjRTE5Cm",
        "email_address": "receiver-5@metaco.com",
        "created_at": datetime(2025, 4, 11, 20, 0, 58, 63129),
        "updated_at": datetime(2025, 4, 11, 20, 0, 58, 63133)
    },
    {
        "customer_id": "receiver-6",
        "wallet_seed": "sEdVJRosHqNbeGm7UDKH8zCiQ8fZ2so",
        "customer_type": CustomerType.RECEIVER,
        "wallet_address": "rPbnbLavLZLhXZhgoqVFCkTuG3YFcGS3Jh",
        "email_address": "receiver-6@metaco.com",
        "created_at": datetime(2025, 4, 11, 20, 1, 26, 534804),
        "updated_at": datetime(2025, 4, 11, 20, 1, 26, 534810)
    }
]

def add_customers():
    """Delete all existing customers and add seed customers."""
    db = get_db()
    session = db.Session()
    
    try:
        # Delete all existing customers
        deleted_count = session.query(Customer).delete()
        session.commit()
        logger.info(f"Deleted {deleted_count} existing customers")
        
        # Add new customers
        added_count = 0
        for customer_data in SEED_CUSTOMERS:
            # Create new customer
            customer = Customer(
                customer_id=customer_data["customer_id"],
                wallet_seed=customer_data["wallet_seed"],
                customer_type=customer_data["customer_type"],
                wallet_address=customer_data["wallet_address"],
                email_address=customer_data["email_address"],
                created_at=customer_data["created_at"],
                updated_at=customer_data["updated_at"]
            )
            
            session.add(customer)
            logger.info(f"Added customer {customer_data['customer_id']}")
            added_count += 1
        
        session.commit()
        logger.info(f"Customer seed migration completed successfully. Deleted {deleted_count} existing customers and added {added_count} new customers.")
        
    except Exception as e:
        session.rollback()
        logger.error(f"Error during customer seed migration: {str(e)}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    add_customers() 