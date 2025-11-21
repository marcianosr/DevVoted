# CI/CD Setup

This document explains the continuous integration and quality checks configured for DevVoted.

## Overview

DevVoted uses a multi-layered quality gate approach:

1. **Local Pre-Commit Hooks** - Fast checks before committing
2. **Local Pre-Push Hooks** - Comprehensive checks before pushing
3. **GitHub Actions PR Checks** - Automated validation on pull requests

## Local Git Hooks (Husky)

### Pre-Commit Hook

Runs on every `git commit`. This is your first line of defense.

**What it does:**

- Lints and formats staged files (via lint-staged)
- Runs TypeScript type checking on entire codebase
- Runs all tests to ensure nothing breaks

**Time:** ~30-60 seconds depending on test suite size

**Why:** Catches issues early before they enter the commit history

### Pre-Push Hook

Runs on every `git push`. This is your comprehensive safety net.

**What it does:**

- Runs full test suite with coverage
- Builds the application to ensure production build works

**Time:** ~1-2 minutes

**Why:** Ensures you never push broken code to remote

### Bypassing Hooks (Emergency Only)

If you absolutely need to bypass hooks (not recommended):

```bash
# Skip pre-commit hook
git commit --no-verify -m "message"

# Skip pre-push hook
git push --no-verify
```

**Note:** PR checks will still run and fail if issues exist.

## GitHub Actions PR Checks

### Workflow: PR Checks

**Triggers:**

- Pull requests to `main` or `develop` branches
- Direct pushes to `main` branch

**Jobs:**

1. **Checkout** - Gets latest code
2. **Setup Node.js** - Installs Node 20 with npm cache
3. **Install Dependencies** - Runs `npm ci` for clean install
4. **Lint** - Runs ESLint on entire codebase
5. **Format Check** - Verifies Prettier formatting
6. **Type Check** - Runs TypeScript compiler
7. **Tests** - Runs full test suite
8. **Build** - Attempts production build

**Status:**

- ✅ All checks pass → PR can be merged
- ❌ Any check fails → PR is blocked

### Viewing Check Results

1. Navigate to your PR on GitHub
2. Scroll to the "Checks" section at the bottom
3. Click "Details" next to any failed check to see logs
4. Fix issues locally and push to update the PR

## Configuration Files

### `.github/workflows/pr-checks.yaml`

GitHub Actions workflow definition for PR validation.

**Key settings:**

- Timeout: 10 minutes max
- Node version: 20
- Uses npm cache for faster installs

### `.husky/pre-commit`

Local git hook that runs before commits.

**Customization:**

To disable type checking or tests in pre-commit, edit this file and comment out the relevant sections.

### `.husky/pre-push`

Local git hook that runs before pushes.

**Customization:**

To make pre-push faster, you can remove the build step if you're confident in your changes.

### `package.json` - lint-staged

Defines what commands run on staged files:

```json
{
	"lint-staged": {
		"*.{ts,tsx}": ["eslint --fix", "prettier --write"],
		"*.{json,md}": ["prettier --write"]
	}
}
```

## Quality Standards

### All code must:

- ✅ Pass ESLint with no errors
- ✅ Follow Prettier formatting rules
- ✅ Pass TypeScript type checking
- ✅ Have passing tests (or new tests added)
- ✅ Build successfully for production

### Test Requirements:

- Coverage target: 80% (defined in CLAUDE.md)
- No skipped tests in changed files
- New features require new tests

## Troubleshooting

### "Type check failed" on commit

```bash
# Run type check to see errors
npx tsc --noEmit

# Fix the errors shown
# Then retry commit
```

### "Tests failed" on commit

```bash
# Run tests to see failures
npm test

# Fix failing tests
# Then retry commit
```

### "Build failed" on push

```bash
# Run build locally to debug
npm run build

# Check for type errors or missing dependencies
# Fix issues and retry push
```

### PR checks failing but local hooks pass

This can happen if:

- You have uncommitted changes
- Your local node_modules differs from CI
- Environment variables missing in CI

**Solution:**

```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Run all checks locally
npm run lint
npm run format:check
npx tsc --noEmit
npm test -- --run
npm run build
```

## Performance Tips

### Speed up pre-commit

The pre-commit hook runs all tests. If this becomes slow:

**Option 1:** Only run tests for changed files (requires additional scripting)

**Option 2:** Move all test execution to pre-push only

Edit `.husky/pre-commit` and remove the test section.

### Speed up pre-push

The pre-push hook runs build. If you push frequently:

**Option 1:** Skip build in pre-push, rely on PR checks

**Option 2:** Use `git push --no-verify` occasionally (not recommended)

## Best Practices

1. **Commit often, push less** - Local hooks are fast, use them
2. **Fix issues immediately** - Don't bypass hooks to "fix later"
3. **Run checks before creating PR** - Saves CI time
4. **Keep PRs small** - Faster reviews, faster CI
5. **Watch PR checks** - Don't create PR and walk away

## Advanced: CI Optimization

### Caching Strategy

Current setup caches:

- npm packages (via `cache: 'npm'`)

**Future improvements:**

- Cache TypeScript build info
- Cache test results
- Parallel job execution

### Branch Protection Rules

To enforce PR checks on GitHub:

1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable "Require status checks to pass"
4. Select "quality-checks" workflow
5. Enable "Require branches to be up to date"

This ensures no PR can be merged without passing all checks.
