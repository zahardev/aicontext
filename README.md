# AI Context Framework

**Tired of explaining your project to AI assistants over and over again?**

AIContext gives your AI coding assistants persistent memory about your project — your tech stack, coding standards, folder structure, and workflows. Set it up once, and every AI session starts with full context.

**Works with any language or framework** — PHP, Python, JavaScript, TypeScript, Rust, Go, and more. Built-in detection for Laravel, WordPress, Django, Next.js, NestJS, Flutter, and other popular frameworks.

**Supports multiple AI tools** — Claude Code, Cursor, and GitHub Copilot.

## Supported AI Tools

| Tool | Entry Point | Format |
|------|-------------|--------|
| Claude Code | `.claude/CLAUDE.md` | Markdown |
| Cursor | `.cursor/rules/*.mdc` | MDC (Markdown + YAML) |
| GitHub Copilot | `.github/copilot-instructions.md` | Markdown |

## Installation

### Option A: Global Install (Recommended)

```bash
npm install -g @zahardev/aicontext
aicontext init
```

### Option B: npx (One-time use)

```bash
npx @zahardev/aicontext init
```

### Option C: Manual Clone

```bash
git clone https://github.com/zahardev/aicontext.git
./aicontext/setup/install.sh /path/to/your-project
rm -rf aicontext
```

## Post-Installation Setup

After installation, generate project-specific files:

1. Open your AI assistant (Claude Code, Cursor, etc.)
2. Paste the contents of `.ai/templates/generate.md`
3. The AI will analyze your codebase and generate:
   - `.ai/project.md` - Project overview
   - `.ai/structure.md` - Commands and folder structure

## Structure

```
.ai/
├── rules/
│   ├── process.md      # Task management, TDD workflow
│   └── standards.md    # Coding standards, safety rules
├── prompts/
│   ├── init.md         # Session initialization
│   ├── check_task.md   # Before starting a task
│   ├── check_plan.md   # Review implementation plan
│   └── review.md       # Code review
├── templates/
│   ├── project.template.md
│   └── structure.template.md
├── examples/           # Example configurations (reference only)
│   ├── laravel-api/    # Laravel REST API
│   ├── wordpress-plugin/  # WordPress plugin
│   ├── web-api/        # Node.js/NestJS API
│   └── cli-tool/       # Rust CLI tool
├── tasks/
│   └── .template.md    # Task file template
├── data/               # Screenshots, specs, reference files
├── project.md          # [Generated] Project-specific
├── structure.md        # [Generated] Project-specific
├── changelog.md        # Task completion history
├── local.md            # Personal settings (gitignored)
└── readme.md           # Framework documentation
```

See [.ai/examples/](.ai/examples/) for complete example configurations.

## Workflow

### Starting a Session

1. Paste contents of `.ai/prompts/init.md`
2. AI reads rules and confirms readiness

### Working on a Task

1. Paste contents of `.ai/prompts/check_task.md`
2. AI analyzes the task and asks clarifying questions
3. Implement with AI assistance
4. Update `.ai/changelog.md` when complete

### Code Review

1. Paste contents of `.ai/prompts/review.md`
2. AI reviews changes against task requirements

## Updating the Framework

```bash
npx @zahardev/aicontext update
```

Or check your current version:

```bash
npx @zahardev/aicontext version
```

This updates the framework files while preserving your `project.md`, `structure.md`, and `changelog.md`.

## Customization

### Project-Specific Rules

Add project-specific rules to:
- `.ai/project.md` - Project overview and safety rules
- `.ai/local.md` - Personal preferences (gitignored)

### Tool-Specific Customization

- **Cursor**: Add more `.mdc` files to `.cursor/rules/`
- **Copilot**: Create `.github/instructions/` for path-specific rules

## Version History

See [CHANGELOG.md](CHANGELOG.md) for release notes.

## License

MIT
