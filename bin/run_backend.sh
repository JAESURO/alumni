#!/bin/bash
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "Starting Backend from $PROJECT_ROOT..."
cd "$PROJECT_ROOT"

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

mvn spring-boot:run