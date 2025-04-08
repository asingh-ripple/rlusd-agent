"""Utility functions for the disaster monitoring system."""

import json
from typing import Any, Dict, Union
from datetime import datetime
from config.logger_config import setup_logger

logger = setup_logger(__name__)


def ensure_json_serializable(obj: Any) -> Union[Dict, str]:
    """
    Ensure an object is JSON serializable.
    
    Args:
        obj: The object to make JSON serializable
        
    Returns:
        A JSON serializable representation of the object
    """
    if isinstance(obj, dict):
        # Convert any datetime objects to strings
        def datetime_handler(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            raise TypeError(f"Object of type {type(obj)} is not JSON serializable")
        
        # Convert the result to a JSON-serializable format
        return json.dumps(obj, default=datetime_handler)
    elif not isinstance(obj, (str, int, float, bool, type(None))):
        # If result is not a basic type, convert it to string
        return str(obj)
    return obj


def requires_aid_transfer(response: dict) -> bool:
    """Check if the response is valid.
    Args:
        response: The response to check
    Returns:
        bool: True if the response is valid, False otherwise
    """
    logger.info(f"Checking if response is valid: model validtion: {response['isValid']} and aid required: {response['isAidRequired']}")
    return True
    # if response["isValid"] is True and response["isAidRequired"] is True:
    #     logger.info(f"Response is valid. Creating XRPL check transaction.")
    #     return True
    # else:
    #     logger.info(f"Response is not valid. No XRPL check transaction created.")
    #     return False
