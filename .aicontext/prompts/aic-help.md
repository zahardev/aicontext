# AIContext Quick Start

Present this guide to the user. Do not summarize or shorten — output it as-is.

---

## What is AIContext?

AIContext gives AI coding assistants persistent memory about your project. It creates standardized context files — rules, prompts, templates, specs, tasks — that work across Claude Code, Codex, Cursor, and GitHub Copilot. Designed Claude-first — for best experience, use Claude Code in an IDE (VS Code, JetBrains, etc.).

Install: `npx @zahardev/aicontext init`

## Your First Session

**Always begin a session with `/start`.** It loads your project's rules and confirms the AI is ready — without it, the AI has no project context.

For a new feature, the full flow is:

`/start` → `/start-feature` → `/run-task` → `/finish-task`

Skills are invoked as `/skill-name` in Claude Code. In Codex, Cursor, and Copilot, use `use skill-name` instead. Run `/aic-skills` (or `use aic-skills`) any time to see all available commands.

## Key Concepts

AI assistants forget everything between sessions. AIContext fixes this with four persistent documents — so you pick up exactly where you left off.

| Concept | What | Where |
|---------|------|-------|
| **Spec** | Requirements, decisions, non-goals — the "what" and "why" | `.aicontext/specs/` |
| **Task** | Plan steps, progress, completion notes — the "how" | `.aicontext/tasks/` |
| **Task-Context** | Accumulated technical knowledge across steps — session handoff | `.aicontext/data/task-context/` |
| **Worklog** | Spec and task status tracking | `.aicontext/worklog.md` |

**Specs** and **Tasks** are committed to the repo — they're your project's decision history. **Task-context** files are gitignored working memory for the AI, not for you — remove them once the feature is done.

## More Workflows

**Resume mid-task (new session):**
`/start` → `/check-task` → `/run-task` → `/finish-task`

**Quick fix (no spec needed):**
Describe the fix in conversation → `/do-it` — creates a task step and implements it.

**Review changes:**
`/review` — quick correctness scan (bugs, security, edge cases). 
`/deep-review` — comprehensive architectural review.

**PR review cycle:**
`/gh-review-check` — one-time fetch and triage of PR review comments. 
`/gh-review-fix-loop` — full automated cycle: fetch, triage, fix, push, repeat until clean.

**Multiple tasks from one spec:**
`/start-feature` (creates spec) → `/plan-tasks` (breaks spec into tasks) → `/run-task` per task

## Tips

- **Don't restart sessions unnecessarily.** The agent accumulates context across steps — restarting loses that. Use `/check-task` when you must restart.

## Customization

| What | Where |
|------|-------|
| Process rules (TDD, quality checks) | `.aicontext/rules/process.md` |
| Coding standards | `.aicontext/rules/standards.md` |
| Project overview | `.aicontext/project.md` |
| Commit rules, task naming, config | `.aicontext/config.yml` |
| Personal config overrides | `.aicontext/config.local.yml` (gitignored) |
| Personal/local prose overrides | `.aicontext/local.md` (gitignored) |
| Release config | `.aicontext/release.md` |

## Learn More

- `docs/skills.md` — full skill reference with descriptions
- `docs/workflow.md` — detailed workflow guide
- `docs/development-model.md` — how the spec/task/task-context model works

---
