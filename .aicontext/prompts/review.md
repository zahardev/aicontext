# Review

Review code changes for bugs, security issues, edge cases, and logical errors. Architecture and design are handled by `/deep-review`, not this review.

## Setup

Read these files to understand the project:
- `.aicontext/project.md` — architecture, API contracts, tech stack
- `.aicontext/local.md` — local environment specifics (if exists)
- Current task file in `.aicontext/tasks/` — requirements and planned work

## Scope

Follow `.aicontext/prompts/review-scope.md` to determine the review scope.

## Review

Follow `.aicontext/prompts/review-criteria.md` for what to check and how to present findings.

## Save

Save review results to `.aicontext/data/code-reviews/YYYY-MM-DD-review-{short-description}.md` using the template at `.aicontext/templates/code-review.template.md`.

## Present

Evaluate findings and present with your recommendation:
- For each finding: agree or disagree, and whether it's worth fixing now
- Drop findings that are nitpicks or over-engineering
- Group remaining: **fix now** (clear bugs, security issues) vs **skip** (low risk, premature)
- Provide a clear action plan: "I'd fix #1 and #3, skip #2 — want me to proceed?"
- Include the saved review file path so the user can reference it later
