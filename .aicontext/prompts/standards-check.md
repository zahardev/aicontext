# Standards Check

Check all changed files on the current branch (vs main, including uncommitted) against project coding standards.

## Setup

First, read these files to understand the rules:
- `.aicontext/rules/standards.md` — Coding standards and safety rules
- `.aicontext/rules/process.md` — Process rules and TDD workflow
- `.aicontext/project.md` — Project conventions and architecture

## What to Check

1. **DRY** — Repeated code that should be extracted (3+ occurrences)
2. **KISS** — Functions over 30-40 lines, more than 3 levels of nesting, more than 3 parameters
3. **Documentation** — Descriptive names, no generic descriptions ("Get data")
4. **Over-engineering** — Unnecessary abstractions, error handling for impossible scenarios, premature generalization
5. **Security** — Command injection, XSS, SQL injection, OWASP top 10
6. **Project conventions** — Does the code follow patterns established in existing codebase

## Rules

- Only report actual violations, not style preferences
- Include file path and line number for each violation
- Suggest a fix for each violation

## Output Format

```text
## Result: [CLEAN / X violations found]

### Violation 1: [Rule violated]
- File: path/to/file:L42
- Issue: [what's wrong]
- Fix: [how to fix it]

### Violation 2: ...
```

If no violations found, return only: `## Result: CLEAN`
