import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { Config } from './types.js';
import { defaultConfig } from './defaultConfig.js';

/**
 * Load configuration from a file
 * @param configPath Path to the configuration file
 * @returns Loaded configuration merged with defaults
 */
export async function loadConfig(configPath?: string): Promise<Config> {
  // Start with default config
  const config: Config = JSON.parse(JSON.stringify(defaultConfig));
  
  // If no config path provided, look for config file in current directory
  if (!configPath) {
    const possibleConfigPaths = [
      'pr-pair.config.js',
      'pr-pair.config.mjs',
      'pr-pair.config.json',
      '.pr-pairrc',
      '.pr-pairrc.json',
      '.pr-pairrc.js'
    ];
    
    for (const possiblePath of possibleConfigPaths) {
      if (fs.existsSync(possiblePath)) {
        configPath = possiblePath;
        break;
      }
    }
  }
  
  // If config file exists, load it
  if (configPath && fs.existsSync(configPath)) {
    try {
      let userConfig;
      
      if (configPath.endsWith('.json') || configPath.endsWith('.rc') || configPath.endsWith('.rc.json')) {
        // Load JSON config
        const configContent = fs.readFileSync(configPath, 'utf-8');
        userConfig = JSON.parse(configContent);
      } else {
        // Load JS/TS config
        const configModule = await import(path.resolve(configPath));
        userConfig = configModule.default || configModule;
      }
      
      // Merge user config with default config
      if (userConfig.checklist) {
        config.checklist = {
          ...config.checklist,
          ...userConfig.checklist
        };
      }
      
      if (userConfig.github) {
        config.github = {
          ...config.github,
          ...userConfig.github
        };
      }
    } catch (error) {
      console.error(`Error loading config from ${configPath}:`, error);
    }
  }
  
  // Load config from environment variables
  if (process.env.GITHUB_TOKEN) {
    config.github.token = process.env.GITHUB_TOKEN;
  }
  
  // Fallback to GitHub CLI token if GITHUB_TOKEN is not set
  if (!config.github.token) {
    try {
      const ghToken = execSync('gh auth token', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      if (ghToken) {
        config.github.token = ghToken;
        if (process.env.DEBUG || process.env.PR_CHECKLIST_DEBUG) {
          console.log('Using GitHub CLI token for authentication');
        }
      }
    } catch (error) {
      // GitHub CLI not available or not authenticated - silently continue
      // The error will be thrown later if token is required for PR operations
    }
  }
  
  if (process.env.GITHUB_REPOSITORY) {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    config.github.owner = owner;
    config.github.repo = repo;
  }
  
  if (process.env.PR_NUMBER) {
    config.github.prNumber = parseInt(process.env.PR_NUMBER, 10);
  }
  
  return config;
}

/**
 * Create a sample configuration file
 * @param outputPath Path to write the sample configuration
 */
export function createSampleConfig(outputPath: string): void {
  const configContent = `/**
 * PR Checklist Generator Configuration
 */
export default {
  checklist: {
    // Standard checklist items that are always included
    standardItems: [
      "- [ ] Code follows the project's coding style",
      "- [ ] Documentation has been updated (if applicable)",
      "- [ ] Tests have been added/updated (if applicable)",
      "- [ ] All tests pass",
      "- [ ] The code has been reviewed"
    ],
    
    // Patterns to match in file names
    filePatterns: [
      { 
        pattern: /prisma|schema\\.prisma/i, 
        item: "- [ ] Prisma schema changes have been validated and migrations created if needed" 
      },
      { 
        pattern: /\\.tsx?$|\\.jsx?$/i, 
        item: "- [ ] Component changes have been tested in different browsers/devices" 
      }
    ],
    
    // Patterns to match in file content
    contentPatterns: [
      {
        pattern: /useEffect|useState|useContext/i,
        item: "- [ ] React hooks usage has been reviewed for potential issues"
      },
      {
        pattern: /fetch\\(|axios\\./i,
        item: "- [ ] API calls include proper error handling"
      }
    ],
    
    // Patterns for files to exclude from analysis
    excludePatterns: [
      /^\\.github\\/workflows\\//,
      /^node_modules\\//,
      /^dist\\//
    ],
    
    // Whether to filter out comments before analyzing file content
    filterComments: true,
    
    // Whether to include debug information in the output
    debug: false
  },
  
  github: {
    // Whether to add the checklist as a comment (true) or update the PR description (false)
    addAsComment: true
  }
};
`;

  fs.writeFileSync(outputPath, configContent);
  console.log(`Sample configuration written to ${outputPath}`);
} 