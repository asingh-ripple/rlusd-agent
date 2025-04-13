import os
import sys

# Add the project root to the Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

import asyncio
from datetime import datetime, timedelta
from temporalio.client import Client
from temporalio.client import Schedule, ScheduleActionStartWorkflow, ScheduleSpec, ScheduleIntervalSpec, ScheduleState
from workflow.disaster_analysis_workflow import DisasterMonitorWorkflow
from workflow.workflow_models import DisasterQuery
from config.logger_config import setup_logger

logger = setup_logger(__name__)

async def schedule_workflow(client: Client, customer_id: str, beneficiary_id: str, location: str, query: str):
    """
    Schedule a disaster monitoring workflow with predefined values.
    
    Args:
        client: Temporal client
        customer_id: Customer ID
        beneficiary_id: Beneficiary ID
        location: Location to monitor
        query: The specific query to monitor
    """
    try:
        # Create DisasterQuery object
        query = DisasterQuery(
            customer_id=customer_id,
            beneficiary_id=beneficiary_id,
            location=location,
            query_date=datetime.utcnow().isoformat(),
            query=query
        )

        # Create the schedule
        await client.create_schedule(
            f"scheduled-disaster-monitor-{customer_id}-{location}",
            Schedule(
                action=ScheduleActionStartWorkflow(
                    DisasterMonitorWorkflow.run,
                    query,
                    id=f"{customer_id}-{location}-disaster-analysis-scheduled",
                    task_queue="disaster-monitor-queue",
                ),
                spec=ScheduleSpec(
                    intervals=[ScheduleIntervalSpec(every=timedelta(hours=24))]
                ),
                state=ScheduleState(
                    note=f"Monitoring disaster activity in {location} for customer {customer_id}"
                ),
            ),
        )
        
        logger.info(f"Scheduled workflow for customer {customer_id} and beneficiary {beneficiary_id}")
        
    except Exception as e:
        logger.error(f"Failed to schedule workflow: {e}")
        raise

async def main():
    # Connect to Temporal server
    client = await Client.connect("localhost:7233")
    
    # Example predefined values
    predefined_monitors = [
        {
            "customer_id": "sender-1",
            "beneficiary_id": "receiver-2",
            "location": "Myanmar",
            "query": "Does this area require crisis donation to resolve an urgent humanitarian crisis for an earthquake?"
        },
        {
            "customer_id": "sender-1",
            "beneficiary_id": "receiver-3",
            "location": "Sudan",
            "query": "Does this area require crisis donation to resolve an urgent humanitarian crisis for on ongoing war?"
        }
    ]
    
    # Schedule workflows for each predefined monitor
    for monitor in predefined_monitors:
        await schedule_workflow(
            client,
            monitor["customer_id"],
            monitor["beneficiary_id"],
            monitor["location"],
            monitor["query"]
        )

if __name__ == "__main__":
    asyncio.run(main()) 