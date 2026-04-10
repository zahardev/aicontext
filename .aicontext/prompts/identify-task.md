# Identify Task

Determine which task file is active. Stop at the first match.

1. **Explicit reference** — a task file from `.aicontext/tasks/` is pointed to by either:
   - The tool's environment (Claude Code `<ide_opened_file>` reminder, Cursor `@file` reference, Copilot active editor)
   - The user ("run 1.7.0-foo", "add to task X")

   This overrides any task already being worked on in the conversation.
2. **Current conversation** — a task already being worked on in this session
3. **Worklog fallback** — first unchecked task in `.aicontext/worklog.md`

Only ask the user if none of these signals are present or they conflict.
