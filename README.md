# AI Context Framework

**Tired of explaining your project to AI assistants over and over again?**

AIContext gives your AI coding assistants persistent memory about your project — your tech stack, coding standards, folder structure, and workflows. Set it up once, and every AI session starts with full context.

**Works with any language or framework** — PHP, Python, JavaScript, TypeScript, Rust, Go, and more. Includes detection prompts for Laravel, WordPress, Django, Next.js, NestJS, Flutter, and other popular frameworks.

**Supports multiple AI tools** — Claude Code, Cursor, and GitHub Copilot.

## Supported AI Tools

| Tool | Entry Point | Format |
|------|-------------|--------|
| Claude Code | `.claude/CLAUDE.md` | Markdown |
| Cursor | `.cursor/rules/*.mdc` | MDC (Markdown + YAML) |
| GitHub Copilot | `.github/copilot-instructions.md` | Markdown |

## Requirements

- Node.js 18.0.0 or higher (for npm install only — not needed for [manual copy](#option-c-manual-copy))

## Installation

### Option A: Global Install (Recommended)

```bash
npm install -g @zahardev/aicontext
cd /path/to/your-project
aicontext init
```

### Option B: npx (One-time use)

```bash
cd /path/to/your-project
npx @zahardev/aicontext init
```

You can also specify the project path explicitly: `aicontext init /path/to/your-project`

**Note:** If `.claude/`, `.cursor/`, or `.aicontext/` already exist, you'll be prompted before overwriting. If you use git, uncommitted changes can be reverted with `git checkout`.

### Option C: Manual Copy

If you prefer not to use npm, clone the [GitHub repository](https://github.com/zahardev/aicontext) and copy the needed files:

```bash
# Clone to a temporary location
git clone https://github.com/zahardev/aicontext.git /tmp/aicontext

# Copy needed files to your project
cd /path/to/your-project
cp -r /tmp/aicontext/.aicontext .

# Copy entry points for your AI tool(s) — pick what you use:
cp -r /tmp/aicontext/.claude .   # Claude Code
cp -r /tmp/aicontext/.cursor .   # Cursor
cp -r /tmp/aicontext/.github .   # GitHub Copilot

# Clean up
rm -rf /tmp/aicontext
```

### What `aicontext init` Creates

The command creates the following in your project:

| Path | Purpose |
|------|---------|
| `.aicontext/` | Framework files (rules, prompts, templates) |
| `.claude/CLAUDE.md` | Entry point for Claude Code |
| `.cursor/rules/` | Entry point for Cursor |
| `.github/copilot-instructions.md` | Entry point for GitHub Copilot |

## Generate Project Context

1. Open your AI assistant (Claude Code, Cursor, etc.)
2. Start a conversation with `.aicontext/prompts/start.md` prompt
3. On first run, the AI will analyze your codebase and generate:
   - `.aicontext/project.md` - Project overview, tech stack, architecture
   - `.aicontext/structure.md` - Commands, folder structure, environment

These files give your AI assistant "memory" about your project. Once generated, future sessions start with full context automatically.

## Structure

```
.aicontext/
├── rules/
│   ├── process.md      # Task management, TDD workflow
│   └── standards.md    # Coding standards, safety rules
├── prompts/
│   ├── generate.md     # Generate project context (auto-runs if project.md missing)
│   ├── start.md        # Start a session
│   ├── check_task.md   # Before starting a task
│   ├── check_plan.md   # Review implementation plan
│   └── review.md       # Code review
├── templates/
│   ├── project.template.md
│   ├── structure.template.md
│   └── task.template.md
├── examples/           # Example configs (GitHub repo only)
│   ├── laravel-api/
│   ├── wordpress-plugin/
│   ├── web-api/
│   └── cli-tool/
├── tasks/              # Task tracking files
├── data/               # Screenshots, specs, reference files
├── project.md          # [Generated] Project-specific
├── structure.md        # [Generated] Project-specific
├── changelog.md        # Task completion history
├── local.md            # Personal settings (gitignored)
└── readme.md           # Framework documentation
```

Example configurations are available in the [GitHub repository](https://github.com/zahardev/aicontext/tree/main/.aicontext/examples).

## Workflow

### Starting a Session

1. Paste contents of `.aicontext/prompts/start.md`
2. AI reads rules and confirms readiness

### Working on a Task

1. Paste contents of `.aicontext/prompts/check_task.md`
2. AI analyzes the task and asks clarifying questions
3. Implement with AI assistance
4. Update `.aicontext/changelog.md` when complete

### Code Review

1. Paste contents of `.aicontext/prompts/review.md`
2. AI reviews changes against task requirements

## Updating the Framework

```bash
aicontext update
```

Or check your current version:

```bash
aicontext version
```

To upgrade the aicontext CLI tool itself:

```bash
aicontext upgrade
```

Or upgrade to a specific version:

```bash
aicontext upgrade 1.2.0
```

### What `aicontext update` Does

Updates framework files (rules, prompts, templates, tool entry points) while preserving your project-specific files:

| Updated | Preserved |
|---------|-----------|
| `.aicontext/rules/` | `.aicontext/project.md` |
| `.aicontext/prompts/` | `.aicontext/structure.md` |
| `.aicontext/templates/` | `.aicontext/changelog.md` |
| `.claude/`, `.cursor/`, `.github/` | `.aicontext/local.md` |

## Customization

### Adding Your Own Rules

- **Team rules**: Add to `.aicontext/project.md` — works across all AI tools
- **Personal rules**: Add to `.aicontext/local.md` — gitignored, see `.aicontext/readme.md` for setup notes

For large or domain-specific rule sets, create separate files in `.aicontext/rules` and reference them from `project.md` or `local.md` files.

### Removing Unused Tools

Not using all AI tools? You can safely delete:
- `.cursor/` — if not using Cursor
- `.github/copilot-instructions.md` — if not using GitHub Copilot
- `.claude/` — if not using Claude Code

## Version History

See [CHANGELOG.md](CHANGELOG.md) for release notes.

## License

MIT
