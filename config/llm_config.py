"""Configuration for LLM models."""

from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
# Anthropic configuration
ANTHROPIC_CONFIG = {
    "model": "claude-3-5-sonnet-20240620",
    "temperature": 0.0,  # For deterministic responses
    "max_tokens": 4096,  # Maximum context window
}

OPENAI_CONFIG = {
    "model": "gpt-4o",
    "temperature": 0.0,  # For deterministic responses
    "max_tokens": 4096,  # Maximum context window
}

def get_configured_llm():
    """Get a configured LLM model instance.
    
    Returns:
        ChatAnthropic: A configured instance of the LLM model
    """
    return ChatAnthropic(**ANTHROPIC_CONFIG) 