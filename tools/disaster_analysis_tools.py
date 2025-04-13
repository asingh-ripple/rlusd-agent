"""Tools for disaster monitoring and analysis."""

from typing import Dict, Any, List
from langchain_core.tools import tool
from datetime import datetime, UTC
from config.tools_config import AID_ESTIMATION_CONFIG
from config.llm_config import get_configured_llm
from config.logger_config import setup_logger
from langchain_community.tools import DuckDuckGoSearchResults
from db.database import get_db, init_db
from db.sqlite_config import get_connection_string
from models.agent_models import DisasterQuery
# Configure logging
logger = setup_logger(__name__)
init_db(get_connection_string())
db = get_db()
# Initialize LLM, this could separate from the orchestrator LLM
model = get_configured_llm()


@tool
def get_news(search_query: str, query: DisasterQuery) -> Dict[str, Any]:
    """Search for latest news using Google News.
    
    Args:
        search_query (str): The specific area to search for (default: "")
    
    Returns:
        Dict[str, Any]: Dictionary containing:
            - status: 'success' or 'error'
            - count: Number of results
            - results: List of formatted news articles
            - query: The search query used
            - timestamp: When the search was performed
    """
    logger.info(f"TOOL CALLING: get_news(search_query: {search_query})")
    logger.info(f"CUSTOMER ID: {query.customer_id}")
    logger.info(f"BENEFICIARY ID: {query.beneficiary_id}")
    try:
        search = DuckDuckGoSearchResults(backend="news", output_format="list")
        result = search.invoke(search_query)
        logger.info(f"SEARCH RESULT: {result}")

        # Extract first link if results exist
        if result and len(result) > 0:
            first_link = result[0].get("link", "")
            logger.info(f"Extracted first link: [[[{first_link}]]]")

        else:
            logger.warning("No search links found")
        
        # Insert the news link into the database
        if first_link:
            logger.info(f"Inserting news link into the database: {first_link} for customer {query.customer_id} and beneficiary {query.beneficiary_id}")
            db.upsert_news_link(query.customer_id, query.beneficiary_id, first_link)

        return {
            "status": "success",
            "count": len(result),
            "result": result,
            "query": search_query,
            "timestamp": datetime.now(UTC).isoformat()
        }
    
        
            
    except Exception as e:
        logger.error(f"ERROR: Search failed: {str(e)}")
        return {
            'status': 'error',
            'error': str(e),
            'query': search_query,
            'timestamp': datetime.now(UTC).isoformat()
        }
        

@tool
def estimate_aid_requirements(disaster_info: str, affected_population: int) -> Dict[str, Any]:
    """Calculate required aid based on disaster information and affected population.
    
    Args:
        disaster_info (str): Detailed information about the disaster situation
        affected_population (int): Number of people affected by the disaster
    
    Returns:
        Dict[str, Any]: Dictionary containing:
            - amount: Estimated aid amount
            - currency: Currency code (e.g., USD, EUR, PHP)
    """
    if not disaster_info or not affected_population:
        raise ValueError("Both disaster_info and affected_population are required")
    
    logger.info(f"TOOL: estimate_aid_requirements(disaster_info: {disaster_info}, affected_population: {affected_population})")
    logger.info(f"REASON: Analyzing disaster info: {disaster_info[:1000]}...")
    
    # Calculate base amounts
    min_amount = affected_population * AID_ESTIMATION_CONFIG["min_amount_per_person"]
    max_amount = affected_population * AID_ESTIMATION_CONFIG["max_amount_per_person"]
    
    # Use conservative estimate as fallback
    fallback_amount = affected_population * AID_ESTIMATION_CONFIG["fallback_amount_per_person"]
    
    try:
        logger.info("PROCESSING: Analyzing situation using the LLM...")
        # Get LLM analysis
        response = model.invoke(f"""Analyze this disaster situation and estimate required aid:
        Disaster Info: {disaster_info}
        Affected Population: {affected_population}
        
        Return a JSON with 'amount' and 'currency' fields.""")
        
        logger.info(f"MODEL_RESPONSE: {response.content[:200]}...")
        
        # Parse response and apply bounds
        amount = float(response.content.split('"amount":')[1].split(',')[0].strip())
        currency = response.content.split('"currency":')[1].split('"')[1].strip()
        
        logger.info(f"PARSED: Amount={amount}, Currency={currency}")
        
        # Apply bounds
        if amount < min_amount:
            logger.info(f"ADJUSTMENT: Amount below minimum, adjusting from {amount} to {min_amount}")
            amount = min_amount
        elif amount > max_amount:
            logger.info(f"ADJUSTMENT: Amount above maximum, adjusting from {amount} to {max_amount}")
            amount = max_amount
        
        return {
            "amount": amount,
            "currency": currency or AID_ESTIMATION_CONFIG["default_currency"]
        }
        
    except Exception as e:
        logger.error(f"ERROR: Model analysis failed: {e}")
        logger.info("FALLBACK: Using conservative estimate")
        return {
            "amount": fallback_amount,
            "currency": AID_ESTIMATION_CONFIG["default_currency"]
        }

# List of available tools
all_disaster_analyzers: List[Any] = [
    get_news,
    estimate_aid_requirements
] 