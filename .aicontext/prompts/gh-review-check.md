# PR Review Check

Check unresolved review comments on the current pull request.

## 1. Fetch reviews

Run `node .aicontext/scripts/pr-reviews.js` to fetch unresolved PR review comments.

This saves a structured markdown file to `.aicontext/data/github-pr-reviews/pr-{number}-{iteration}.md` with a summary table and full comment details.

If the command fails (no PR exists, `gh` CLI not installed, etc.), inform the user and stop.

## 2. Read and analyze

Read the generated file. For each finding, evaluate whether it's valid against the actual code.

## 3. Report

Present findings to the user grouped by validity:
- **Valid** — real issues worth fixing
- **False positive** — explain why
- **Low priority** — valid but not worth addressing now

For each finding, reference its `#` from the table.

## 4. Fill actions

After user confirms, update the Action and Reply columns in the file:
- `resolve` — false positives and bot noise to dismiss on GitHub
- `fix` — will address in code
- `skip` — only for human reviewer comments where we are waiting for their response. Never use `skip` for automated CR bot reviews (CodeRabbit, etc.) — those should be either `resolve` or `fix`

**Reply column** — fill for every `resolve` and `fix` action. The reply is posted as a comment on the PR thread before resolving. Keep it concise: why it's a false positive, or what was fixed.

## 5. Resolve

If there are any `resolve` actions, ask the user if they want to run:

```bash
node .aicontext/scripts/pr-resolve.js <path-to-review-file>
```

This resolves all threads marked `resolve` on GitHub.
