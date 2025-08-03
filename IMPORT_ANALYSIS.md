# Import Analysis Tools

This project now includes several tools to check for unused imports, duplicate imports, and other import-related issues.

## Available Tools

### 1. ESLint (Primary Tool)

**What it detects:**
- Unused imports
- Duplicate imports from the same module
- Import ordering issues
- Unused variables

**Commands:**
```bash
# Check for issues
npm run lint

# Automatically fix issues
npm run lint:fix
```

### 2. Analysis Script

**What it does:**
- Runs comprehensive import analysis
- Combines ESLint with optional Shrimpit analysis
- Provides summary of findings

**Command:**
```bash
npm run analyze-imports
```

### 3. Shrimpit (Optional)

**What it detects:**
- Unused exports across the entire project
- Complete import/export dependency tree
- More detailed analysis than ESLint

**Installation:**
```bash
npm i -g shrimpit
```

**Usage:**
```bash
# Basic analysis
shrimpit src/

# Detailed tree view
shrimpit --tree src/
```

## Current Analysis Results

Based on the latest scan, ESLint found and fixed:
- ✅ **12 unused imports** were automatically removed
- ✅ **3 import ordering issues** were fixed
- ⚠️ **5 remaining warnings** about import grouping
- ❌ **2 remaining errors** that need manual fixing:
  - `DOMPurify` is not defined in `formatters.js`
  - Unexpected constant condition in `api.js`

## Recommended Workflow

1. **Regular checks:** Run `npm run lint` before committing code
2. **Auto-fix:** Use `npm run lint:fix` to automatically resolve most issues
3. **Deep analysis:** Run `npm run analyze-imports` for comprehensive review
4. **Manual review:** Address remaining errors that can't be auto-fixed

## Configuration

ESLint configuration is in `.eslintrc.json` with these key rules:
- `unused-imports/no-unused-imports`: Detects unused imports
- `import/no-duplicates`: Prevents duplicate imports
- `import/order`: Enforces consistent import ordering

## Benefits

- **Cleaner code:** Removes unnecessary imports
- **Better performance:** Smaller bundle sizes
- **Maintainability:** Consistent import organization
- **Error prevention:** Catches import-related issues early