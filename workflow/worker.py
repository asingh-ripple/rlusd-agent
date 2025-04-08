import asyncio
import os
import sys

# Add the project root to the Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from temporalio.client import Client
from temporalio.worker import Worker
from workflow.disaster_analysis_workflow import DisasterMonitorWorkflow, blockchain_activity, analyze_disaster_activity
from config.logger_config import setup_logger

# Use the centralized logger
logger = setup_logger(__name__)

async def main():
    # Connect to Temporal server
    client = await Client.connect("localhost:7233")
    
    # Create a worker
    worker = Worker(
        client,
        task_queue="disaster-monitor-queue",
        workflows=[DisasterMonitorWorkflow],
        activities=[analyze_disaster_activity, blockchain_activity],
    )
    
    # Start the worker
    logger.info("Worker started, ctrl+c to exit")
    try:
        await worker.run()
    except Exception as e:
        logger.error(f"Worker failed to start: {e}")

if __name__ == "__main__":
    asyncio.run(main()) 