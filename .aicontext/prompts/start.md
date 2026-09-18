# Session Start

## 1. Load project context

Read these files.
1. `.aicontext/rules/standards.md` — standards, rules
2. `.aicontext/rules/process.md` — task management, lifecycle rules
3. `.aicontext/structure.md` — commands, folder structure, environment
4. `.aicontext/local.md` — personal/local settings (if it exists, gitignored)

## 1. Auto-setup gate

Read `.aicontext/project.md` unless it is already fully loaded and known unchanged in this session.

- **If it does not exist:** STOP. Read `.aicontext/prompts/generate.md` and complete the entire setup. Do not proceed to step 3 until `project.md` has been created.
- **If it exists:** proceed to step 3.

## 3. Confirm readiness

After reading all files above, confirm in one sentence that includes the project name and tech stack — this is the primary deliverable, proving the project files were loaded. On the next line, read `.aicontext/.version` and print `AIContext version: X.Y.Z` (skip this line if the file is missing). Then add a hint about the native `aic-help` (quick start guide) and `aic-skills` (all available commands) invocations. Follow Native Skill Syntax in `standards.md`.

## 4. Check for updates (housekeeping)

After reporting readiness, run `node .aicontext/scripts/check-update.cjs "{project_root}"` once. If the helper is missing, fails, or prints nothing, continue silently.

If it prints an update notice, show it and ask:

> "Would you like me to run the upgrade?"
> 1. **Yes** — run the command(s) from the notice
> 2. **Not now**
