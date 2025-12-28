# CI/CD Pipeline - GraphWiz-XR Hub Client

**Last Updated**: 2025-12-28
**Status**: ✅ **ACTIVE**

## Overview

This document describes the CI/CD pipeline configuration for GraphWiz-XR Hub Client using GitHub Actions.

## Workflows

### 1. Tests Workflow (`test.yml`)

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs**:

#### Unit Tests
- Runs all 236 unit tests
- Executes on every push and PR
- Runs on Ubuntu Latest
- Test execution time: ~7-8 seconds

```bash
npm test -- --run
```

**Artifacts**:
- Uploads test results
- Retention: 7 days

#### Coverage Report
- Runs after unit tests pass
- Generates coverage with v8 provider
- Uploads to Codecov
- Generates HTML, JSON, and text reports

```bash
npm test -- --run --coverage
```

**Artifacts**:
- Coverage report (HTML, JSON)
- Retention: 7 days

#### Type Check
- Validates TypeScript types
- Catches type errors before runtime

```bash
npx tsc --noEmit
```

#### Lint
- Runs ESLint (if configured)
- Checks code quality and style

```bash
npm run lint
```

### 2. E2E Tests Workflow (`e2e.yml`)

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Schedule: Daily at 2 AM UTC

**Jobs**:

#### Playwright E2E Tests
- Runs end-to-end tests with Playwright
- Tests on Chromium, Firefox, and WebKit
- Timeout: 30 minutes
- Builds application before testing

```bash
npx playwright install --with-deps
npm run build
npx playwright test
```

**Artifacts**:
- Playwright report (HTML)
- Screenshots (on failure)
- Retention: 7 days

### 3. Build Workflow (`build.yml`)

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs**:

#### Build Application
- Compiles TypeScript
- Bundles with Vite
- Creates production-ready build

```bash
npm run build
```

**Artifacts**:
- Build artifacts (dist/)
- Retention: 7 days

#### Docker Build
- Only on push to `main` branch
- Builds Docker images for services
- Pushes to Docker Hub

**Services**:
- auth
- hub
- presence
- reticulum

**Tags**:
- `graphwizxr/<service>:latest`
- `graphwizxr/<service>:<git-sha>`

### 4. Quality Assurance Workflow (`quality.yml`)

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Schedule: Weekly on Sundays at 3 AM UTC

**Jobs**:

#### Mutation Testing
- Runs STRYKER mutation testing
- Validates test suite quality
- Only on schedule or when commit contains `[mutation-test]`

```bash
node .qa/run-all-mutation-tests.cjs
```

**Artifacts**:
- Mutation test reports
- Retention: 7 days

#### Security Audit
- Runs `pnpm audit`
- Scans for vulnerabilities
- Integrates with Snyk

```bash
pnpm audit --audit-level moderate
```

#### Dependency Check
- Checks for outdated dependencies
- Validates dependency security

```bash
pnpm outdated
pnpm audit
```

### 5. Release Workflow (`release.yml`)

**Triggers**:
- Git tags matching `v*.*.*`
- Manual workflow dispatch

**Jobs**:

#### Create Release
- Creates GitHub release
- Generates changelog
- Publishes release notes

#### Publish to npm
- Publishes package to npm registry
- Requires `NPM_TOKEN` secret

```bash
pnpm publish --no-git-checks --access public
```

#### Docker Release
- Builds and pushes Docker images
- Tags with version number
- Updates Docker Hub descriptions

**Tags**:
- `graphwizxr/<service>:<version>`
- `graphwizxr/<service>:latest`

## Required Secrets

### GitHub Secrets

Configure these in: `Repository Settings > Secrets and variables > Actions`

| Secret | Description | Required For | Value |
|--------|-------------|--------------|-------|
| `CODECOV_TOKEN` | Codecov upload token | Coverage upload | Get from codecov.io |
| `DOCKER_USERNAME` | Docker Hub username | Docker push | Your Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password/token | Docker push | Docker Hub access token |
| `NPM_TOKEN` | npm authentication token | npm publish | Get from npmjs.com |
| `SNYK_TOKEN` | Snyk monitoring token | Security scanning | Get from snyk.io |
| `GITHUB_TOKEN` | GitHub token (auto-provided) | Creating releases | Auto-provided by Actions |

## Getting Started

### 1. Fork and Clone

```bash
git clone https://github.com/your-username/graphwiz-xr.git
cd graphwiz-xr/packages/clients/hub-client
```

### 2. Configure Secrets

Go to your repository settings and add the required secrets listed above.

### 3. Push Code

```bash
git add .
git commit -m "Add CI/CD pipeline"
git push origin main
```

### 4. View Workflows

Navigate to: `https://github.com/your-username/graphwiz-xr/actions`

## Workflow Badges

Add these badges to your README:

```markdown
![Tests](https://github.com/your-username/graphwiz-xr/workflows/Tests/badge.svg)
![E2E Tests](https://github.com/your-username/graphwiz-xr/workflows/E2E%20Tests/badge.svg)
![Build](https://github.com/your-username/graphwiz-xr/workflows/Build/badge.svg)
![Quality Assurance](https://github.com/your-username/graphwiz-xr/workflows/Quality%20Assurance/badge.svg)
```

