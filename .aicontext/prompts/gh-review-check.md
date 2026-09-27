# GitHub Review Check

## 1. Fetch

Run `node .aicontext/scripts/pr-reviews.cjs`. It saves a structured file to `.aicontext/data/github-pr-reviews/pr-{number}-{iteration}.md` with a summary table and full comment details.

If the command fails (no PR, `gh` CLI missing, etc.), tell the user and stop.

## 2. Triage

Follow "Triage" in `.aicontext/prompts/gh-review-triage.md` on the generated file. Present the triage by `#` and ask the user to confirm before proceeding.

## 3. Resolve

If any `resolve` rows or `skip` rows with a Reply exist, ask:

> Run `pr-resolve.cjs` now to post replies and resolve the `resolve` threads on GitHub?
> 1. Yes — run it
> 2. Not now — skip

On yes, follow "Resolve" in `.aicontext/prompts/gh-review-triage.md`.

---

After completion, append the active tool's `commit` handoff if fixes were made. Otherwise, tell the user to address the fix actions first.
