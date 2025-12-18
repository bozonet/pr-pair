#!/bin/bash

# Change to the project root directory
cd "$(dirname "$0")/.."

# Build the project
echo "Building the project..."
npm run build

# Run the example
echo -e "\nRunning the example..."
node --experimental-modules examples/usage-example.js

echo -e "\nExample completed!" 