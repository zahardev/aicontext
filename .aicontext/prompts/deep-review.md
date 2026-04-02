# Deep Review

Comprehensive code review: architecture **and** correctness. Questions design decisions, checks for bugs and security issues, analyzes placement, responsibilities, API design, edge cases, and extensibility.

## Setup

Read these files to understand the project:
- `.aicontext/project.md` — architecture, API contracts, tech stack
- `.aicontext/rules/standards.md` — coding standards (if exists)
- `.aicontext/local.md` — local environment specifics (if exists)
- Current task file in `.aicontext/tasks/` — requirements and planned work

## Scope

Follow `.aicontext/prompts/review-scope.md` to determine the review scope. Deep review also supports `all` as a scope argument (review entire codebase).

## Review

Follow `.aicontext/prompts/deep-review-criteria.md` for the 11-phase review methodology and output format.

## Save

Save review results to `.aicontext/data/code-reviews/YYYY-MM-DD-deep-review-{short-description}.md` using the template at `.aicontext/templates/code-review.template.md`.

## Present

- Present findings as **questions**, not demands
- Lead with Refactoring Actions (grouped by leverage), then Detailed Findings for reference
- One finding per concern — don't bundle
- Do NOT suggest changes to code outside the review scope
- If no significant findings, say so — don't invent issues
- Include the saved review file path so the user can reference it later
