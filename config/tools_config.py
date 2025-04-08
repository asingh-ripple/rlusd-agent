"""Configuration for tools used in disaster analysis."""

# Search configuration
SEARCH_CONFIG = {
    "default_start_date_delta": 3,  # Default number of days to look back
    "max_pages": 5  # Maximum number of pages to retrieve
}

# Aid estimation configuration
AID_ESTIMATION_CONFIG = {
    "min_amount_per_person": 100,  # Minimum aid amount per person in USD
    "max_amount_per_person": 1000,  # Maximum aid amount per person in USD
    "fallback_amount_per_person": 500,  # Fallback amount if model fails
    "default_currency": "USD"  # Default currency for aid amounts
}