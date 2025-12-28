# CI/CD Quick Start Guide

## Quick Setup (5 Minutes)

### Step 1: Configure Required Secrets

Go to your GitHub repository settings: `Settings > Secrets and variables > Actions`

Add the following secrets:

#### Required Secrets
```bash
# For Docker Hub (get from: https://hub.docker.com/settings/security)
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-access-token

# For npm (get from: https://www.npmjs.com/settings/tokens)
NPM_TOKEN=your-npm-auth-token

# For Codecov (get from: https://codecov.io/settings)
CODECOV_TOKEN=your-codecov-token

# For Snyk (optional - get from: https://snyk.io/)
SNYK_TOKEN=your-snyk-token
```

### Step 2: Add CI/CD Badge to README

Add this to your `README.md`:

```markdown
# GraphWiz-XR Hub Client

[![Tests](https://github.com/YOUR-USERNAME/graphwiz-xr/workflows/Tests/badge.svg)](https://github.com/YOUR-USERNAME/graphwiz-xr/actions/workflows/test.yml)
[![E2E Tests](https://github.com/YOUR-USERNAME/graphwiz-xr/workflows/E2E%20Tests/badge.svg)](https://github.com/YOUR-USERNAME/graphwiz-xr/actions/workflows/e2e.yml)
[![Build](https://github.com/YOUR-USERNAME/graphwiz-xr/workflows/Build/badge.svg)](https://github.com/YOUR-USERNAME/graphwiz-xr/actions/workflows/build.yml)

## CI/CD Status

| Workflow | Status |
|----------|--------|
| Tests | ![Tests](https://github.com/YOUR-USERNAME/graphwiz-xr/workflows/Tests/badge.svg) |
| E2E | ![E2E Tests](https://github.com/YOUR-USERNAME/graphwiz-xr/workflows/E2E%20Tests/badge.svg) |
| Build | ![Build](https://github.com/YOUR-USERNAME/graphwiz-xr/workflows/Build/badge.svg) |

```

**Replace `YOUR-USERNAME` with your actual GitHub username!**

### Step 3: Push Code to Trigger CI/CD

```bash
git add .
git commit -m "chore: add CI/CD pipeline"
git push origin main
```

That's it! 🎉 The CI/CD pipeline will automatically start.

## What Happens Next?

### On Push to main/develop

✅ **Automatically Runs**:
1. Unit tests (236 tests, ~8 seconds)
2. Coverage report
3. Type checking
4. Linting
5. Application build
6. Docker image build & push (main only)

### On Pull Request

✅ **Automatically Runs**:
1. Unit tests
2. Coverage report
3. Type checking
4. Linting
5. Application build

### On Git Tag (v1.0.0)

```bash
git tag v1.0.0
git push origin v1.0.0
```

✅ **Automatically Runs**:
1. All the above (tests, build, etc.)
2. Creates GitHub release
3. Publishes to npm
4. Tags and pushes Docker images

## Verify CI/CD is Working

### Check Workflow Status

Go to: `https://github.com/YOUR-USERNAME/graphwiz-xr/actions`

You should see:
- ✅ Green checkmarks = Passing
- ❌ Red X = Failing (click to see logs)

### View Workflow Runs

Click on any workflow to see:
- Recent runs
- Execution time
- Logs and artifacts
- Test results

## Common Commands

### Run Tests Locally (Before Push)

```bash
# Unit tests
npm test -- --run

# E2E tests
npx playwright test

# Coverage
npm test -- --run --coverage

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

### Trigger Specific Workflows

#### Trigger Mutation Testing
Add `[mutation-test]` to commit message:

```bash
git commit -m "chore: [mutation-test] run mutation tests"
git push
```

#### Run E2E Tests Locally

```bash
# Install browsers
npx playwright install

# Run E2E tests
npx playwright test

# Run with UI
npx playwright test --ui
```

## Troubleshooting

### Tests Pass Locally but Fail in CI

1. **Check Node.js version** - CI uses Node 20
   ```bash
   node --version  # Should be v20.x
   ```

2. **Clear pnpm cache**
   ```bash
   pnpm store prune
   pnpm install
   ```

3. **Check environment differences**
   - CI uses Ubuntu Linux
   - You might be on macOS/Windows
   - File paths and line endings differ

### Docker Build Fails

1. **Check Docker secrets** are set correctly
2. **Verify Dockerfiles exist** in service directories:
   - `packages/services/reticulum/auth/Dockerfile`
   - `packages/services/reticulum/hub/Dockerfile`
   - etc.

### Coverage Upload Fails

1. **Verify CODECOV_TOKEN** is set
2. **Check coverage file exists**: `coverage/coverage-final.json`
3. **Visit** https://codecov.io for detailed error logs

## Workflow Status Monitoring

### Add Status to Your Shell

```bash
# Add to ~/.bashrc or ~/.zshrc
function git-ci-status() {
  git ls-remote --heads origin | grep -q $(git branch --show-current) && \
  curl -s "https://api.github.com/repos/YOUR-USERNAME/graphwiz-xr/actions/workflows" | \
  jq '.workflows[] | select(.name | contains("Tests")) | .state'
}

alias ci-status=git-ci-status
```

### Badge in Terminal

```bash
# Watch CI status
watch -n 30 "curl -s 'https://api.github.com/repos/YOUR-USERNAME/graphwiz-xr/actions/workflows/Test/runs' | \
  jq '.workflow_runs[0] | {status, conclusion}'"
```

## Advanced: Customize Workflows

### Change Node.js Version

Edit `.github/workflows/test.yml`:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '22'  # Change to 22
```

### Add More Test Jobs

```yaml
job-name:
  runs-on: ubuntu-latest
  steps:
    - name: Run custom test
      run: npm run test:custom
```

### Schedule Workflows

```yaml
on:
  schedule:
    # Every Monday at 9 AM UTC
    - cron: '0 9 * * 1'
```

## Next Steps

1. ✅ **Configure secrets** (Step 1 above)
2. ✅ **Add badges** to README
3. ✅ **Push code** and watch workflows run
4. ✅ **Monitor** Actions tab
5. ✅ **Enjoy** automated CI/CD! 🚀

## Support

### Documentation
- [Full CI/CD Documentation](.github/workflows/README.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Troubleshooting](.github/workflows/README.md#troubleshooting)

### Get Help
- Create an issue: https://github.com/graphwiz-xr/hub-client/issues
- Check workflow logs: Actions tab > Click workflow > Click run > View logs

---

**Status**: ✅ **Ready to use**
**Time to Setup**: 5 minutes
**Difficulty**: Easy
**Date**: 2025-12-28

*Happy automating! 🤖*
