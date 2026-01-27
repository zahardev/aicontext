# Code Review

As a senior developer, review the implementation:

## 1. Gather Context
- Read the current task file in `.aicontext/tasks/`.
- Review the recent changes (git diff) against the task requirements.

## 2. Evaluate

| Criteria | Check |
|----------|-------|
| Requirements | All task requirements implemented? |
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
Save results to `.aicontext/data/reviews`
