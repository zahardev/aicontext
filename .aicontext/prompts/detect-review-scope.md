# Detect Review Scope

Shared scope detection for `/review` and `/deep-review`. Follow `ensure-config.md` to load `project.base_branch` (default: `main`).

## Scope Options

| Scope | Meaning |
|-------|---------|
| `diff` | Uncommitted changes only |
| `branch` | Full branch diff against `base_branch` (includes uncommitted) |
| `<commit>` / `<commit>..<commit>` | Specific commit or commit range |
| `<path>` | Specific file or directory |
| `all` | Entire codebase — **`/deep-review` only** |

## Detection Order

1. **Code selection provided** (Claude Code `<ide_selection>`, Cursor `@selection`, Copilot editor selection) → review only the selected code
2. **Explicit argument** → use it
3. **"review this" after implementation** → treat as `diff` if there are uncommitted changes
4. **Otherwise** → ask the user to pick from the Scope Options above

## Count Changed Lines

The calling skill uses the count to route: ≤200 lines → direct, >200 → delegate to the `reviewer` agent. Compute with `git diff --shortstat` adapted to the scope (e.g. `git diff --shortstat {base_branch}...HEAD` for `branch`, `git show --shortstat {ref}` for a commit). For a code selection, count the selected lines. `all` skips counting — always large.
