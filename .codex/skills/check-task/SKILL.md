---
name: check-task
description: Use when the user wants a task file analyzed before implementation so ambiguities, conflicts, and risky assumptions can be surfaced early.
---

# Check Task

Analyze the active task and nearby source code before implementation.

## Workflow

1. Read the current task file. If the active task is unclear, infer it from the open files or recent context.
2. Inspect the source files most directly related to the task.
3. Identify unclear requirements, missing acceptance criteria, or ambiguous language.
4. Note any conflicts with current code structure, existing behavior, or project conventions.
5. Surface assumptions that would materially affect implementation.
6. Ask concise clarifying questions only when a risky ambiguity cannot be resolved from local context.
