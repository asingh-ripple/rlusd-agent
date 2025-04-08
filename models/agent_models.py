from pydantic import BaseModel, Field
from langgraph.graph import MessagesState
from datetime import datetime


class DisasterResponse(BaseModel):
    """Structured response for disaster monitoring.
    This model defines the format of the final disaster assessment output."""
    reasoning: str = Field(description="Detailed reasoning about the situation")
    disaster_type: str = Field(description="Type of disaster (e.g., typhoon, flood, earthquake)")
    severity: str = Field(description="Severity level (low, medium, high, critical)")
    location: str = Field(description="Affected area")
    status: str = Field(description="Current status (impending, ongoing, aftermath)")
    is_aid_required: bool = Field(description="Whether immediate aid is required")
    estimated_affected: int = Field(description="Estimated number of affected people")
    required_aid_amount: float = Field(description="Estimated amount of aid required")
    aid_currency: str = Field(description="Currency for the aid amount")
    evacuation_needed: bool = Field(description="Whether evacuation is recommended")
    disaster_date: str = Field(description="When the disaster occurred (in this format: 'March 15, 2024')")
    timestamp: datetime = Field(description="When this assessment was made")
    confidence_score: str = Field(description="Percentage of how confident the model is in its decision (0-100, 2 decimal precision)")
    is_valid: str = Field(default="false", description="Whether the final response is valid ('true' or 'false')")
    validation_reasoning: str = Field(description="Detailed explanation of why the response is considered valid or invalid")

    def __str__(self) -> str:
        return (
            f"Reasoning: {self.reasoning}\n"
            f"Disaster Type: {self.disaster_type}\n"
            f"Severity: {self.severity}\n"
            f"Location: {self.location}\n"
            f"Status: {self.status}\n"
            f"Aid Required: {self.is_aid_required}\n"
            f"Estimated Affected: {self.estimated_affected:,}\n"
            f"Required Aid Amount: {self.required_aid_amount:,.2f} {self.aid_currency}\n"
            f"Evacuation Needed: {self.evacuation_needed}\n"
            f"Disaster Date: {self.disaster_date}\n"
            f"Timestamp: {self.timestamp}\n"
            f"Confidence Score: {self.confidence_score}%\n"
            f"Valid: {self.is_valid}\n"
            f"Validation Reasoning: {self.validation_reasoning}"
        )
    
class DisasterQuery(BaseModel):
    """Query for disaster monitoring."""
    customer_id: str = Field(description="Customer ID")
    location: str = Field(description="Location")
    query: str = Field(description="Query")
    query_date: str | None = Field(default=None, description="When the query was made (in this format: 'yyyy-mm-dd')")

class AgentState(MessagesState):
    """State management for the disaster monitoring agent."""
    query: DisasterQuery
    final_response: DisasterResponse