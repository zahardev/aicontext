# Review

Review code changes for bugs, security issues, edge cases, and logical errors. Architecture and design are handled by `/deep-review`, not this review.

## Setup

Read these files to understand the project:
- `.aicontext/project.md` — architecture, API contracts, tech stack
- `.aicontext/rules/standards.md` — coding standards (if exists)
- `.aicontext/local.md` — local environment specifics (if exists)
- Current task file in `.aicontext/tasks/` — requirements and planned work

## Scope

Follow `.aicontext/prompts/detect-review-scope.md` to determine the review scope.

## Review

Follow `.aicontext/prompts/review-criteria.md` for what to check and how to present findings.

## Triage

Evaluate findings before saving:
- For each finding: assess severity and whether it's worth fixing now
- Drop findings that are nitpicks or over-engineering
- Group remaining: **fix** (clear bugs, security issues) vs **skip** (low risk, premature)

## Save

Save review results to `.aicontext/data/code-reviews/YYYY-MM-DD-review-{short-description}.md` using the template at `.aicontext/templates/code-review.template.md`. The summary table's Recommendation column must reflect your triage (fix / skip).

## Present

- Provide a clear action plan: "Skip #2 (minor). Recommended to fix: #1, #3. Want me to fix them?"
- Include the saved review file path so the user can reference it later
