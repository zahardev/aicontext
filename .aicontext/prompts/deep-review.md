# Deep Review

Architectural code review that questions **design decisions** — not style (that's `/standards-check`) or bugs (that's `/review`).

## Scope

Follow `.aicontext/prompts/review-scope.md` to determine the review scope. Deep review also supports `all` as a scope argument (review entire codebase).

## Steps

1. Determine scope (per `review-scope.md`)
2. Read project documentation (`.aicontext/project.md`, task file if one exists)
3. **If delegating** (Claude Code, large scope): launch `reviewer` agent with the criteria prompt `.aicontext/prompts/deep-review-criteria.md`, the scope description, and the task file path
4. **If inline** (small scope or non-Claude tools): follow `.aicontext/prompts/deep-review-criteria.md` directly
5. Present findings as: Refactoring Actions (grouped by leverage) first, then Detailed Findings for reference
6. Save review to `.aicontext/data/code-reviews/YYYY-MM-DD-deep-review-{short-description}.md`

## Rules

- Present findings as **questions**, not demands
- Do NOT suggest changes to code outside the review scope
- One finding per concern — don't bundle
- Lead with actions, not findings — Refactoring Actions section comes first
- If no significant findings, say so — don't invent issues
