#!/bin/bash

# Build the project
echo "Building the project..."
npm run build

# Run the tests
echo -e "\nRunning tests..."
npm test

echo -e "\nTests completed!" 