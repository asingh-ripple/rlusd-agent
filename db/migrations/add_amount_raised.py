#!/usr/bin/env python3
"""
Migration to add amount_raised column to customer_details table and populate it with random values.
"""

import random
from decimal import Decimal
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config.logger_config import setup_logger
from db.config import SQLITE_URL
from db.database import CustomerDetails

# Set up logging
logger = setup_logger(__name__)

def add_amount_raised_column(session):
    """Add amount_raised column and populate it with random values."""
    try:
        # Check if column exists
        result = session.execute(text("""
            SELECT COUNT(*) FROM pragma_table_info('customer_details') 
            WHERE name='amount_raised'
        """))
        column_exists = result.scalar() > 0
        
        if not column_exists:
            # Add the column if it doesn't exist
            session.execute(text("""
                ALTER TABLE customer_details 
                ADD COLUMN amount_raised INTEGER
            """))
            logger.info("Added amount_raised column")
        
        # Update each charity with a random amount raised (less than their goal)
        charities = session.query(CustomerDetails).all()
        for charity in charities:
            # Convert goal to float for calculation
            goal_float = float(charity.goal)
            
            # Generate a random amount between 10% and 90% of the goal
            min_amount = int(goal_float * 0.1)
            max_amount = int(goal_float * 0.9)
            amount_raised = random.randint(min_amount, max_amount)
            
            session.execute(text("""
                UPDATE customer_details 
                SET amount_raised = :amount_raised
                WHERE customer_id = :customer_id
            """), {
                "amount_raised": amount_raised,
                "customer_id": charity.customer_id
            })
        
        session.commit()
        logger.info("Successfully populated amount_raised values")
        return True
    except Exception as e:
        session.rollback()
        logger.error(f"Error updating amount_raised values: {e}")
        return False

def main():
    """Run the migration."""
    try:
        engine = create_engine(SQLITE_URL)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        if add_amount_raised_column(session):
            # Print results for validation
            print("\nUpdated Charity Details:")
            charities = session.query(CustomerDetails).all()
            for charity in charities:
                print(f"\nCustomer ID: {charity.customer_id}")
                print(f"Name: {charity.name}")
                print(f"Goal: ${float(charity.goal):,.2f}")
                print(f"Amount Raised: ${charity.amount_raised:,.2f}")
                print(f"Progress: {(charity.amount_raised/float(charity.goal)*100):.1f}%")
            
            logger.info("Migration completed successfully")
        else:
            logger.error("Migration failed")
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        raise
    finally:
        if 'session' in locals():
            session.close()

if __name__ == "__main__":
    main() 