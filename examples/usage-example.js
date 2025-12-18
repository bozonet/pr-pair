// Example of using PR Pair PR Checklist Generator programmatically

import { run } from '../dist/index.js';

async function generateAndAddChecklist() {
  try {
    // Generate a checklist based on changes between HEAD~5 and HEAD
    const checklist = await run({
      configPath: './examples/pr-pair.config.js',
      baseRef: 'HEAD~5',
      headRef: 'HEAD',
      addToPR: false // Set to true to add to PR automatically
    });
    
    console.log('Generated checklist:');
    console.log(checklist);
    
    // You can also add the checklist to a PR manually
    // First set environment variables:
    // process.env.GITHUB_TOKEN = 'your-github-token';
    // process.env.PR_NUMBER = '123';
    // process.env.GITHUB_REPOSITORY = 'owner/repo';
    
    // Then run with addToPR set to true:
    // await run({
    //   configPath: './examples/pr-pair.config.js',
    //   baseRef: 'HEAD~5',
    //   headRef: 'HEAD',
    //   addToPR: true
    // });
  } catch (error) {
    console.error('Error generating checklist:', error);
  }
}

// Run the example
generateAndAddChecklist(); 