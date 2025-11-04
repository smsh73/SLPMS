#!/bin/bash

echo "Building frontend for production..."

cd frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi

# Build frontend
echo "Building frontend..."
npm run build

echo "Frontend build complete!"
echo "Build files are in frontend/dist/"

