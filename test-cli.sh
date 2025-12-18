#!/bin/bash

# Build the project
echo "Building the project..."
npm run build

# Test the help command
echo -e "\nTesting help command..."
node bin/pr-pair.js --help

# Test the init command
echo -e "\nTesting init command..."
node bin/pr-pair.js init -o test-config.js

# Test the generate command
echo -e "\nTesting generate command..."
node bin/pr-pair.js generate -c test-config.js -b HEAD~5 -h HEAD

# Clean up
echo -e "\nCleaning up..."
rm test-config.js

echo -e "\nAll tests completed!" 