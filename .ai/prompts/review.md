# Code Review

As a senior developer, review the implementation:

## 1. Gather Context

Run these commands:
```bash
git status
git diff --stat
git diff
```

Read the current task file in `.ai/tasks/`.

## 2. Evaluate

| Criteria | Check |
|----------|-------|
| Requirements | All task requirements implemented? |
| Tests | Tests cover the new functionality? |
| DRY | No unnecessary duplication? |
| KISS | Simplest solution that works? |
| Security | No vulnerabilities introduced? |
| Over-engineering | No unnecessary abstractions? |

## 3. Report

For each issue found:
- **File:line** - Location
- **Issue** - What's wrong
- **Fix** - How to resolve

If no issues: confirm "Implementation looks good" with a brief summary.
