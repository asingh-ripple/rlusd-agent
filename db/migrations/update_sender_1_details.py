#!/usr/bin/env python3
"""
Script to update sender-1's customer details.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config.logger_config import setup_logger
from db.config import SQLITE_URL
from db.database import CustomerDetails

# Set up logging
logger = setup_logger(__name__)

def update_sender_1_details(session):
    """Update sender-1's customer details."""
    try:
        # Check if details exist
        details = session.query(CustomerDetails).filter_by(customer_id="sender-1").first()
        
        if not details:
            # Create new details if they don't exist
            details = CustomerDetails(
                customer_id="sender-1",
                name="HopeAid Connect",
                description="Crisis Response funds that connects numerous funds.",
                goal=0,  # Default goal
                total_donations=0,
                amount_raised=0
            )
            session.add(details)
            logger.info("Created new details for sender-1")
        else:
            # Update existing details
            details.name = "HopeAid Connect"
            details.description = "Crisis Response funds that connects numerous funds."
            logger.info("Updated existing details for sender-1")
        
        session.commit()
        return True
    except Exception as e:
        session.rollback()
        logger.error(f"Error updating sender-1 details: {e}")
        return False

def main():
    """Run the script."""
    try:
        engine = create_engine(SQLITE_URL)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        if update_sender_1_details(session):
            # Print results for validation
            details = session.query(CustomerDetails).filter_by(customer_id="sender-1").first()
            print("\nUpdated Sender-1 Details:")
            print(f"Customer ID: {details.customer_id}")
            print(f"Name: {details.name}")
            print(f"Description: {details.description}")
            print(f"Goal: ${float(details.goal):,.2f}")
            print(f"Amount Raised: ${details.amount_raised:,.2f}")
            print(f"Total Donations: {details.total_donations}")
            
            logger.info("Script completed successfully")
        else:
            logger.error("Script failed")
    except Exception as e:
        logger.error(f"Script failed: {e}")
        raise
    finally:
        if 'session' in locals():
            session.close()

if __name__ == "__main__":
    main() 