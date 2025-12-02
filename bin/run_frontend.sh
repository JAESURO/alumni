#!/bin/bash
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "Starting Frontend from $PROJECT_ROOT/frontend..."
cd "$PROJECT_ROOT/frontend"
npm run dev