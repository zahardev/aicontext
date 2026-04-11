# Session Start

## 1. Auto-setup gate

Read `.aicontext/project.md`.

- **If it does not exist:** STOP. Read `.aicontext/prompts/generate.md` and complete the entire setup. Do not proceed to step 2 until `project.md` has been created.
- **If it exists:** proceed to step 2.

## 2. Load project context

Read these files (later files override earlier ones). Do not batch these with the step 1 read — step 1 must resolve first.

1. `.aicontext/rules/process.md` — task management, TDD process
2. `.aicontext/rules/standards.md` — coding standards, safety rules, AI behavior
3. `.aicontext/structure.md` — commands, folder structure, environment
4. `.aicontext/local.md` — personal/local settings (if it exists, gitignored)

## 3. Confirm readiness

After reading all files above, confirm in one sentence that includes the project name and tech stack — this is the primary deliverable, proving the project files were loaded. Then add a hint about `/aic-help` (quick start guide) and `/aic-skills` (all available commands). Use `/command` syntax for Claude Code, `use command` for other tools.

## 4. Check for updates (housekeeping)

Follow `check-update.md`. This is background housekeeping — not the main task. This step produces output only when an update is available.
