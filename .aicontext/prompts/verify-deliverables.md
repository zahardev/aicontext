# Verify Deliverables

After review and tests, offer a behavioral check for each deliverable with a concrete check in the current environment. If none qualify, stop silently.

## 1. Select checks

Read `## Deliverables:`. For each deliverable that can be checked through a browser flow, CLI command, API call, or state inspection, define one concrete check. Select by observable behavior, not artifact type.

No checks → stop silently.

## 2. Ask

List each check as `[read-only]` or `[writes]`. Follow `## Question UX` in `standards.md`.

> Verification available for {N} deliverable(s). Run these checks?
> {check list}
> 1. Yes — run them
> 2. No — skip

Run nothing before approval.

## 3. Run

Run only approved checks with Bash or the active tool's `web-inspect` invocation. Never read `.env`; ask for required values.

Report each deliverable as pass, fail, or couldn't-verify. Do not report unrun checks as passed.

If a check fails, report it. Add or resume a task step before fixing it, then complete the normal review and test loop.
