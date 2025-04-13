#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Setting up Database Environment ===${NC}"

# Create data directory if it doesn't exist
if [ ! -d "data" ]; then
    echo -e "${GREEN}Creating data directory...${NC}"
    mkdir -p data
fi

# Initialize the database
echo -e "${GREEN}Initializing database...${NC}"
python3 -c "from db import init_db; from db.sqlite_config import get_connection_string; init_db(get_connection_string())"

# Check if initialization was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}Database initialization failed. Please check the error messages above.${NC}"
    exit 1
fi

# Run the seed script
echo -e "${GREEN}Running database seed script...${NC}"
python3 -m db.seed_db

# Check if the script ran successfully
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database setup completed successfully!${NC}"
    echo -e "${GREEN}Database file is located at: data/disaster_monitor.db${NC}"
else
    echo -e "${RED}Database setup failed. Please check the error messages above.${NC}"
    exit 1
fi

echo -e "${GREEN}=== Setup Complete ===${NC}"
python3 -m blockchain.setup_rlusd_trustline