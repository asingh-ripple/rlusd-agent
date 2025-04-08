#!/bin/bash
# Script to start the FastAPI server

# Exit on error
set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Get the project root directory (parent of scripts)
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Change to the project root directory
cd "$PROJECT_ROOT"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Please run scripts/install_dependencies.sh first."
    exit 1
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Add project root to PYTHONPATH
export PYTHONPATH=$PROJECT_ROOT:$PYTHONPATH

# Start the API server
echo "Starting API server..."
python service/api_server.py

# Deactivate virtual environment when done
deactivate