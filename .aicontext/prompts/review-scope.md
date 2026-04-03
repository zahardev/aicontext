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
> 5. **all** — entire codebase (deep-review only)

**Auto-detect:** if the user just finished implementation and says "review this", treat as `diff` if there are uncommitted changes.
