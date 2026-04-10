# Deep Review

Comprehensive code review across architecture, correctness, and codebase health.

## Setup

Read these files to understand the project:
- `.aicontext/project.md` — architecture, API contracts, tech stack
- `.aicontext/rules/standards.md` — coding standards
- `.aicontext/local.md` — local environment specifics (if exists)
- Current task file in `.aicontext/tasks/` — requirements and planned work

## Scope

Follow `.aicontext/prompts/detect-review-scope.md` to determine the review scope. Deep review also supports `all` as a scope argument (review entire codebase).

## Review

Follow `.aicontext/prompts/deep-review-criteria.md` for the 12-phase review methodology and output format.

## Recommend

Triage your own findings. For each one, assess severity and effort, then give your recommendation:

- **Skip** — false positives, nitpicks, or low-severity issues that require high effort
- **Recommended to fix** — real issues worth addressing now, plus low-effort improvements that make the code cleaner

## Save

Save review results to `.aicontext/data/code-reviews/YYYY-MM-DD-deep-review-{short-description}.md` using the template at `.aicontext/templates/code-review.template.md`. The summary table's Recommendation column must reflect your triage (fix / skip).

## Present

- Present findings as **questions**, not demands
- Lead with Refactoring Actions (grouped by leverage), then Detailed Findings for reference
- One finding per concern — don't bundle
- Do NOT suggest changes to code outside the review scope
- If no significant findings, say so — don't invent issues
- Include the saved review file path
- Present a clear summary: "Skip #1, #2 (false positive / minor). Recommended to fix: #3, #5, #7." with brief reasoning for each skip.

Then offer actionable next steps based on scope:

- **`all` scope**: "Want to create GitHub issues from the recommended items? (e.g., '3, 5, 7' or 'all')" — for each selected, use `/draft-issue`.
- **Other scopes**: "Want me to fix the recommended items? (e.g., '3, 5' or 'all')"
