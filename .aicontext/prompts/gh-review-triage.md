# GitHub Review Triage

## Triage

Evaluate each unresolved thread in the review file against the actual code, then set its Action in the file's table:
- `fix`: actionable issue with a clear code change.
- `resolve`: false positive, irrelevant, or already addressed; explain why.
- `skip`: needs human judgment; leave open. Never for automated bot threads.

Fill the Reply column for `fix` and `resolve` rows. For `skip` rows, fill Reply only to answer the reviewer, and not when your earlier reply (marked `(you)`) still awaits their response.

## Resolve

Run `node .aicontext/scripts/pr-resolve.cjs "$review_file"`; it posts replies, resolves `resolve` rows, leaves `skip` rows open, and marks processed rows so a rerun skips them. Inspect reply/resolution results and re-fetch threads; the script can report partial failures with exit code zero.
