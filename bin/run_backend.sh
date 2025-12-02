#!/bin/bash
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "Starting Backend from $PROJECT_ROOT..."
cd "$PROJECT_ROOT"
mvn spring-boot:run