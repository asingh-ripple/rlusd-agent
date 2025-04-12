"""
Database module for managing application data.
"""

from typing import Optional, List, Dict
from enum import Enum
from sqlalchemy import create_engine, Column, String, ForeignKey, Enum as SQLEnum, Numeric, event, DateTime, Integer, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.engine import Engine
from config.logger_config import setup_logger
from datetime import datetime
import uuid
from decimal import Decimal

logger = setup_logger(__name__)

# Create base class for declarative models
Base = declarative_base()

# Enable foreign key support for SQLite
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

class CustomerType(str, Enum):
    """Enum for customer types."""
    SENDER = "sender"
    RECEIVER = "receiver"

class TransactionType(str, Enum):
    """Enum for transaction types."""
    PAYMENT = "PAYMENT"

class CheckType(str, Enum):
    """Enum for check types."""
    CHECK_CREATE = "CHECK_CREATE"
    CHECK_CASH = "CHECK_CASH"

class TransactionStatus(str, Enum):
    """Enum for transaction status."""
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"

class Customer(Base):
    """Customer model for storing customer information."""
    __tablename__ = "customers"

    customer_id = Column(String(50), primary_key=True, index=True)
    customer_name = Column(String(255), nullable=True)  # Added customer_name column
    wallet_seed = Column(String(128))
    wallet_address = Column(String(128), nullable=True)  # Renamed from public_key
    email_address = Column(String(255), nullable=True)  # Added email_address
    customer_type = Column(SQLEnum(CustomerType))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    # sent_transactions = relationship("CustomerRelationship", 
    #                                foreign_keys="CustomerRelationship.sender_id",
    #                                back_populates="sender",
    #                                cascade="all, delete-orphan")
    # received_transactions = relationship("CustomerRelationship",
    #                                    foreign_keys="CustomerRelationship.receiver_id",
    #                                    back_populates="receiver",
    #                                    cascade="all, delete-orphan")
    # transactions_sent = relationship("Transaction", 
    #                                foreign_keys="Transaction.sender_id",
    #                                back_populates="sender",
    #                                cascade="all, delete-orphan")
    # transactions_received = relationship("Transaction",
    #                                    foreign_keys="Transaction.receiver_id",
    #                                    back_populates="receiver",
    #                                    cascade="all, delete-orphan")
    # checks_sent = relationship("Check",
    #                          foreign_keys="Check.sender_id",
    #                          back_populates="sender",
    #                          cascade="all, delete-orphan")
    # checks_received = relationship("Check",
    #                              foreign_keys="Check.receiver_id",
    #                              back_populates="receiver",
    #                              cascade="all, delete-orphan")

class DonationStatus(str, Enum):
    """Enum for donation status."""
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Donations(Base):
    """Model for tracking donations."""
    __tablename__ = "donations"

    donation_id = Column(String(50), primary_key=True)
    customer_id = Column(String(50), nullable=False)
    cause_id = Column(String(50), nullable=False)
    amount = Column(Numeric(20, 6), nullable=False)  # 20 digits total, 6 decimal places
    currency = Column(String, nullable=False)
    donation_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    status = Column(SQLEnum(DonationStatus), nullable=False)

class DisbursementStatus(str, Enum):
    """Enum for disbursement status."""
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class DisbursementsDonations(Base):
    """Model for tracking disbursements and donations."""
    __tablename__ = "disbursements_donations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    donation_id = Column(String, nullable=False)
    disbursement_id = Column(String, nullable=False)  # This will be the transaction hash
    cause_id = Column(String, nullable=False)
    donor_id = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    # Relationships
    # disbursement = relationship("Disbursement", foreign_keys=[disbursement_id], back_populates="donations")
    # donation = relationship("Donation", foreign_keys=[donation_id], back_populates="disbursements")

class CustomerRelationship(Base):
    """Model for tracking relationships between customers."""
    __tablename__ = "customer_relationships"

    sender_id = Column(String, ForeignKey("customers.customer_id", ondelete="CASCADE"), primary_key=True)
    receiver_id = Column(String, ForeignKey("customers.customer_id", ondelete="CASCADE"), primary_key=True)
    
    # Relationships
    # sender = relationship("Customer", foreign_keys=[sender_id], back_populates="sent_transactions")
    # receiver = relationship("Customer", foreign_keys=[receiver_id], back_populates="received_transactions")

