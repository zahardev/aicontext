# Project Rules

Before starting any session, read the project rules in this order:

1. `.aicontext/rules/process.md` - Task management, TDD process
2. `.aicontext/rules/standards.md` - Coding standards, safety rules, AI behavior
3. `.aicontext/project.md` - Project overview, tech stack, architecture
4. `.aicontext/structure.md` - Commands, folder structure, environment
5. `.aicontext/local.md` - Personal/local settings (MUST read if exists, gitignored)

Files are listed in override order — later files take precedence over earlier ones.

## Agents

When subagents are available, **delegate these tasks instead of performing them inline**:

| Task | Agent | When |
|------|-------|------|
| Code review | `reviewer` | After completing implementation, before presenting to user |
| Standards check | `standards-checker` | After implementation, to verify compliance |
| Running tests | `test-runner` | After writing or modifying code |
| Drafting tests | `test-writer` | During TDD, to parallelize test writing with implementation |
| Codebase research | `researcher` | Before making changes, to understand existing code |
| PR review summary | `pr-review-summarizer` | When a PR has been reviewed and you need a summary |

**Why:** Subagents run with their own context window. Delegating keeps the main conversation focused and avoids consuming tokens on raw file contents, test output, and review details.

**Rules:**
- NEVER perform a review or standards check inline when the corresponding agent exists
- NEVER read large amounts of code into main context for review — delegate to the agent
- Run multiple agents in parallel when tasks are independent (e.g., `reviewer` + `standards-checker` + `test-runner` after implementation)
- NEVER use `EnterPlanMode` or the `Plan` subagent — all planning is done in `.aicontext/tasks/` task files per `process.md`
- **Transparency:** Always tell the user when launching a subagent — state which agent and what it will do (e.g., "Asking subagent `test-runner` to execute the full test suite.")

**Model defaults:** All agents default to `haiku`. For higher-quality output, consider upgrading in `.claude/agents/*.md`: `reviewer` → opus, `test-writer` → sonnet. The `generate.md` prompt will ask about model preferences during project setup.

## Auto-Setup

**Important:** If `.aicontext/project.md` is missing, read `.aicontext/prompts/generate.md` and create the missing files before proceeding.
