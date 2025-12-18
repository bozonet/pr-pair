#!/usr/bin/env node

import { program } from 'commander';
import { run, createSampleConfig } from '../dist/index.js';

// Set up the CLI
program
  .name('pr-pair')
  .description('Generate a checklist for pull requests based on changed files')
  .version('0.1.0');

// Command to generate a checklist
program
  .command('generate')
  .description('Generate a checklist based on changed files')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-b, --base <ref>', 'Base git reference (default: HEAD~1)')
  .option('-h, --head <ref>', 'Head git reference (default: HEAD)')
  .option('-o, --output <path>', 'Output file path (default: stdout)')
  .option('-p, --pr', 'Add checklist to PR')
  .action(async (options) => {
    try {
      const checklist = await run({
        configPath: options.config,
        baseRef: options.base,
        headRef: options.head,
        addToPR: options.pr
      });
      
      if (options.output) {
        const fs = await import('fs');
        fs.writeFileSync(options.output, checklist);
        console.log(`Checklist written to ${options.output}`);
      } else {
        console.log(checklist);
      }
    } catch (error) {
      console.error('Error generating checklist:', error);
      process.exit(1);
    }
  });

// Command to create a sample configuration
program
  .command('init')
  .description('Create a sample configuration file')
  .option('-o, --output <path>', 'Output file path (default: pr-pair.config.js)')
  .action((options) => {
    try {
      const outputPath = options.output || 'pr-pair.config.js';
      createSampleConfig(outputPath);
    } catch (error) {
      console.error('Error creating sample configuration:', error);
      process.exit(1);
    }
  });

// Command to add a checklist to a PR
program
  .command('add-to-pr')
  .description('Add a checklist to a PR')
  .requiredOption('-n, --number <number>', 'PR number')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-b, --base <ref>', 'Base git reference (default: HEAD~1)')
  .option('-h, --head <ref>', 'Head git reference (default: HEAD)')
  .action(async (options) => {
    try {
      // Set PR number in environment
      process.env.PR_NUMBER = options.number;
      
      await run({
        configPath: options.config,
        baseRef: options.base,
        headRef: options.head,
        addToPR: true
      });
    } catch (error) {
      console.error('Error adding checklist to PR:', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv); 