# Review Scope

Shared scope detection for `/review` and `/deep-review`.

## Determine Scope

1. **IDE selection present** — review only the selected code
2. **Argument provided** — use it:
   - `diff` — uncommitted changes only
   - `branch` — full branch diff against main (including uncommitted)
   - `all` — review the entire codebase (deep-review only)
   - `<commit>` or `<commit>..<commit>` — specific commit(s)
   - `<path>` — specific file or directory
3. **No selection and no argument** — ask the user:

> How should I scope this review?
> 1. **diff** — uncommitted changes
> 2. **branch** — full branch diff against main
> 3. **commit** — last commit (or specify which)
> 4. **path** — specific file or directory (provide the path)

**Auto-detect:** if the user just finished implementation and says "review this", treat as `diff` if there are uncommitted changes.

## Delegation (Claude Code)

**Small scope (inline):** IDE selection, or diff/branch/path with **~200 changed lines or fewer**. Run the review inline.

**Large scope (delegate):** More than **~200 changed lines**, or `all`. Delegate to the `reviewer` agent.

To decide: count changed lines first (e.g., `git diff --stat`), then choose.
