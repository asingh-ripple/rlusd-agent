from dataclasses import dataclass

@dataclass
class DisasterQuery:
    """
    Data class that represents a disaster analysis query.
    
    This class encapsulates all the information needed to analyze a disaster situation:
    - customer_id: Identifies the customer making the request
    - location: The geographic location of the disaster
    - query: The specific question about the disaster situation
    - query_date: The date of the query (optional)
    """
    customer_id: str
    beneficiary_id: str
    location: str
    query: str
    query_date: str | None = None
