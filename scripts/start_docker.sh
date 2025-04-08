#!/bin/bash

# Stop any existing containers
docker compose down

# Start the new containers
cd docker-compose
docker compose up