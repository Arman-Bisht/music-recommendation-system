#!/bin/bash

# Music Recommender Deployment Script
# This script automates the deployment process for the Music Recommender application

set -e  # Exit immediately if a command exits with a non-zero status

# Configuration
ENVIRONMENT=${1:-"development"}  # Default to development if not specified
DOCKER_REGISTRY=${DOCKER_REGISTRY:-""}  # Use environment variable or default to empty string
IMAGE_TAG=${IMAGE_TAG:-"latest"}  # Use environment variable or default to latest

# Print deployment information
echo "Deploying Music Recommender to $ENVIRONMENT environment"
echo "Using Docker registry: $DOCKER_REGISTRY"
echo "Using image tag: $IMAGE_TAG"

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose is not installed"
    exit 1
 fi

# Check if docker is running
if ! docker info &> /dev/null; then
    echo "Error: Docker is not running"
    exit 1
fi

# Pull latest images
echo "Pulling latest Docker images..."
docker-compose pull

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down

# Start containers
echo "Starting containers..."
docker-compose up -d

# Check if containers are running
echo "Checking container status..."
docker-compose ps

# Display logs
echo "Displaying container logs..."
docker-compose logs -f --tail=20

echo "Deployment completed successfully!"