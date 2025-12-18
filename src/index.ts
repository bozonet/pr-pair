import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Config, PatternDefinition } from './types.js';
import { loadConfig } from './config.js';

/**
 * Get changed files in the PR
 * @param baseRef Base git reference
 * @param headRef Head git reference
 * @returns Array of changed file paths
 */
export function getChangedFiles(baseRef: string, headRef: string): string[] {
  try {
    const diffOutput = execSync(`git diff --name-only ${baseRef} ${headRef}`).toString().trim();
    const changedFiles = diffOutput.split('\n').filter(file => file.trim() !== '');
    
    if (process.env.DEBUG || process.env.PR_CHECKLIST_DEBUG) {
      console.log("Changed files:", changedFiles);
    }
    
    return changedFiles;
  } catch (error) {
    console.error("Error getting changed files:", error);
    return [];
  }
}

/**
 * Filter out files that match exclude patterns
 * @param files Array of file paths
 * @param excludePatterns Array of patterns to exclude
 * @returns Filtered array of file paths
 */
export function filterFiles(files: string[], excludePatterns: RegExp[]): string[] {
  return files.filter(file => {
    for (const pattern of excludePatterns) {
      if (pattern.test(file)) {
        if (process.env.DEBUG || process.env.PR_CHECKLIST_DEBUG) {
          console.log(`Excluding file: ${file}`);
        }
        return false;
      }
    }
    return true;
  });
}

/**
 * Get the diff content for a file
 * @param file File path
 * @param baseRef Base git reference
 * @param headRef Head git reference
 * @returns Diff content as string
 */
export function getFileDiff(file: string, baseRef: string, headRef: string): string {
  try {
    if (!fs.existsSync(file)) {
      return '';
    }
    
    const diffContent = execSync(`git diff ${baseRef} ${headRef} -- "${file}"`).toString();
    return diffContent;
  } catch (error) {
    console.error(`Error getting diff for ${file}:`, error);
    return '';
  }
}

/**
 * Remove comments from code content
 * @param content Code content
 * @returns Code content without comments
 */
export function removeComments(content: string): string {
  const lines = content.split('\n');
  const codeLines = lines.filter(line => {
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      return false;
    }
    return true;
  });
  return codeLines.join('\n');
}

/**
 * Analyze files and generate checklist items
 * @param files Array of file paths
 * @param config Configuration
 * @param baseRef Base git reference
 * @param headRef Head git reference
 * @returns Array of checklist items
 */
export function analyzeFiles(
  files: string[], 
  config: Config, 
  baseRef: string, 
  headRef: string
): string[] {
  const checklistItems: string[] = [];
  const matchedPatterns: Record<string, string[]> = {};
  
  if (process.env.DEBUG || process.env.PR_CHECKLIST_DEBUG) {
    console.log(`Analyzing ${files.length} files...`);
  }
  
  // Check each file
  for (const file of files) {
    if (process.env.DEBUG || process.env.PR_CHECKLIST_DEBUG) {
      console.log(`Analyzing file: ${file}`);
    }
    
    // Check file name patterns
    for (const { pattern, item } of config.checklist.filePatterns) {
      if (pattern.test(file) && !checklistItems.includes(item)) {
        checklistItems.push(item);
        matchedPatterns[item] = matchedPatterns[item] || [];
        matchedPatterns[item].push(`File pattern: ${pattern} in ${file}`);
      }
    }
    
    // Get file diff content
    const diffContent = getFileDiff(file, baseRef, headRef);
    
    // Filter out comments if configured
    const contentToAnalyze = config.checklist.filterComments 
      ? removeComments(diffContent) 
      : diffContent;
    
    // Check content patterns
    for (const { pattern, item } of config.checklist.contentPatterns) {
      if (pattern.test(contentToAnalyze) && !checklistItems.includes(item)) {
        checklistItems.push(item);
        matchedPatterns[item] = matchedPatterns[item] || [];
        matchedPatterns[item].push(`Content pattern: ${pattern}`);
      }
    }
  }
  
  if (process.env.DEBUG || process.env.PR_CHECKLIST_DEBUG) {
    console.log("Pattern matches:", matchedPatterns);
  }
  
  return checklistItems;
}

