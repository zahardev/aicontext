---
name: code-health
description: Use when the user wants the codebase scanned for refactoring opportunities such as duplication, complexity, coupling, testability gaps, and inconsistency.
---

# Code Health Check

Scan the codebase for practical refactoring opportunities, prioritized by impact.

## Scope

Accept an optional path argument. When no path is given, read `.aicontext/structure.md` to determine the project's source directories and scan them all.

## Preparation

Read `.aicontext/rules/standards.md` to understand the project's KISS, DRY, and over-engineering rules. Findings must respect these — never suggest abstractions that violate project standards.

## What to Look For

**Duplication** — repeated code patterns across 3+ files, copy-pasted components with minor variations, identical patterns that could share a utility.

**Complexity** — functions longer than 30-40 lines, more than 3 levels of nesting, files mixing too many concerns, files over 300 lines that could be split.

**Coupling** — modules with high fan-out (many imports from siblings), shared mutable state, circular or bidirectional dependencies, hardcoded values that should be constants or config.

**Testability** — untested files or directories, code that is hard to test in isolation, logic buried inside UI or framework layers that could be extracted.

**Consistency** — mixed patterns for the same thing across similar files, inconsistent naming conventions, different error handling strategies across similar code.

## Filter

- Remove suggestions that would violate KISS (abstractions for one-time operations)
- Remove premature suggestions (3 similar lines is fine)
- Keep findings that represent genuine friction, bugs, or scaling risk

## Present

Number each finding, sorted by impact (high to low):

```
### N. [category] Short title

**Files:** affected files with line numbers
**Impact:** High/Medium/Low — why this matters
**Effort:** Small/Medium/Large — rough size of the fix
**What:** 1-2 sentence description
**Why fix:** What improves
```

Categories: `[duplication]`, `[complexity]`, `[coupling]`, `[testability]`, `[consistency]`

## Follow Up

Ask which findings the user wants created as GitHub issues. For selected items, draft issues and save to `.aicontext/data/issue-drafts/`.
