# AI Context Framework

A universal AI context management framework that works across multiple AI coding assistants.

## Supported Tools

| Tool | Entry Point | Format |
|------|-------------|--------|
| Claude Code | `.claude/CLAUDE.md` | Markdown |
| Cursor | `.cursor/rules/*.mdc` | MDC (Markdown + YAML) |
| GitHub Copilot | `.github/copilot-instructions.md` | Markdown |

## Installation

```bash
git clone https://github.com/YOUR_USERNAME/aicontext.git
```

> Replace `YOUR_USERNAME` with the actual GitHub username/organization.

Then choose one of the following:

### Option A: Install Script (Recommended)

```bash
./aicontext/setup/install.sh /path/to/your-project
```

### Option B: Manual Copy

```bash
cp -r aicontext/.ai your-project/
cp -r aicontext/.claude your-project/
cp -r aicontext/.cursor your-project/
cp -r aicontext/.github your-project/
echo "1.0.0" > your-project/.ai/.version
```

Clean up when done:

```bash
rm -rf aicontext
```

## Post-Installation Setup

After copying the framework, generate project-specific files:

1. Open your AI assistant (Claude Code, Cursor, etc.)
2. Paste the contents of `setup/generate.md`
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
├── examples/           # Example configurations
│   ├── web-api/        # REST API example
│   └── cli-tool/       # CLI tool example
├── tasks/
│   └── .template.md    # Task file template
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

Check your installed version:

```bash
cat .ai/.version
```

Compare with latest release and manually update files as needed.

## Customization

### Project-Specific Rules

Add project-specific rules to:
- `.ai/project.md` - Project overview and safety rules
- `.ai/local.md` - Personal preferences (gitignored)

### Tool-Specific Customization

- **Cursor**: Add more `.mdc` files to `.cursor/rules/`
- **Copilot**: Add path-specific files to `.github/instructions/`

## Version History

See [CHANGELOG.md](CHANGELOG.md) for release notes.

## License

MIT
