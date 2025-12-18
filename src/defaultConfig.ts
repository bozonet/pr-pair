import { ChecklistConfig, GitHubConfig, Config } from './types.js';

/**
 * Default checklist configuration
 */
export const defaultChecklistConfig: ChecklistConfig = {
  standardItems: [
    "- [ ] Code follows the project's coding style",
    "- [ ] Documentation has been updated (if applicable)",
    "- [ ] Tests have been added/updated (if applicable)",
    "- [ ] All tests pass",
    "- [ ] The code has been reviewed",
    "- [ ] Performance considerations have been taken into account",
    "- [ ] Security implications have been considered"
  ],
  
  filePatterns: [
    { 
      pattern: /prisma|schema\.prisma/i, 
      item: "- [ ] Prisma schema changes have been validated and migrations created if needed" 
    },
    { 
      pattern: /\.tsx?$|\.jsx?$/i, 
      item: "- [ ] Component changes have been tested in different browsers/devices" 
    },
    { 
      pattern: /api\/|server\/|route\./i, 
      item: "- [ ] API changes have been tested and documented" 
    },
    { 
      pattern: /\.css$|\.scss$|tailwind/i, 
      item: "- [ ] UI changes look good on all screen sizes" 
    },
    { 
      pattern: /package\.json|package-lock\.json|yarn\.lock/i, 
      item: "- [ ] New dependencies have been reviewed for security and license compatibility" 
    },
    { 
      pattern: /\.env|config|secret/i, 
      item: "- [ ] Environment variables or configuration changes have been documented" 
    },
    { 
      pattern: /auth|login|password|credential/i, 
      item: "- [ ] Authentication/security changes have been reviewed by a team member" 
    },
    { 
      pattern: /\.sql$|migration|database/i, 
      item: "- [ ] Database changes have been tested and have rollback plans" 
    }
  ],
  
  contentPatterns: [
    {
      pattern: /useEffect|useState|useContext|useReducer|useMemo|useCallback|useRef/i,
      item: "- [ ] React hooks usage has been reviewed for potential issues (dependencies, cleanup)"
    },
    {
      pattern: /fetch\(|axios\.|\.get\(|\.post\(|\.put\(|\.delete\(/i,
      item: "- [ ] API calls include proper error handling"
    },
    {
      pattern: /password|token|secret|key|auth|jwt|session/i,
      item: "- [ ] Security-sensitive code has been reviewed for vulnerabilities"
    },
    {
      pattern: /\blocalStorage\b|\bsessionStorage\b|\bdocument\.cookie\b|\bcookies\b/i,
      item: "- [ ] Client-side storage usage has been reviewed for security and privacy"
    },
    {
      pattern: /SELECT|INSERT|UPDATE|DELETE FROM|CREATE TABLE|ALTER TABLE/i,
      item: "- [ ] SQL queries have been reviewed for performance and injection risks"
    },
    {
      pattern: /setTimeout|setInterval|requestAnimationFrame/i,
      item: "- [ ] Timer/animation code has proper cleanup to prevent memory leaks"
    },
    {
      pattern: /\.map\(|\.filter\(|\.reduce\(|\.forEach\(/i,
      item: "- [ ] Array operations have been checked for performance with large datasets"
    },
    {
      pattern: /new\s+Promise|async|await|\.then\(|\.catch\(/i,
      item: "- [ ] Asynchronous code has proper error handling"
    },
    {
      pattern: /console\.log|debugger|TODO|FIXME/i,
      item: "- [ ] Debug code and development comments have been removed"
    },
    {
      pattern: /import\s+.*\s+from/i,
      item: "- [ ] New imports/dependencies have been reviewed"
    }
  ],
  
  excludePatterns: [
    /^\.github\/workflows\//,
    /^\.husky\//,
    /^\.vscode\//,
    /^node_modules\//,
    /^dist\//,
    /^coverage\//,
    /^\.git\//,
    /^\.DS_Store$/,
    /^README\.md$/,
    /^LICENSE$/,
    /^pr-pair\.config\.js$/
  ],
  
  filterComments: true,
  debug: false
};

/**
 * Default GitHub configuration
 */
export const defaultGitHubConfig: GitHubConfig = {
  addAsComment: true
};

/**
 * Default complete configuration
 */
export const defaultConfig: Config = {
  checklist: defaultChecklistConfig,
  github: defaultGitHubConfig
}; 