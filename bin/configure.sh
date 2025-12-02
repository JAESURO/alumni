#!/bin/bash
set -e

# Get project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Configuring project from $PROJECT_ROOT..."

# Backend
echo "Building Backend..."
cd "$PROJECT_ROOT"
mvn clean install -DskipTests

# Frontend
echo "Installing Frontend dependencies..."
cd "$PROJECT_ROOT/frontend"
npm install

# ETL
echo "Installing Python dependencies..."
cd "$PROJECT_ROOT"
pip install earthengine-api requests

echo "Configuration complete!"