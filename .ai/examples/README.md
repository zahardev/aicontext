# Example Configurations

This folder contains example `project.md` and `structure.md` files showing what generated output looks like for different project types.

## Purpose

These examples are **for reference only**. Your actual `project.md` and `structure.md` files should be **generated automatically** by your AI assistant using the `setup/generate.md` prompt.

Use these examples to:
- Understand what information to include
- See the expected format and structure
- Guide the AI if it needs clarification during generation

## Available Examples

| Example | Type | Stack |
|---------|------|-------|
| [laravel-api/](laravel-api/) | REST API | PHP, Laravel, MySQL |
| [wordpress-plugin/](wordpress-plugin/) | WordPress Plugin | PHP, WordPress |
| [web-api/](web-api/) | REST API | Node.js, NestJS, PostgreSQL |
| [cli-tool/](cli-tool/) | CLI Application | Rust, Cargo |

## Generating Your Files

1. Open your AI assistant (Claude Code, Cursor, etc.)
2. Paste the contents of `setup/generate.md`
3. The AI will analyze your codebase and generate the files automatically

## Contributing Examples

To add a new example:

1. Create a folder with a descriptive name (e.g., `python-django/`, `go-api/`)
2. Add `project.md` and `structure.md` files
3. Follow the structure of existing examples
4. Submit a pull request