class Transaction(Base):
    """Model for tracking transactions between customers."""
    __tablename__ = "transactions"

    transaction_hash = Column(String, primary_key=True)
    sender_id = Column(String, ForeignKey("customers.customer_id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(String, ForeignKey("customers.customer_id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(20, 6), nullable=False)  # 20 digits total, 6 decimal places
    currency = Column(String, nullable=False)
    transaction_type = Column(SQLEnum(TransactionType), nullable=False)
    status = Column(SQLEnum(TransactionStatus), nullable=False)
    insertion_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
#    sender = relationship("Customer", foreign_keys=[sender_id], back_populates="transactions_sent")
#    receiver = relationship("Customer", foreign_keys=[receiver_id], back_populates="transactions_received")

    def insert_transaction(self, 
                       transaction_hash: str,
                       sender_id: str,
                       receiver_id: str,
                       amount: float,
                       currency: str,
                       transaction_type: TransactionType,
                       status: TransactionStatus) -> None:
        """
        Add a new transaction to the database.
        
        Args:
            transaction_hash: Unique hash of the transaction
            sender_id: ID of the sender customer
            receiver_id: ID of the receiver customer
            amount: Transaction amount
            currency: Transaction currency
            transaction_type: Type of transaction (check or payment)
            status: Transaction status (successful or failed)
        """
        session = self.Session()
        try:
            transaction = Transaction(
                transaction_hash=transaction_hash,
                sender_id=sender_id,
                receiver_id=receiver_id,
                amount=amount,
                currency=currency,
                transaction_type=transaction_type,
                status=status
            )
            session.add(transaction)
            session.commit()
            logger.info(f"Added transaction {transaction_hash} to database")
        except Exception as e:
            session.rollback()
            logger.error(f"Error adding transaction: {str(e)}")
            raise
        finally:
            session.close()

class Check(Base):
    """Model for tracking checks between customers."""
    __tablename__ = "checks"

    check_id = Column(String, primary_key=True)
    transaction_hash = Column(String, nullable=False, unique=True)
    sender_id = Column(String, ForeignKey("customers.customer_id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(String, ForeignKey("customers.customer_id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(20, 6), nullable=False)  # 20 digits total, 6 decimal places
    currency = Column(String, nullable=False)
    expiration_date = Column(DateTime, nullable=False)
    insertion_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    check_type = Column(SQLEnum(CheckType), nullable=False, default=CheckType.CHECK_CREATE)
    
    # Relationships
#    sender = relationship("Customer", foreign_keys=[sender_id], back_populates="checks_sent")
#    receiver = relationship("Customer", foreign_keys=[receiver_id], back_populates="checks_received")

class Cause(Base):
    """Model for storing causes."""
    __tablename__ = "causes"

    cause_id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(String, nullable=False)
    imageUrl = Column(String, nullable=False)
    category = Column(String, nullable=False)
    goal = Column(Numeric(20, 6), nullable=False)  # 20 digits total, 6 decimal places
    balance = Column(Numeric(20, 6), nullable=False)  # 20 digits total, 6 decimal places
    
    # Relationships (without customer_id foreign key for now)
    ## customer = relationship("Customer", back_populates="details")
#    donations_list = relationship("Donations", back_populates="cause")
#    disbursements_list = relationship("Disbursements", back_populates="cause")

    def __repr__(self):
        return f"<Cause(cause_id={self.cause_id}, name={self.name}, description={self.description}, imageUrl={self.imageUrl}, category={self.category})>"

class DisasterResponse(Base):
    """Model for storing disaster analysis responses."""
    __tablename__ = "disaster_responses"
    
    response_id = Column(String(36), primary_key=True)
    customer_id = Column(String(36), nullable=False)
    beneficiary_id = Column(String(36), nullable=False)
    location = Column(String(255), nullable=False)
    disaster_type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False)
    is_aid_required = Column(Boolean, nullable=False)
    estimated_affected = Column(Integer, nullable=False)
    required_aid_amount = Column(Float, nullable=False)
    aid_currency = Column(String(10), nullable=False)
    evacuation_needed = Column(Boolean, nullable=False)
    disaster_date = Column(String(50), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    confidence_score = Column(String(10), nullable=False)
    is_valid = Column(Boolean, nullable=False)
    reasoning = Column(String(1000), nullable=False)
    validation_reasoning = Column(String(1000), nullable=False)
    summarized_news = Column(String(2000), nullable=True)  # News summary
    news_link = Column(String(2000), nullable=True)  # JSON string of news links
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<DisasterResponse(response_id={self.response_id}, location={self.location}, disaster_type={self.disaster_type})>"

class Database:
    """Database manager for wallet operations."""
    
    def __init__(self, connection_string: str):
        """
        Initialize the database connection.
        
        Args:
            connection_string: Database connection string
        """
        self.engine = create_engine(connection_string)
        self.Session = sessionmaker(bind=self.engine)
        
        # Create tables if they don't exist
        Base.metadata.create_all(self.engine)
        
    def add_customer(self, customer_id: str, wallet_seed: str, customer_type: CustomerType, wallet_address: str, email_address: str, customer_name: Optional[str] = None) -> None:
        """
        Add a new customer to the database.
        
        Args:
            customer_id: Unique identifier for the customer
            wallet_seed: XRPL wallet seed
            customer_type: Type of customer (sender or receiver)
            wallet_address: The customer's wallet address
            email_address: The customer's email address
            customer_name: The customer's name (optional)
        """
        session = self.Session()
        try:
            customer = Customer(
                customer_id=customer_id,
                wallet_seed=wallet_seed,
                customer_type=customer_type,
                wallet_address=wallet_address,
                email_address=email_address,
                customer_name=customer_name
            )
            session.add(customer)
            session.commit()
            logger.info(f"Added customer {customer_id} to database")
        except Exception as e:
            session.rollback()
            logger.error(f"Error adding customer: {str(e)}")
            raise
        finally:
            session.close()
            
    def get_customer(self, customer_id: str) -> Optional[Customer]:
        """
        Retrieve a customer by their customer_id.
        
        Args:
            customer_id: The ID of the customer to retrieve
            
        Returns:
            Customer object if found, None otherwise
            
        Raises:
            Exception: If there's an error accessing the database
        """
        try:
            with self.Session() as session:
                customer = session.query(Customer).filter(Customer.customer_id == customer_id).first()
                if customer:
                    logger.info(f"Retrieved customer {customer_id} with wallet_address {customer.wallet_address}")
                else:
                    logger.warning(f"Customer {customer_id} not found")
                return customer
        except Exception as e:
            logger.error(f"Error retrieving customer {customer_id}: {e}")
            raise
            
    def add_relationship(self, sender_id: str, receiver_id: str) -> None:
        """
        Add a relationship between customers.
        
        Args:
            sender_id: ID of the sender customer
            receiver_id: ID of the receiver customer
        """
        session = self.Session()
        try:
            relationship = CustomerRelationship(
                sender_id=sender_id,
                receiver_id=receiver_id
            )
            session.add(relationship)
            session.commit()
            logger.info(f"Added relationship between {sender_id} and {receiver_id}")
        except Exception as e:
            session.rollback()
            logger.error(f"Error adding relationship: {str(e)}")
            raise
        finally:
            session.close()
            
    def get_receivers(self, sender_id: str) -> List[Customer]:
        """
        Get all receivers for a sender.
        
        Args:
            sender_id: ID of the sender customer
            
        Returns:
            List of receiver customers
        """
        session = self.Session()
        try:
            return [rel.receiver for rel in session.query(CustomerRelationship)
                    .filter_by(sender_id=sender_id).all()]
        finally:
            session.close()
            
    def get_senders(self, receiver_id: str) -> List[Customer]:
        """
        Get all senders for a receiver.
        
        Args:
            receiver_id: ID of the receiver customer
            
        Returns:
            List of sender customers
        """
        session = self.Session()
        try:
            return [rel.sender for rel in session.query(CustomerRelationship)
                    .filter_by(receiver_id=receiver_id).all()]
        finally:
            session.close()

    def insert_transaction(self, 
                       transaction_hash: str,
                       sender_id: str,
                       receiver_id: str,
                       amount: float,
                       currency: str,
                       transaction_type: TransactionType,
                       status: TransactionStatus) -> None:
        """
        Add a new transaction to the database.
        
        Args:
            transaction_hash: Unique hash of the transaction
            sender_id: ID of the sender customer
            receiver_id: ID of the receiver customer
            amount: Transaction amount
            currency: Transaction currency
            transaction_type: Type of transaction (check or payment)
            status: Transaction status (successful or failed)
        """
        session = self.Session()
        try:
            transaction = Transaction(
                transaction_hash=transaction_hash,
                sender_id=sender_id,
                receiver_id=receiver_id,
                amount=amount,
                currency=currency,
                transaction_type=transaction_type,
                status=status
            )
            session.add(transaction)
            session.commit()
            logger.info(f"Added transaction {transaction_hash} to database")
        except Exception as e:
            session.rollback()
            logger.error(f"Error adding transaction: {str(e)}")
            raise
        finally:
            session.close()
    

    def get_customer_checks(self, customer_id: str) -> List[Check]:
        """
        Get all checks for a customer (both sent and received).
        
        Args:
            customer_id: ID of the customer
            
        Returns:
            List of checks
        """
        session = self.Session()
        try:
            sent = session.query(Check).filter_by(sender_id=customer_id).all()
            received = session.query(Check).filter_by(receiver_id=customer_id).all()
            return sent + received
        finally:
            session.close()

    def update_check_cash(self, check_id: str, new_transaction_hash: str) -> None:
        """
        Update the check type from CHECK_CREATE to CHECK_CASH and update the transaction hash.
        
        Args:
            check_id: ID of the check to update
            new_transaction_hash: Hash of the new transaction that cashed the check
        """
        session = self.Session()
        try:
            check = session.query(Check).filter_by(check_id=check_id).first()
            if check:
                check.check_type = CheckType.CHECK_CASH
                check.transaction_hash = new_transaction_hash
                session.commit()
                logger.info(f"Updated check {check_id} type to CHECK_CASH with new transaction hash {new_transaction_hash}")
            else:
                logger.warning(f"Check {check_id} not found")
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating check type and transaction hash: {str(e)}")
            raise
        finally:
            session.close()

    def insert_check(self, 
                    check_id: str,
                    transaction_hash: str,
                    sender_id: str,
                    receiver_id: str,
                    amount: float,
                    currency: str,
                    expiration_date: int,
                    check_type: CheckType = CheckType.CHECK_CREATE) -> None:
        """
        Insert a new check into the database.
        
        Args:
            check_id: Unique ID of the check
            transaction_hash: Hash of the XRPL transaction that created the check
            sender_id: ID of the sender customer
            receiver_id: ID of the receiver customer
            amount: Check amount
            currency: Check currency
            expiration_date: Unix timestamp when the check expires
            check_type: Type of check (CREATE or CASH), defaults to CHECK_CREATE
        """
        session = self.Session()
        try:
            # Convert Unix timestamp to datetime
            expiration_datetime = datetime.fromtimestamp(expiration_date)
            
            check = Check(
                check_id=check_id,
                transaction_hash=transaction_hash,
                sender_id=sender_id,
                receiver_id=receiver_id,
                amount=amount,
                currency=currency,
                expiration_date=expiration_datetime,
                check_type=check_type
            )
            session.add(check)
            session.commit()
            logger.info(f"Inserted check {check_id} with transaction hash {transaction_hash} and type {check_type} into database")
        except Exception as e:
            session.rollback()
            logger.error(f"Error inserting check: {str(e)}")
            raise
        finally:
            session.close()

    def get_check(self, check_id: str) -> Optional[Check]:
        """
        Retrieve a check by its ID.
        
        Args:
            check_id: ID of the check to look up
            
        Returns:
            Check object if found, None otherwise
        """
        session = self.Session()
        try:
            return session.query(Check).filter_by(check_id=check_id).first()
        finally:
            session.close()

    def get_all_customers(self) -> List[Customer]:
        """
        Get all customers.
        """
        try:
            session = self.Session()
            customers =  session.query(Customer).all()
            print(f"Customers: {customers}")
            return customers
        finally:
            session.close()
    
    def get_customer_transactions(self, customer_id: str) -> List[Transaction]:
        """
        Get all transactions for a customer (both sent and received).
        
        Args:
            customer_id: ID of the customer
            
        Returns:
            List of transactions
        """
        session = self.Session()
        try:
            sent = session.query(Transaction).filter_by(sender_id=customer_id).all()
            received = session.query(Transaction).filter_by(receiver_id=customer_id).all()
            return sent + received
        finally:
            session.close()
    
    def get_customer_seed(self, customer_id: str) -> str:
        """
        Get the seed for a customer.
        """
        customer = self.get_customer(customer_id)
        return customer.wallet_seed
    
    def insert_cause(self, cause_id: str, name: str, description: str, imageUrl: str, category: str, goal: float) -> None:
        """
        Add customer details to the database.
        
        Args:
            customer_id: ID of the customer
            name: Name of the customer/charity
            goal: Fundraising goal amount
            description: Description of the charity
        """
        session = self.Session()
        try:
            cause = Cause(
                cause_id=cause_id,
                name=name,
                description=description,
                imageUrl=imageUrl,
                category=category,
                goal=goal
            )
            session.add(cause)
            session.commit()
            logger.info(f"Added cause {cause_id}")
        except Exception as e:
            session.rollback()
            logger.error(f"Error adding customer details: {str(e)}")
            raise
        finally:
            session.close()
            
    def get_cause(self, cause_id: str) -> Optional[Cause]:
        """
        Get cause by ID.
        
        Args:
            cause_id: ID of the cause
            
        Returns:
            Cause object if found, None otherwise
        """
        session = self.Session()
        try:
            return session.query(Cause).filter_by(cause_id=cause_id).first()
        finally:
            session.close()
            
    def update_total_donations(self, customer_id: str) -> None:
        """
        Increment the total donations count for a customer.
        
        Args:
            customer_id: ID of the customer
        """
        session = self.Session()
        try:
            details = session.query(Cause).filter_by(customer_id=customer_id).first()
            if details:
                details.total_donations += 1
                session.commit()
                logger.info(f"Updated total donations for customer {customer_id}")
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating total donations: {str(e)}")
            raise
        finally:
            session.close()

    def get_customer_details_from_wallet(self, wallet_address: str) -> Optional[Customer]:
        """
        Get customer details from wallet address.
        
        Args:
            wallet_address (str): The wallet address to look up
            
        Returns:
            Optional[Customer]: The complete customer object if found, None otherwise
        """
        session = None
        try:
            session = self.Session()
            customer = session.query(Customer).filter(
                Customer.wallet_address == wallet_address
            ).first()
            
            if customer:
                logger.info(f"Found customer with wallet address {wallet_address}")
                return customer
            else:
                logger.warning(f"No customer found with wallet address {wallet_address}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting customer details: {str(e)}")
            raise
        finally:
            if session:
                session.close()

    def insert_donation(self, 
                    customer_id: str,
                    cause_id: str,
                    amount: float,
                    currency: str = "RLUSD") -> str:
        """
        Insert a new donation into the database.
        
        Args:
            customer_id: ID of the donating customer
            cause_id: ID of the cause being donated to
            amount: Donation amount
            currency: Currency (defaults to "RLUSD")
            
        Returns:
            str: The generated donation_id
            
        Raises:
            Exception: If there's an error inserting the donation
        """
        session = self.Session()
        try:
            # Generate a random donation ID
            donation_id = str(uuid.uuid4())
            
            # Create new donation record
            donation = Donations(
                donation_id=donation_id,
                customer_id=customer_id,
                cause_id=cause_id,
                amount=amount,
                currency=currency,
                donation_date=datetime.utcnow(),
                status=DonationStatus.PENDING
            )
            
            # Add to database
            session.add(donation)
            session.commit()
            
            logger.info(f"Successfully registered donation {donation_id} for customer {customer_id} to cause {cause_id}")
            return donation_id
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error inserting donation: {str(e)}")
            raise
        finally:
            session.close()

    def get_cause_from_address(self, wallet_address: str) -> Optional[Cause]:
        """
        Get cause object by joining customers and causes tables using wallet address.
        
        Args:
            wallet_address: The wallet address to look up
            
        Returns:
            Cause object if found, None otherwise
        """
        session = self.Session()
        try:
            # Join customers and causes tables
            result = session.query(Cause).join(
                Customer,
                Customer.customer_id == Cause.cause_id
            ).filter(
                Customer.wallet_address == wallet_address
            ).first()
            
            if result:
                logger.info(f"Found cause for wallet address {wallet_address}")
                return result
                
            logger.warning(f"No cause found for wallet address {wallet_address}")
            return None
            
        except Exception as e:
            logger.error(f"Error getting cause from wallet address: {str(e)}")
            return None
        finally:
            session.close()

    def update_cause_balance(self, cause_id: str, balance: float) -> None:
        """
        Update the balance for a cause.
        
        Args:
            cause_id: ID of the cause
            balance: New balance amount
        """
        session = self.Session()
        try:
            print(f"Updating balance for cause {cause_id} to {balance}")
            cause = session.query(Cause).filter_by(cause_id=cause_id).first()
            if cause:
                cause.balance = balance
                session.commit()
                logger.info(f"Updated balance for cause {cause_id} to {balance}")
            else:
                logger.warning(f"Cause {cause_id} not found")
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating cause balance: {str(e)}")
            raise
        finally:
            session.close()

    def upsert_cause_balance(self, cause_id: str, balance: float) -> None:
        """
        Upsert the balance for a cause.
        """
        session = self.Session()
        try:
            cause = session.query(Cause).filter_by(cause_id=cause_id).first()
            if cause:
                # Convert float to Decimal for consistent type handling
                balance_decimal = Decimal(str(balance))
                
                # Handle the case where cause balance is not set
                if cause.balance is None:
                    cause.balance = balance_decimal
                else:
                    cause.balance = cause.balance + balance_decimal
                session.commit()
                logger.info(f"Updated balance for cause {cause_id} to {balance_decimal}")
            else:
                logger.warning(f"Cause {cause_id} not found")
        except Exception as e:
            session.rollback()
            logger.error(f"Error upserting cause balance: {str(e)}")
            raise
        finally:
            session.close()


    def insert_disaster_response(
        self,
        customer_id: str,
        beneficiary_id: str,
        location: str,
        disaster_type: str,
        severity: str,
        status: str,
        is_aid_required: bool,
        estimated_affected: int,
        required_aid_amount: float,
        aid_currency: str,
        evacuation_needed: bool,
        disaster_date: str,
        timestamp: datetime,
        confidence_score: str,
        is_valid: bool,
        reasoning: str,
        validation_reasoning: str,
        summarized_news: Optional[str] = None,
        news_link: Optional[str] = None
    ) -> str:
        """
        Insert a new disaster response into the database.
        
        Args:
            customer_id: ID of the customer
            beneficiary_id: ID of the beneficiary
            location: Affected area
            disaster_type: Type of disaster
            severity: Severity level
            status: Current status
            is_aid_required: Whether aid is required
            estimated_affected: Number of affected people
            required_aid_amount: Amount of aid required
            aid_currency: Currency for aid amount
            evacuation_needed: Whether evacuation is needed
            disaster_date: When the disaster occurred
            timestamp: When the assessment was made
            confidence_score: Confidence in the assessment
            is_valid: Whether the response is valid
            reasoning: Detailed reasoning
            validation_reasoning: Validation explanation
            summarized_news: Summary of latest news about the disaster (optional)
            news_link: link to the news article
            
        Returns:
            str: The generated response_id
        """
        session = self.Session()
        try:
            # Generate a random response ID
            response_id = str(uuid.uuid4())
            
            # Create new response record
            response = DisasterResponse(
                response_id=response_id,
                customer_id=customer_id,
                beneficiary_id=beneficiary_id,
                location=location,
                disaster_type=disaster_type,
                severity=severity,
                status=status,
                is_aid_required=is_aid_required,
                estimated_affected=estimated_affected,
                required_aid_amount=required_aid_amount,
                aid_currency=aid_currency,
                evacuation_needed=evacuation_needed,
                disaster_date=disaster_date,
                timestamp=timestamp,
                confidence_score=confidence_score,
                is_valid=is_valid,
                reasoning=reasoning,
                validation_reasoning=validation_reasoning,
                summarized_news=summarized_news,
                news_link=news_link
            )
            session.add(response)
            logger.info(f"Created new disaster response {response_id}")
            
            session.commit()
            return response_id
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error inserting/updating disaster response: {str(e)}")
            raise
        finally:
            session.close()

# Module-level database instance
_db = None

def init_db(connection_string: str) -> None:
    """
    Initialize the module-level database instance.
    
    This should be called once at application startup.
    
    Args:
        connection_string: Database connection string
    """
    global _db
    if _db is None:
        _db = Database(connection_string)
        logger.info("Database initialized")
    else:
        logger.warning("Database already initialized")

def get_db() -> Database:
    """
    Get the module-level database instance.
    
    Returns:
        Database instance
        
    Raises:
        RuntimeError: If database hasn't been initialized
    """
    if _db is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return _db 