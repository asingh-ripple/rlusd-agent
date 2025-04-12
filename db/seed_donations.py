"""
Seed script to populate the donations table with sample data.
"""

from datetime import datetime, timedelta
from typing import List
from db.database import get_db, Donations, DonationStatus
from db.sqlite_config import get_connection_string
from db.database import init_db
import logging

logger = logging.getLogger(__name__)

def seed_donations(should_clear: bool = False) -> None:
    """
    Seed the donations table with sample data.
    
    Args:
        should_clear: If True, clear existing donations before seeding
    """
    db = get_db()
    session = db.Session()
    
    try:
        if should_clear:
            logger.info("Clearing existing donations...")
            session.query(Donations).delete()
            session.commit()
        
        # Sample donation data
        sample_donations = [
            # Pending donations for customer-1
            Donations(
                donation_id="donation-1",
                customer_id="donor-1",
                cause_id="customer-2",
                amount=500.00,
                currency="USD",
                status=DonationStatus.PENDING,
                donation_date=datetime.now() - timedelta(days=5)
            ),
            Donations(
                donation_id="donation-2",
                customer_id="donor-2",
                cause_id="customer-2",
                amount=500.00,
                currency="USD",
                status=DonationStatus.PENDING,
                donation_date=datetime.now() - timedelta(days=4)
            ),
            
            # Pending donations for customer-2
            Donations(
                donation_id="donation-3",
                customer_id="donor-3",
                cause_id="customer-2",
                amount=200.00,
                currency="USD",
                status=DonationStatus.PENDING,
                donation_date=datetime.now() - timedelta(days=3)
            ),
            Donations(
                donation_id="donation-4",
                customer_id="donor-4",
                cause_id="customer-2",
                amount=250.00,
                currency="USD",
                status=DonationStatus.PENDING,
                donation_date=datetime.now() - timedelta(days=2)
            ),
        ]
        
        # Add all donations
        for donation in sample_donations:
            session.add(donation)
            logger.info(f"Added donation: {donation.donation_id} for customer {donation.customer_id}")
        
        session.commit()
        logger.info("Successfully seeded donations table")
        
    except Exception as e:
        session.rollback()
        logger.error(f"Error seeding donations: {str(e)}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    # Initialize logging
    logging.basicConfig(level=logging.INFO)
    
    # Initialize database
    init_db(get_connection_string())
    
    # Seed donations
    seed_donations(should_clear=True) 