/**
 * Generate a checklist based on changed files
 * @param config Configuration
 * @param baseRef Base git reference
 * @param headRef Head git reference
 * @returns Formatted checklist
 */
export function generateChecklist(
  config: Config, 
  baseRef: string, 
  headRef: string
): string {
  // Get changed files
  const changedFiles = getChangedFiles(baseRef, headRef);
  
  // Filter out excluded files
  const filesToAnalyze = filterFiles(changedFiles, config.checklist.excludePatterns);
  
  // Analyze files and get specific checklist items
  const specificItems = analyzeFiles(filesToAnalyze, config, baseRef, headRef);
  
  // Combine standard and specific items
  const allItems = [...config.checklist.standardItems];
  
  // Add specific items if any were found
  if (specificItems.length > 0) {
    allItems.push("\n### Based on your changes:");
    allItems.push(...specificItems);
  }
  
  // Format the checklist
  const checklist = `
## PR Checklist
Please check these items before merging:

${allItems.join("\n")}
`;

  return checklist.trim();
}

/**
 * Add a checklist to a PR
 * @param checklist Formatted checklist
 * @param config Configuration
 */
export async function addChecklistToPR(checklist: string, config: Config): Promise<void> {
  if (!config.github.token) {
    throw new Error("GitHub token is required");
  }
  
  if (!config.github.owner || !config.github.repo) {
    throw new Error("GitHub repository owner and name are required");
  }
  
  if (!config.github.prNumber) {
    throw new Error("PR number is required");
  }
  
  const url = config.github.addAsComment
    ? `https://api.github.com/repos/${config.github.owner}/${config.github.repo}/issues/${config.github.prNumber}/comments`
    : `https://api.github.com/repos/${config.github.owner}/${config.github.repo}/pulls/${config.github.prNumber}`;
  
  const method = config.github.addAsComment ? 'POST' : 'PATCH';
  
  const body = config.github.addAsComment
    ? { body: checklist }
    : { body: checklist }; // For PATCH, we'd need to get the current PR body and append
  
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `token ${config.github.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update PR: ${response.status} ${response.statusText}\n${errorText}`);
  }
  
  console.log(config.github.addAsComment
    ? `Checklist added as comment to PR #${config.github.prNumber}`
    : `PR #${config.github.prNumber} description updated with checklist`);
}

/**
 * Main function to run the PR checklist generator
 * @param configPath Optional path to configuration file
 * @param baseRef Base git reference
 * @param headRef Head git reference
 * @param addToPR Whether to add the checklist to the PR
 * @returns Generated checklist
 */
export async function run({
  configPath,
  baseRef = 'HEAD~1',
  headRef = 'HEAD',
  addToPR = false
}: {
  configPath?: string;
  baseRef?: string;
  headRef?: string;
  addToPR?: boolean;
} = {}): Promise<string> {
  // Load configuration
  const config = await loadConfig(configPath);
  
  // Enable debug mode if set in config or environment
  if (config.checklist.debug || process.env.DEBUG || process.env.PR_CHECKLIST_DEBUG) {
    console.log('Debug mode enabled');
    console.log('Configuration:', JSON.stringify(config, null, 2));
  }
  
  // Generate the checklist
  const checklist = generateChecklist(config, baseRef, headRef);
  
  // Add to PR if requested
  if (addToPR) {
    await addChecklistToPR(checklist, config);
  }
  
  return checklist;
}

// Export everything for use as a library
export * from './types.js';
export * from './config.js';
export * from './defaultConfig.js';

// Default export for convenience
export default { run, generateChecklist, addChecklistToPR };

// Export createSampleConfig for CLI usage
export { createSampleConfig } from './config.js'; 