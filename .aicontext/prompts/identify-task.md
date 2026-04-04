# Identify Task

Determine which task file is active. Stop at the first match.

1. **IDE-opened task file** — if a task file from `.aicontext/tasks/` is open in the IDE, that's the task. This overrides any task you've been working on in the conversation.
2. **Explicit reference** — user names a task or says "add to X"
3. **Current conversation** — a task already being worked on in this session
4. **Worklog fallback** — first unchecked task in `.aicontext/worklog.md`

Only ask the user if none of these signals are present or they conflict.