## Workflow Status

### Current Status

| Workflow | Status | Description |
|----------|--------|-------------|
| **Tests** | ✅ Active | Runs on every push/PR |
| **E2E Tests** | ✅ Active | Runs on every push/PR + daily |
| **Build** | ✅ Active | Runs on every push/PR |
| **Quality Assurance** | ✅ Active | Runs weekly + on demand |
| **Release** | ✅ Active | Runs on git tags |

## Local Development

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

### Test CI/CD Locally

#### Using act (GitHub Actions runner locally)

```bash
# Install act
brew install act  # macOS
# or
choco install act  # Windows
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run test workflow
act push

# Run specific job
act -j test
```

## Workflow Execution Order

### Normal Push to main/develop

```
1. Tests Workflow
   ├─ test (unit tests)
   ├─ coverage
   ├─ type-check
   └─ lint

2. Build Workflow
   ├─ build
   └─ docker (main only)
```

### Pull Request

```
1. Tests Workflow (all jobs)
2. Build Workflow (build job only)
```

### Tagged Release (v1.0.0)

```
1. Tests Workflow (all jobs)
2. Build Workflow (all jobs)
3. Release Workflow
   ├─ release (create GitHub release)
   ├─ npm-publish
   └─ docker-release
```

## Continuous Deployment

### Automatic Deployments

The pipeline supports automatic deployments:

1. **Docker Images**: Built and pushed on every push to `main`
2. **npm Package**: Published on git tags
3. **GitHub Releases**: Created on git tags

### Deployment Environments

| Environment | Trigger | Description |
|------------|----------|-------------|
| **Development** | Push to `develop` | Builds and tests |
| **Production** | Push to `main` | Builds, tests, and deploys |
| **Release** | Git tag `v*` | Creates release, publishes to npm and Docker Hub |

## Notifications

### Status Badges

Add to README.md:

```markdown
## CI/CD Status

[![Tests](https://github.com/graphwiz-xr/hub-client/workflows/Tests/badge.svg)](https://github.com/graphwiz-xr/hub-client/actions/workflows/test.yml)
[![E2E Tests](https://github.com/graphwiz-xr/hub-client/workflows/E2E%20Tests/badge.svg)](https://github.com/graphwiz-xr/hub-client/actions/workflows/e2e.yml)
[![Build](https://github.com/graphwiz-xr/hub-client/workflows/Build/badge.svg)](https://github.com/graphwiz-xr/hub-client/actions/workflows/build.yml)
```

### Slack/Discord Notifications (Optional)

Add to workflows:

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Tests completed!'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Troubleshooting

### Tests Failing in CI but Passing Locally

1. Check Node.js version (CI uses Node 20)
2. Clear cache: `pnpm store prune`
3. Check environment: CI uses Ubuntu, you might be on macOS/Windows
4. Check for flaky tests: Run tests multiple times locally

### Coverage Upload Failing

1. Verify `CODECOV_TOKEN` is set correctly
2. Check coverage file exists: `coverage/coverage-final.json`
3. Check Codecov status: https://codecov.io

### Docker Build Failing

1. Check Dockerfile exists in service directory
2. Verify `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets
3. Check build logs for specific errors

### E2E Tests Failing

1. Check if Playwright browsers are installed: `npx playwright install`
2. Check if application builds: `npm run build`
3. Run locally: `npx playwright test --headed`
4. Check screenshots in artifacts

## Best Practices

### 1. Always Run Tests Before Pushing

```bash
npm test -- --run
```

### 2. Use Conventional Commits

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in tests"
git commit -m "ci: update CI configuration"
```

### 3. Keep Dependencies Updated

```bash
pnpm update
pnpm audit fix
```

### 4. Monitor Workflow Runs

Check Actions tab regularly for failing workflows.

### 5. Use Branch Protection Rules

Settings > Branches > Add rule:
- Require status checks to pass before merging
- Require branches to be up to date before merging

## Maintenance

### Updating Workflows

1. Edit workflow files in `.github/workflows/`
2. Commit and push changes
3. Verify in Actions tab

### Updating Dependencies

```bash
pnpm update -L
git add pnpm-lock.yaml
git commit -m "chore: update dependencies"
git push
```

## Performance Metrics

### Average Workflow Times

| Workflow | Duration |
|----------|----------|
| **Tests** | ~8-10 seconds |
| **E2E Tests** | ~2-5 minutes |
| **Build** | ~30-60 seconds |
| **Quality Assurance** | ~5-10 minutes |
| **Release** | ~5-10 minutes |

## Support

### Documentation

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)

### Issues

Report CI/CD issues in: https://github.com/graphwiz-xr/hub-client/issues

---

**Status**: ✅ **CI/CD PIPELINE ACTIVE**
**Tests**: 236/236 passing (100%)
**Workflows**: 5 active workflows
**Date**: 2025-12-28

*Automated with ❤️ by GitHub Actions*
