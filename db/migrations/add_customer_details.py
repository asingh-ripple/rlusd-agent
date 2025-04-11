#!/usr/bin/env python3
"""
Migration to add customer_details table and populate it with charity data.
"""

from sqlalchemy import Column, String, Numeric, Integer, ForeignKey, text, inspect
from sqlalchemy.orm import sessionmaker
from config.logger_config import setup_logger
from db.config import SQLITE_URL
from db.database import Base, Customer, CustomerType

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

def create_customer_details_table(engine):
    """Create the customer_details table if it doesn't exist."""
    try:
        # Check if table exists
        inspector = inspect(engine)
        if 'customer_details' not in inspector.get_table_names():
            # Create table
            Base.metadata.tables['customer_details'].create(engine)
            logger.info("Created customer_details table")
        else:
            logger.info("customer_details table already exists")
    except Exception as e:
        logger.error(f"Error creating customer_details table: {e}")
        raise

def add_charity_data(session):
    """Add charity data to the database."""
    try:
        # Get existing receivers or create new ones
        receivers = session.query(Customer).filter_by(customer_type=CustomerType.RECEIVER).all()
        
        # Create new receivers if needed
        while len(receivers) < len(CHARITIES):
            new_id = f"receiver-{len(receivers) + 1}"
            new_receiver = Customer(
                customer_id=new_id,
                customer_type=CustomerType.RECEIVER,
                wallet_seed=f"seed_for_{new_id}"  # This will be updated later with actual addresses
            )
            session.add(new_receiver)
            receivers.append(new_receiver)
        
        # Add charity details
        for i, charity in enumerate(CHARITIES):
            receiver = receivers[i]
            session.execute(text("""
                INSERT INTO customer_details 
                (customer_id, name, goal, description, total_donations)
                VALUES (:customer_id, :name, :goal, :description, 0)
            """), {
                "customer_id": receiver.customer_id,
                "name": charity["name"],
                "goal": charity["goal"],
                "description": charity["description"]
            })
        
        session.commit()
        logger.info("Successfully added charity data")
    except Exception as e:
        session.rollback()
        logger.error(f"Error adding charity data: {e}")
        raise

def main():
    """Run the migration."""
    try:
        from sqlalchemy import create_engine, inspect
        engine = create_engine(SQLITE_URL)
        
        # Create table
        create_customer_details_table(engine)
        
        # Create session and add data
        Session = sessionmaker(bind=engine)
        session = Session()
        add_charity_data(session)
        
        logger.info("Migration completed successfully")
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        raise
    finally:
        if 'session' in locals():
            session.close()

if __name__ == "__main__":
    main() 