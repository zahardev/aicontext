# Session Start

## 1. Auto-setup

Follow `auto-setup.md` — if project files are missing, generate them before continuing.

## 2. Load project context

Read these files in order (later files override earlier ones):

1. `.aicontext/rules/process.md` — task management, TDD process
2. `.aicontext/rules/standards.md` — coding standards, safety rules, AI behavior
3. `.aicontext/project.md` — project overview, tech stack, architecture
4. `.aicontext/structure.md` — commands, folder structure, environment
5. `.aicontext/local.md` — personal/local settings (if it exists, gitignored)

## 3. Confirm readiness

After reading all files above, confirm in one sentence that includes the project name and tech stack. This is the primary deliverable — it proves the project files were loaded.

After confirming, add a hint about `/aic-help` (quick start guide) and `/aic-skills` (all available commands). Use `/command` syntax for Claude Code, `use command` for other tools.

## 4. Check for updates (housekeeping)

Follow `update-check.md`. This is background housekeeping — not the main task.
