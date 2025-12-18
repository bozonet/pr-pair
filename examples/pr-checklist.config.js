/**
 * PR Pair PR Checklist Generator Configuration Example
 */
export default {
  checklist: {
    // Standard checklist items that are always included
    standardItems: [
      "- [ ] Code follows the project's coding style",
      "- [ ] Documentation has been updated (if applicable)",
      "- [ ] Tests have been added/updated (if applicable)",
      "- [ ] All tests pass",
      "- [ ] The code has been reviewed by at least one other developer"
    ],
    
    // Patterns to match in file names
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
      }
    ],
    
    // Patterns to match in file content
    contentPatterns: [
      {
        pattern: /useEffect|useState|useContext/i,
        item: "- [ ] React hooks usage has been reviewed for potential issues"
      },
      {
        pattern: /fetch\(|axios\./i,
        item: "- [ ] API calls include proper error handling"
      },
      {
        pattern: /password|token|secret|key|auth|jwt|session/i,
        item: "- [ ] Security-sensitive code has been reviewed for vulnerabilities"
      }
    ],
    
    // Patterns for files to exclude from analysis
    excludePatterns: [
      /^\.github\/workflows\//,
      /^node_modules\//,
      /^dist\//,
      /^README\.md$/,
      /^LICENSE$/
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