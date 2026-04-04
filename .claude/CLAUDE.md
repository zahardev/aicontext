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
| Running tests | `test-runner` | After writing or modifying code |
| Drafting tests | `test-writer` | During TDD, to parallelize test writing with implementation |
| Codebase research | `researcher` | Before making changes, to understand existing code |

**Why:** Subagents run with their own context window. Delegating keeps the main conversation focused and avoids consuming tokens on raw file contents, test output, and review details.

**Rules:**
- NEVER perform a review inline when the `reviewer` agent exists — delegate to the agent
- NEVER read large amounts of code into main context for review — delegate to the agent
- Run multiple agents in parallel when tasks are independent (e.g., `reviewer` + `test-runner` after implementation)
- NEVER use `EnterPlanMode` — all planning is done in `.aicontext/tasks/` task files per `process.md`
- NEVER launch a subagent without telling the user first — state which agent and what it will do (e.g., "Asking subagent `test-runner` to execute the full test suite.")
- When invoking an agent, provide only the context it needs (command, directory, files, task requirements). Never specify output format or reporting style — agents have built-in instructions and overriding them causes raw output dumps instead of structured summaries.
- When a skill is invoked via `/command`, its content is provided inline — NEVER read files from `.claude/skills/` directories

**Model defaults:** Agents default to `sonnet`, except `reviewer` which defaults to `opus` for thorough analysis. Free plan users can downgrade all agents to haiku during `aicontext init`.

## Auto-Setup

**Important:** If `.aicontext/project.md` is missing, read `.aicontext/prompts/generate.md` and create the missing files before proceeding.
