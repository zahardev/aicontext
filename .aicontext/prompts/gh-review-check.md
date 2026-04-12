# GitHub Review Check

Fetch and triage unresolved PR review comments on the current pull request.

## 1. Fetch

Run `node .aicontext/scripts/pr-reviews.cjs`. It saves a structured file to `.aicontext/data/github-pr-reviews/pr-{number}-{iteration}.md` with a summary table and full comment details.

If the command fails (no PR, `gh` CLI missing, etc.), tell the user and stop.

## 2. Analyze

Read the generated file. For each finding, evaluate whether it's valid against the actual code.

## 3. Report

Present findings grouped by validity, referencing each by its `#` from the table:

- **Valid** — real issues worth fixing
- **False positive** — explain why
- **Low priority** — valid but not worth addressing now

Ask the user to confirm the triage before proceeding.

## 4. Fill actions

Update the Action and Reply columns in the file:

| Action | When |
|--------|------|
| `resolve` | False positives and bot noise — dismiss on GitHub |
| `fix` | Real issues to address in code |
| `skip` | **Human reviewer only** — waiting for their response. Never use for automated bot reviews (CodeRabbit etc.); those are `resolve` or `fix`. |

**Reply column** — fill for every `resolve` and `fix`. The reply is posted to the PR thread before resolving. Keep it concise: why it's a false positive, or what was fixed.

## 5. Resolve

If any `resolve` actions exist, ask:

> Run `pr-resolve.cjs` now to dismiss the `resolve` threads on GitHub?
> 1. Yes — run it
> 2. Not now — skip

On yes, run `node .aicontext/scripts/pr-resolve.cjs <path-to-review-file>`.

---

After completion: `Review triage complete. Next: /commit to commit any fixes you made, or address the fix actions first.`
