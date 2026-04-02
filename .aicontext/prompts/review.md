# Review

Review code changes for bugs, security issues, edge cases, and logical errors.

## Scope

Follow `.aicontext/prompts/review-scope.md` to determine the review scope.

## Steps

1. Determine scope (per `review-scope.md`)
2. Read the current task file in `.aicontext/tasks/` to understand requirements
3. **If delegating** (Claude Code, large scope): launch `reviewer` agent with the criteria prompt `.aicontext/prompts/review-criteria.md`, the git diff command, and the task file path
4. **If inline** (small scope or non-Claude tools): follow `.aicontext/prompts/review-criteria.md` directly
5. Evaluate findings and present with your recommendation:
   - For each finding: agree or disagree, and whether it's worth fixing now
   - Drop findings that are nitpicks or over-engineering
   - Group remaining: **fix now** (clear bugs, security issues) vs **skip** (low risk, premature)
   - Provide a clear action plan: "I'd fix #1 and #3, skip #2 — want me to proceed?"
6. Save review results to `.aicontext/data/code-reviews/YYYY-MM-DD-review-{short-description}.md`

## Rules

- Do NOT pass full file contents to the agent — pass the diff command so it reviews only changed lines
- Present findings grouped by severity: Critical > Major > Minor > Positive
- For each finding: file, line, impact, fix
