#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Configuring project from $PROJECT_ROOT..."

echo "Building Backend..."
cd "$PROJECT_ROOT"
mvn clean install -DskipTests

echo "Installing Frontend dependencies..."
cd "$PROJECT_ROOT/frontend"
npm install

echo "Installing Python dependencies..."
cd "$PROJECT_ROOT"
pip install earthengine-api requests

echo "Configuration complete!"