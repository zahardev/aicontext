---
name: code-health
description: Scan codebase for refactoring opportunities — duplication, complexity, coupling, testability, consistency. Usage - /code-health [scope]. Scope - a specific path, or "all" (default)
disable-model-invocation: true
---

# Code Health Check

Scan the codebase for practical refactoring opportunities, prioritized by impact.

## 1. Parse Arguments

- **scope** (optional, default: `all`): a specific path or `all`
- When scope is `all`, read `.aicontext/structure.md` to determine the project's source directories and scan them

## 2. Read Project Standards

Before exploring, read `.aicontext/rules/standards.md` to understand the project's KISS, DRY, and over-engineering rules. Findings must respect these — never suggest abstractions that violate project standards.

## 3. Explore

Launch `Explore` agent(s) with thoroughness level "very thorough" to scan the scoped paths. Use parallel agents when scanning multiple top-level directories.

Prompt the Explore agent to find:

**Duplication**
- Repeated code patterns across 3+ files (functions, logic blocks, UI patterns)
- Copy-pasted components with minor variations
- Identical patterns that could share a utility

**Complexity**
- Functions longer than 30-40 lines
- More than 3 levels of nesting
- Files mixing too many concerns
- Files over 300 lines that could be split

**Coupling**
- Components or modules with high fan-out (many imports from siblings)
- Shared mutable state patterns
- Circular or bidirectional dependencies
- Hardcoded values that should be constants or config

**Testability**
- Untested files or directories (compare source files against test files)
- Code that's hard to test in isolation
- Logic buried inside UI or framework layers that could be extracted

**Consistency**
- Mixed patterns for the same thing across similar files
- Inconsistent naming conventions
- Different error handling strategies across similar code

## 4. Filter

Review findings against project standards:
- Remove suggestions that would violate KISS (creating abstractions for one-time operations)
- Remove suggestions that are premature (3 similar lines is fine, don't suggest abstraction)
- Keep findings that represent genuine friction, bugs, or scaling risk

## 5. Prioritize and Present

Present a numbered list, sorted by impact (high to low). For each finding:

```
### N. [category] Short title

**Files:** list of affected files (with line numbers if relevant)
**Impact:** High/Medium/Low — why this matters
**Effort:** Small/Medium/Large — rough size of the fix
**What:** 1-2 sentence description of the problem
**Why fix:** What improves — readability, bug risk, reusability, scalability
```

Categories: `[duplication]`, `[complexity]`, `[coupling]`, `[testability]`, `[consistency]`

## 6. Ask User

After presenting findings, ask:
> "Which of these would you like me to create as GitHub issue? (e.g., '1, 3, 5' or 'all')"

For selected items, use the `/draft-issue` skill to create issue drafts.
