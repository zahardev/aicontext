# AIContext Quick Start

Present this guide to the user. Do not summarize or shorten — output it as-is.

---

## What is AIContext?

AIContext gives AI coding assistants persistent memory about your project. It creates standardized context files — rules, prompts, templates, specs, tasks — that work across Claude Code, Codex, Cursor, and GitHub Copilot. Designed Claude-first — for best experience, use Claude Code in an IDE (VS Code, JetBrains, etc.).

Install: `npx @zahardev/aicontext init`

## After Init

`aicontext init` creates:
- `.aicontext/` — rules, prompts, templates that give the AI context about your project
- `.claude/`, `.codex/`, `.cursor/`, `.github/` — entry points for each AI tool

- Run `/aic-skills` (Claude Code) or `use aic-skills` (Codex, Cursor, Copilot) to see all available commands

## Key Concepts

AI assistants forget everything between sessions. AIContext fixes this with four persistent documents that capture your decisions, track progress, and carry context forward — so the next session picks up exactly where you left off.

| Concept | What | Where |
|---------|------|-------|
| **Spec** | Requirements, decisions, non-goals — the "what" and "why" | `.aicontext/specs/` |
| **Task** | Plan steps, progress, completion notes — the "how" | `.aicontext/tasks/` |
| **Brief** | Accumulated technical knowledge across steps — session handoff | `.aicontext/data/brief/` |
| **Worklog** | Spec and task status tracking | `.aicontext/worklog.md` |

**Specs** and **Tasks** are committed to the repo — they're your project's decision history. **Briefs** are gitignored working memory for the AI, not for you — remove them once the feature is done.

## Running Skills

In Claude Code, skills are invoked as `/skill-name`. In Codex, Cursor, and Copilot, use `use skill-name` instead. 

Run `/aic-skills` ( or `use aic-skills` ) to see all available commands.

## Typical Workflows

**New feature (first session or any session):**
If this is your first time, follow this flow — it guides you through everything.
`/start` → `/start-feature` → `/run-steps` → `/finish-task`
(`/start` loads project rules and confirms readiness — run it at the beginning of every session.)

**Resume mid-task (new session):**
`/start` → `/check-task` → `/run-steps` → `/finish-task`

**Quick fix (no spec needed):**
Describe the fix in conversation → `/do-it` — creates a task step and implements it.

**Review changes:**
`/review` — quick correctness scan (bugs, security, edge cases). 
`/deep-review` — comprehensive architectural review.

**PR review cycle:**
`/gh-review-check` — one-time fetch and triage of PR review comments. 
`/gh-review-fix-loop` — full automated cycle: fetch, triage, fix, push, repeat until clean.

**Multiple tasks from one spec:**
`/start-feature` (creates spec) → `/plan-tasks` (breaks spec into tasks) → `/run-steps` per task

## Tips

- **Configure commits once.** Set `commit_mode` and `finish_action` in `.aicontext/project.md` so skills handle git automatically.
- **Don't restart sessions unnecessarily.** The agent accumulates context across steps — restarting loses that. Use `/check-task` when you must restart.

## Customization

| What | Where |
|------|-------|
| Process rules (TDD, quality checks) | `.aicontext/rules/process.md` |
| Coding standards | `.aicontext/rules/standards.md` |
| Project overview, commit rules | `.aicontext/project.md` |
| Personal/local overrides | `.aicontext/local.md` (gitignored) |
| Release config | `.aicontext/release.md` |

## Learn More

- `docs/skills.md` — full skill reference with descriptions
- `docs/workflow.md` — detailed workflow guide
- `docs/development-model.md` — how the spec/task/brief model works

---
