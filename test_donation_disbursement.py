"""
Test script for donation disbursement logic.
"""

from typing import List, Dict, Set, Optional
from datetime import datetime
from db.database import get_db, Donations, DonationStatus, DisbursementsDonations
from config.logger_config import setup_logger
from db.database import init_db
from db.sqlite_config import get_connection_string

# Initialize database with connection string
init_db(get_connection_string())
logger = setup_logger(__name__)

def get_all_donations() -> List[Donations]:
    """
    Get all donations from the database for debugging.
    """
    db = get_db()
    session = db.Session()
    try:
        donations = session.query(Donations).all()
        logger.info(f"Found {len(donations)} total donations in database")
        return donations
    finally:
        session.close()

def get_pending_donations(cause_id: str) -> List[Donations]:
    """
    Get all pending donations for a cause, sorted by donation date (earliest first).
    
    Args:
        cause_id: The cause ID to look up
        
    Returns:
        List of pending donations, sorted by donation date
    """
    db = get_db()
    session = db.Session()
    try:
        # First, let's see what donations exist for this cause_id regardless of status
        all_cause_donations = session.query(Donations).filter(
            Donations.cause_id == cause_id
        ).all()
        
        logger.info(f"Found {len(all_cause_donations)} total donations for cause {cause_id}")
        for donation in all_cause_donations:
            logger.info(f"Donation: id={donation.donation_id}, cause={donation.cause_id}, status={donation.status}")
        
        # Now get only pending ones
        donations = session.query(Donations).filter(
            Donations.cause_id == cause_id,
            Donations.status == DonationStatus.PENDING
        ).order_by(Donations.donation_date.asc()).all()
        
        logger.info(f"Found {len(donations)} pending donations for cause {cause_id}")
        return donations
    finally:
        session.close()

def calculate_disbursement(donations: List[Donations], payment_amount: float) -> Dict[str, Dict[str, any]]:
    """
    Calculate how much each donor's donation should be fulfilled.
    
    Args:
        donations: List of pending donations, sorted by donation date
        payment_amount: Total amount available for disbursement
        
    Returns:
        Dictionary mapping donor IDs to their fulfilled amounts and donation IDs
    """
    remaining_amount = payment_amount
    donor_info: Dict[str, Dict[str, any]] = {}
    
    for donation in donations:
        if remaining_amount <= 0:
            break
            
        donor_id = donation.customer_id
        donation_amount = float(donation.amount)
        
        # Calculate how much of this donation can be fulfilled
        fulfillment_amount = min(donation_amount, remaining_amount)
        
        donor_info[donor_id] = {
            'amount': fulfillment_amount,
            'donation_id': donation.donation_id,
            'original_amount': donation_amount
        }
        remaining_amount -= fulfillment_amount
            
    return donor_info

def insert_disbursement_donations(donation_id: str, disbursement_id: str, amount: float, cause_id: str, donor_id: str):
    """
    Insert a disbursement donation record.
    
    Args:
        donation_id: The ID of the donation being fulfilled
        disbursement_id: The transaction hash to use as disbursement_id
        amount: The amount being fulfilled
    """
    db = get_db()
    session = db.Session()
    try:
        disbursement_donation = DisbursementsDonations(
            donation_id=donation_id,
            disbursement_id=disbursement_id,
            amount=amount,
            cause_id=cause_id,
            donor_id=donor_id
        )
        session.add(disbursement_donation)
        logger.info(f"Added disbursement donation: donation_id={donation_id}, amount={amount}")
        
        session.commit()
        logger.info("Successfully inserted disbursement donation")
    except Exception as e:
        session.rollback()
        logger.error(f"Error inserting disbursement donation: {str(e)}")
        raise
    finally:
        session.close()

def test_disbursement_logic(cause_id: str, amount: float, transaction_hash: str):
    """
    Test the donation disbursement logic for a given cause and amount.
    
    Args:
        cause_id: The cause ID to process donations for
        amount: The amount available for disbursement
        transaction_hash: The hash of the transaction that triggered this disbursement
    """
    print(f"\nProcessing disbursement:")
    print(f"  Cause ID: {cause_id}")
    print(f"  Amount: {amount} USD")
    print(f"  Transaction Hash: {transaction_hash}")
    
    # First, print all donations in the database
    all_donations = get_all_donations()
    print("\nAll donations in database:")
    for donation in all_donations:
        print(f"  - ID: {donation.donation_id}")
        print(f"    Customer: {donation.customer_id}")
        print(f"    Cause: {donation.cause_id}")
        print(f"    Status: {donation.status}")
        print(f"    Amount: {donation.amount} {donation.currency}")
    
    # Get pending donations for the cause
    donations = get_pending_donations(cause_id)
    if not donations:
        logger.warning(f"No pending donations found for cause {cause_id}")
        return
        
    print("\nPending donations:")
    for donation in donations:
        print(f"  - ID: {donation.donation_id}")
        print(f"    Customer: {donation.customer_id}")
        print(f"    Amount: {donation.amount} {donation.currency}")
        print(f"    Status: {donation.status}")
    
    # Calculate disbursement
    donor_info = calculate_disbursement(donations, amount)
    
    print("\nDisbursement results:")
    for donor_id, info in donor_info.items():
        print(f"  - Donation ID: {info['donation_id']}")
        print(f"    Customer: {donor_id}")
        print(f"    Original Amount: {info['original_amount']} {donations[0].currency}")
        print(f"    Amount to Fulfill: {info['amount']} {donations[0].currency}")
        print(f"    Donation ID: {info['donation_id']}")
    
    # Print unique donors and their amounts
    unique_donors = set(donor_info.keys())
    total_amount = sum(info['amount'] for info in donor_info.values())
    print(f"\nUnique donors: {unique_donors}")
    print(f"Total amount disbursed: {total_amount} {donations[0].currency}")
    print("-" * 50)

    # Insert disbursement donations
    for donor_id, info in donor_info.items():
        insert_disbursement_donations(
            donation_id=info['donation_id'],
            disbursement_id=transaction_hash,
            amount=info['amount'],
            cause_id=cause_id,
            donor_id=donor_id
        )

if __name__ == "__main__":
    # Example usage with the correct cause_id and a dummy transaction hash
    test_disbursement_logic(
        cause_id="customer-2", 
        amount=550,
        transaction_hash="0xabc123323423def456"
    ) 