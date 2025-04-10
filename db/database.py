"""
Database module for managing application data.
"""

from typing import Optional, List
from enum import Enum
from sqlalchemy import create_engine, Column, String, ForeignKey, Enum as SQLEnum, Numeric, event, DateTime, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.engine import Engine
from config.logger_config import setup_logger
from datetime import datetime

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
    wallet_seed = Column(String(128))
    wallet_address = Column(String(128), nullable=True)  # Renamed from public_key
    email_address = Column(String(255), nullable=True)  # Added email_address
    customer_type = Column(SQLEnum(CustomerType))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sent_transactions = relationship("CustomerRelationship", 
                                   foreign_keys="CustomerRelationship.sender_id",
                                   back_populates="sender",
                                   cascade="all, delete-orphan")
    received_transactions = relationship("CustomerRelationship",
                                       foreign_keys="CustomerRelationship.receiver_id",
                                       back_populates="receiver",
                                       cascade="all, delete-orphan")
    transactions_sent = relationship("Transaction", 
                                   foreign_keys="Transaction.sender_id",
                                   back_populates="sender",
                                   cascade="all, delete-orphan")
    transactions_received = relationship("Transaction",
                                       foreign_keys="Transaction.receiver_id",
                                       back_populates="receiver",
                                       cascade="all, delete-orphan")
    checks_sent = relationship("Check",
                             foreign_keys="Check.sender_id",
                             back_populates="sender",
                             cascade="all, delete-orphan")
    checks_received = relationship("Check",
                                 foreign_keys="Check.receiver_id",
                                 back_populates="receiver",
                                 cascade="all, delete-orphan")

class CustomerRelationship(Base):
    """Model for tracking relationships between customers."""
    __tablename__ = "customer_relationships"

    sender_id = Column(String, ForeignKey("customers.customer_id", ondelete="CASCADE"), primary_key=True)
    receiver_id = Column(String, ForeignKey("customers.customer_id", ondelete="CASCADE"), primary_key=True)
    
    # Relationships
    sender = relationship("Customer", foreign_keys=[sender_id], back_populates="sent_transactions")
    receiver = relationship("Customer", foreign_keys=[receiver_id], back_populates="received_transactions")

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
    sender = relationship("Customer", foreign_keys=[sender_id], back_populates="transactions_sent")
    receiver = relationship("Customer", foreign_keys=[receiver_id], back_populates="transactions_received")

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
    sender = relationship("Customer", foreign_keys=[sender_id], back_populates="checks_sent")
    receiver = relationship("Customer", foreign_keys=[receiver_id], back_populates="checks_received")

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
        
    def add_customer(self, customer_id: str, wallet_seed: str, customer_type: CustomerType) -> None:
        """
        Add a new customer to the database.
        
        Args:
            customer_id: Unique identifier for the customer
            wallet_seed: XRPL wallet seed
            customer_type: Type of customer (sender or receiver)
        """
        session = self.Session()
        try:
            customer = Customer(
                customer_id=customer_id,
                wallet_seed=wallet_seed,
                customer_type=customer_type
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
            return session.query(Customer).all()
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