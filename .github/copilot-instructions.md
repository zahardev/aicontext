# Project Rules

Before starting any session, read the project rules in this order:

1. `.aicontext/rules/process.md` - Task management, TDD process
2. `.aicontext/rules/standards.md` - Coding standards, safety rules, AI behavior
3. `.aicontext/project.md` - Project overview, tech stack, architecture
4. `.aicontext/structure.md` - Commands, folder structure, environment
5. `.aicontext/local.md` - Personal/local settings (optional, gitignored)

Files are listed in override order — later files take precedence over earlier ones.

## Prompts

Reusable prompts are available in `.aicontext/prompts/`. When the user says `use <name>`, read `.aicontext/prompts/<name>.md` and follow the instructions in it. For example, `use check-task` reads and follows `.aicontext/prompts/check-task.md`.

## Auto-Setup

**Important:** If `.aicontext/project.md` is missing, read `.aicontext/prompts/generate.md` and create the missing files before proceeding.
