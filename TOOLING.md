# GraphWiz-XR Tooling Configuration

This document describes the linting and formatting tooling configured for the GraphWiz-XR monorepo.

## TypeScript/JavaScript Tooling

### ESLint

ESLint is configured for TypeScript and React with import sorting and strict type checking.

**Configuration Files:**
- `.eslintrc.cjs` - Main ESLint configuration

**Key Rules:**
- TypeScript strict type checking
- React and React Hooks rules
- Import ordering and organization
- No unused variables (with `_` prefix allowed)
- No console (except warn/error)

**Available Scripts:**
```bash
# Run ESLint on all TS/JS files
pnpm lint

# Run ESLint and auto-fix issues
pnpm lint:fix
```

### Prettier

Prettier handles code formatting with consistent style across the codebase.

**Configuration Files:**
- `.prettierrc` - Formatting rules
- `.prettierignore` - Files/directories to exclude

**Formatting Rules:**
- 2 space indentation
- Single quotes
- No trailing commas
- 100 character line width
- LF line endings

**Available Scripts:**
```bash
# Format all files
pnpm format

# Check formatting without making changes
pnpm format:check
```

### EditorConfig

`.editorconfig` maintains consistent coding styles across different editors and IDEs.

**Settings:**
- UTF-8 encoding
- LF line endings
- Trim trailing whitespace
- 2 space indent for TS/JS/CSS/HTML
- 4 space indent for Rust
- Tabs for Makefiles

## Rust Tooling

### rustfmt

Rust code formatting using rustfmt.

**Configuration Files:**
- `rustfmt.toml` - Project-wide formatting rules
- `.rustfmt.toml` - Workspace formatting rules

**Formatting Rules:**
- 4 space indentation
- 100 character line width
- Reorder imports and modules
- Use field init shorthand
- Use try shorthand
- Format code in doc comments

**Available Scripts:**
```bash
# Format all Rust code
pnpm fmt:rust

# Check formatting without making changes
pnpm fmt:rust:check
```

### Clippy

Clippy provides additional Rust linting beyond the compiler.

**Configuration File:**
- `clippy.toml` - Clippy lint rules and thresholds

**Key Settings:**
- Cognitive complexity threshold: 30
- Type complexity threshold: 250
- Function lines threshold: 100
- Allows expect/unwrap in tests
- Blacklisted variable names: foo, bar, baz, quux

**Available Scripts:**
```bash
# Run Clippy on all workspace targets
pnpm lint:rust
```

## Pre-commit Workflow

Before committing changes, run the following commands:

```bash
# Check TypeScript/JavaScript formatting and linting
pnpm format:check
pnpm lint

# Check Rust formatting and linting
pnpm fmt:rust:check
pnpm lint:rust
```

To auto-fix issues:

```bash
# Fix TypeScript/JavaScript issues
pnpm format
pnpm lint:fix

# Fix Rust formatting
pnpm fmt:rust
```

## IDE Integration

### VSCode

Install these extensions:
- ESLint
- Prettier
- rust-analyzer

Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer"
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### JetBrains IDEs

- Built-in support for EditorConfig
- Install ESLint and Prettier plugins
- Rust plugin includes rustfmt and clippy integration

## CI/CD Integration

These tools should be integrated into CI/CD pipelines:

```yaml
# Example CI step
- name: Lint TypeScript
  run: pnpm lint

- name: Format Check
  run: pnpm format:check

- name: Lint Rust
  run: pnpm lint:rust

- name: Check Rust Formatting
  run: pnpm fmt:rust:check
```

## Troubleshooting

### ESLint: "Project not found"

Ensure `tsconfig.json` exists at the root and in each package. The ESLint config uses TypeScript project references for better type checking.

### Prettier conflicts with ESLint

The `.eslintrc.cjs` extends `eslint-config-prettier` to disable all ESLint formatting rules that conflict with Prettier.

### Rust toolchain not found

Install Rust using rustup:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## Configuration Files Summary

- `.eslintrc.cjs` - ESLint configuration
- `.prettierrc` - Prettier formatting rules
- `.prettierignore` - Prettier exclusions
- `.editorconfig` - Editor-agnostic settings
- `rustfmt.toml` - Rust formatting (project)
- `.rustfmt.toml` - Rust formatting (workspace)
- `clippy.toml` - Clippy linting rules
