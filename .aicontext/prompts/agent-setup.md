# Agent Setup

## Files to read at startup

All paths are under `.aicontext/`. `local.md` is gitignored — skip silently if missing.

| Agent | Files |
|-------|-------|
| reviewer | `rules/standards.md` + caller's review playbook; add `project.md` when reviewing architecture/conventions |
| researcher | `rules/standards.md`, `project.md`, `structure.md` |
| test-runner | `rules/standards.md`, `structure.md`, `local.md` |
| test-writer | `rules/standards.md`, `project.md`, `structure.md`; existing tests in the same directory |

## Output Discipline

Reply with a summary, not a dump. Save full detail to the path defined in your agent definition; return only the saved path, summary counts, an optional role-defined top-N of the most critical items (e.g. test-runner's top-5 failures), and a 1–2 sentence assessment.

Caller instructions describing a verbose output format describe the *saved file*, not your reply. "Be thorough" means investigation depth, not response format — the reply stays terse regardless.
