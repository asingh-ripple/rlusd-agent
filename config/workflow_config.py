"""
Configuration settings for Temporal workflows and activities.
"""

from datetime import timedelta
from temporalio.common import RetryPolicy

# Retry policy for activities
ACTIVITY_RETRY_POLICY = RetryPolicy(
    initial_interval=timedelta(seconds=1),
    maximum_interval=timedelta(seconds=10),
    maximum_attempts=3,
    non_retryable_error_types=["ValueError"]  # Don't retry on validation errors
)

# Timeout settings
ACTIVITY_TIMEOUTS = {
    "disaster_analysis": timedelta(minutes=5),
    "blockchain": timedelta(seconds=300)
}

# Workflow settings
WORKFLOW_SETTINGS = {
    "task_queue": "disaster-monitor-queue",
    "namespace": "default"
} 