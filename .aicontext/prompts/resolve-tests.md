# Resolve Tests

Turn an `after_*.tests` config value into shell commands.

**Input:** `value`, `context` (`step` or `task`), optional `changed_files`.

## 1. Trivial cases

- `false` → return `SKIP`.
- Value contains whitespace, quotes, `/`, or shell metacharacters → return verbatim as a literal command.

## 2. Read the type table

Parse `structure.md`'s `## Testing` `| Type | Full | Affected |` table.

If missing → return `ERROR: no ## Testing type table in structure.md`.

## 3. Parse

Split `value` on `|`. For each segment:

1. Strip trailing `-full` or `-affected` → `scope`. Default scope: `affected` at step, `full` at task. Bare `all` = `all-full`.
2. Remaining base is `all` or a type name.
3. Unknown type → return `ERROR: Unknown type "<name>". Defined: [list]`.

`all` segments → expand to every type in the table with the determined scope.

## 4. Resolve each (type, scope) to a command

**Full:** type's `Full` column verbatim.

**Affected:**

1. Changed-files list: use `changed_files` if passed, else derive:
   - `step` → `git diff --name-only HEAD` + `git ls-files --others --exclude-standard`
   - `task` → `git diff --name-only {base-branch}...HEAD` + working-tree changes
2. Empty list → `SKIP` for this segment.
3. `Affected` column non-empty:
   - Has `{files}` → substitute with space-joined paths
   - No `{files}` → append paths to the command
4. `Affected` column empty (fallback): filter changed files to test-looking paths (`test`, `.spec.`, `test/`, `tests/`), append to `Full` command. Empty filter → `SKIP` for this segment.

## 5. Return

```
COMMANDS:
  <command-1>
  <command-2>
```

Run sequentially. `FAIL` if any fails, `PASS` if all pass.
`SKIP` = no commands. `ERROR` = caller surfaces to user.
