#!/bin/bash
set -e

echo "========================================================"
echo "Building SensorPulse Project for Production Deployment"
echo "========================================================"

echo "1. Building React Frontend..."
cd "$(dirname "$0")/frontend"
npm install
npm run build

echo "2. Copying built assets to backend static folder..."
mkdir -p ../backend/src/main/resources/static
cp -r dist/* ../backend/src/main/resources/static/

echo "3. Full-stack bundle build completed successfully!"
