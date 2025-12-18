# pr-pair Checklist Generator

Automatically generate PR checklists based on changed files and their content. This tool analyzes the files changed in a pull request and generates a checklist of items that should be reviewed, based on the types of files and code patterns found.

## Features

- Analyzes file names and content to generate relevant checklist items
- Customizable patterns and checklist items
- Can be used as a CLI tool or as a library
- Can add checklists as comments to GitHub PRs
- Configurable via JavaScript, JSON, or environment variables
- Filters out implementation files and comments

## Installation

### Recommended: Dev Dependency (For Teams & Projects)

**Recommended for teams and CI/CD pipelines.** This ensures version consistency and allows project-specific configuration.

```bash
npm install --save-dev pr-pair
```

After installation, use via `npx`:

```bash
npx pr-pair init
npx pr-pair generate
npx pr-pair add-to-pr --number 123
```

### Alternative: Global Installation (For Personal Use)

**Good for personal use across multiple projects.**

```bash
npm install -g pr-pair
```

After global installation, use directly:

```bash
pr-pair init
pr-pair generate
pr-pair add-to-pr --number 123
```

## Usage

### CLI

**If installed as dev dependency (recommended):**

```bash
# Create a sample configuration file
npx pr-pair init

# Generate a checklist based on changes between HEAD~1 and HEAD
npx pr-pair generate

# Generate a checklist and add it as a comment to a PR
npx pr-pair add-to-pr --number 123

```

**If installed globally:**

```bash
# Generate a checklist based on changes between HEAD~1 and HEAD
pr-pair generate

# Generate a checklist and add it as a comment to a PR
pr-pair add-to-pr --number 123

# Create a sample configuration file
pr-pair init
```

### API

```javascript
import { run } from "pr-pair";

// Generate a checklist
const checklist = await run({
  configPath: "./pr-pair.config.js",
  baseRef: "main",
  headRef: "feature-branch",
  addToPR: false,
});

console.log(checklist);
```

## Configuration

You can configure the pr-pair Checklist Generator using a configuration file or environment variables.

### Configuration File

Create a configuration file using:

```bash
pr-pair init --output pr-pair.config.js
```

This will create a sample configuration file that you can customize:

```javascript
export default {
  checklist: {
    // Standard checklist items that are always included
    standardItems: [
      "- [ ] Code follows the project's coding style",
      "- [ ] Documentation has been updated (if applicable)",
      "- [ ] Tests have been added/updated (if applicable)",
      "- [ ] All tests pass",
      "- [ ] The code has been reviewed",
    ],

    // Patterns to match in file names
    filePatterns: [
      {
        pattern: /prisma|schema\.prisma/i,
        item: "- [ ] Prisma schema changes have been validated and migrations created if needed",
      },
      {
        pattern: /\.tsx?$|\.jsx?$/i,
        item: "- [ ] Component changes have been tested in different browsers/devices",
      },
    ],

    // Patterns to match in file content
    contentPatterns: [
      {
        pattern: /useEffect|useState|useContext/i,
        item: "- [ ] React hooks usage has been reviewed for potential issues",
      },
      {
        pattern: /fetch\(|axios\./i,
        item: "- [ ] API calls include proper error handling",
      },
    ],

    // Patterns for files to exclude from analysis
    excludePatterns: [/^\.github\/workflows\//, /^node_modules\//, /^dist\//],

    // Whether to filter out comments before analyzing file content
    filterComments: true,

    // Whether to include debug information in the output
    debug: false,
  },

  github: {
    // Whether to add the checklist as a comment (true) or update the PR description (false)
    addAsComment: true,
  },
};
```

### Environment Variables

The package reads these environment variables:

- `GITHUB_TOKEN`: GitHub token for API access (required for PR operations)
- `GITHUB_REPOSITORY`: GitHub repository in the format `owner/repo` (required for PR operations)
- `PR_NUMBER`: PR number to update (can also be passed via CLI `--number` flag)
- `DEBUG` or `PR_CHECKLIST_DEBUG`: Enable debug output

**Authentication Options (in order of precedence):**

1. **Environment variable** `GITHUB_TOKEN` (highest priority)
2. **GitHub CLI** - If `GITHUB_TOKEN` is not set, the package will try to use `gh auth token` (requires `gh` CLI to be installed and authenticated)
3. **Config file** - Can be set in `pr-pair.config.js` (not recommended for tokens)

**In GitHub Actions:**

- `${{ secrets.GITHUB_TOKEN }}` - Automatically provided by GitHub Actions (no setup needed)
- `${{ github.repository }}` - GitHub Actions context variable (automatically available)
- `${{ github.event.pull_request.number }}` - PR number from the event

**For local usage:**

- **Option 1:** Set environment variable: `export GITHUB_TOKEN="your-token"`
- **Option 2:** Use GitHub CLI: `gh auth login` (then the package will automatically use it)
- **Option 3:** Create a Personal Access Token (PAT) with `repo` scope and set it as `GITHUB_TOKEN`

## GitHub Actions Integration

You can use the PR PAIR in a GitHub Actions workflow. **Recommended approach: add as dev dependency.**

> **Why does GitHub Actions need a token?**
>
> Even though GitHub Actions automatically provides `GITHUB_TOKEN`, you still need to pass it to the command because:
>
> 1. **The package makes API calls** - To add comments to PRs, it needs to call GitHub's REST API (`https://api.github.com/repos/...`)
> 2. **GitHub API requires authentication** - All API calls need an Authorization header with a token
> 3. **GitHub Actions provides it, but doesn't auto-inject it** - You need to explicitly pass `GITHUB_TOKEN` as an environment variable so the package can read it
>
> **Good news:**
>
> - GitHub Actions provides `${{ secrets.GITHUB_TOKEN }}` automatically - you don't need to create it manually!
> - For local usage, you can use GitHub CLI (`gh auth login`) and the package will automatically use that token if `GITHUB_TOKEN` is not set

### Option 1: Dev Dependency (Recommended)

Add `pr-pair` to your `package.json` as a dev dependency, then use it in your workflow:

```yaml
name: Add Checklist to PR

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  checklist:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Add Checklist to PR
        env:
          # These are GitHub Actions-specific variables (automatically available):
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # Auto-provided by GitHub Actions
          GITHUB_REPOSITORY: ${{ github.repository }} # Auto-provided context variable
          PR_NUMBER: ${{ github.event.pull_request.number }} # From PR event
        run: npx pr-pair add-to-pr --number ${{ github.event.pull_request.number }}
```

### Option 2: Global Installation

Alternatively, install globally in the workflow:

```yaml
- name: Install pr-pair Checklist Generator
  run: npm install -g pr-pair

- name: Add Checklist to PR
  env:
    # These are GitHub Actions-specific variables (automatically available):
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # Auto-provided by GitHub Actions
    GITHUB_REPOSITORY: ${{ github.repository }} # Auto-provided context variable
    PR_NUMBER: ${{ github.event.pull_request.number }} # From PR event
  run: pr-pair add-to-pr --number ${{ github.event.pull_request.number }}
```

## License

MIT
