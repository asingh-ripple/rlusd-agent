#!/usr/bin/env python3
"""
Script to populate CustomerDetails table with charity information.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config.logger_config import setup_logger
from db.config import SQLITE_URL
from db.database import Customer, CustomerType, CustomerDetails

# Set up logging
logger = setup_logger(__name__)

# Charity data
CHARITIES = [
    {
        "name": "Global Relief Disaster Response",
        "goal": 1000000.00,
        "description": "Providing immediate relief and long-term recovery support to communities affected by natural disasters worldwide."
    },
    {
        "name": "Rebuilding After the Storm with ShelterNow",
        "goal": 750000.00,
        "description": "Building resilient homes and communities for families displaced by severe weather events."
    },
    {
        "name": "Mobile Clinics for Crisis Zones with HealthBridge",
        "goal": 500000.00,
        "description": "Delivering essential medical care and supplies to underserved populations in conflict and disaster areas."
    },
    {
        "name": "Emergency Aid in Gaza with Humanity Frontline",
        "goal": 2500000.00,
        "description": "Providing critical humanitarian assistance and medical support to affected communities in Gaza."
    },
    {
        "name": "Combating Cholera with CleanMedic Haiti",
        "goal": 300000.00,
        "description": "Implementing water purification systems and medical interventions to prevent cholera outbreaks in Haiti."
    },
    {
        "name": "Feeding Children in Drought with NourishNow",
        "goal": 600000.00,
        "description": "Ensuring food security and nutrition for children in drought-affected regions through sustainable solutions."
    }
]

def populate_charity_details(session):
    """Populate CustomerDetails table with charity information."""
    try:
        # Get all receivers
        receivers = session.query(Customer).filter_by(customer_type=CustomerType.RECEIVER).all()
        
        if len(receivers) < len(CHARITIES):
            logger.error(f"Not enough receivers in database. Found {len(receivers)}, need {len(CHARITIES)}")
            return False

        # Add charity details for each receiver
        for i, charity in enumerate(CHARITIES):
            receiver = receivers[i]
            
            # Check if details already exist
            existing_details = session.query(CustomerDetails).filter_by(customer_id=receiver.customer_id).first()
            if existing_details:
                logger.info(f"Details already exist for {receiver.customer_id}")
                continue
            
            # Create new details
            new_details = CustomerDetails(
                customer_id=receiver.customer_id,
                name=charity["name"],
                goal=charity["goal"],
                description=charity["description"],
                total_donations=0
            )
            
            session.add(new_details)
            logger.info(f"Added details for {receiver.customer_id}: {charity['name']}")
        
        session.commit()
        logger.info("Successfully populated charity details")
        return True
    except Exception as e:
        session.rollback()
        logger.error(f"Error populating charity details: {e}")
        return False

def main():
    """Run the script."""
    try:
        engine = create_engine(SQLITE_URL)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        if populate_charity_details(session):
            # Print results for validation
            print("\nCharity Details Added:")
            details = session.query(CustomerDetails).all()
            for detail in details:
                print(f"\nCustomer ID: {detail.customer_id}")
                print(f"Name: {detail.name}")
                print(f"Goal: ${detail.goal:,.2f}")
                print(f"Description: {detail.description}")
                print(f"Total Donations: {detail.total_donations}")
            
            logger.info("Script completed successfully")
        else:
            logger.error("Script failed to populate charity details")
    except Exception as e:
        logger.error(f"Script failed: {e}")
        raise
    finally:
        if 'session' in locals():
            session.close()

if __name__ == "__main__":
    main() 