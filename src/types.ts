/**
 * Pattern definition for checklist items
 */
export interface PatternDefinition {
  /** Regular expression pattern to match */
  pattern: RegExp;
  /** Checklist item text to include when pattern matches */
  item: string;
}

/**
 * Configuration options for the PR checklist generator
 */
export interface ChecklistConfig {
  /** Standard checklist items that are always included */
  standardItems: string[];
  
  /** Patterns to match in file names */
  filePatterns: PatternDefinition[];
  
  /** Patterns to match in file content */
  contentPatterns: PatternDefinition[];
  
  /** Patterns for files to exclude from analysis */
  excludePatterns: RegExp[];
  
  /** Whether to filter out comments before analyzing file content */
  filterComments: boolean;
  
  /** Whether to include debug information in the output */
  debug: boolean;
}

/**
 * GitHub-specific configuration
 */
export interface GitHubConfig {
  /** GitHub token for API access */
  token?: string;
  
  /** GitHub repository owner */
  owner?: string;
  
  /** GitHub repository name */
  repo?: string;
  
  /** PR number to update */
  prNumber?: number;
  
  /** Whether to add the checklist as a comment (true) or update the PR description (false) */
  addAsComment: boolean;
}

/**
 * Complete configuration for the PR checklist generator
 */
export interface Config {
  /** Checklist generation configuration */
  checklist: ChecklistConfig;
  
  /** GitHub configuration */
  github: GitHubConfig;
} 