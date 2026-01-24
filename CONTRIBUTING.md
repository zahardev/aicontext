# Contributing to AIContext

Thank you for your interest in contributing to AIContext. This document provides guidelines for contributions.

## Ways to Contribute

### 1. Report Issues

- Use GitHub Issues for bugs, feature requests, or questions
- Search existing issues before creating a new one
- Provide clear reproduction steps for bugs

### 2. Improve Documentation

- Fix typos or unclear wording
- Add examples for different project types
- Translate documentation

### 3. Add Examples

Add example configurations for different tech stacks:

1. Create a folder in `.ai/examples/` (e.g., `python-django/`)
2. Add `project.md` and `structure.md` files
3. Follow the structure of existing examples
4. Update `.ai/examples/README.md`

### 4. Enhance Rules and Prompts

- Propose improvements to `rules/process.md` or `rules/standards.md`
- Add new prompts to `prompts/`
- Improve templates in `templates/`

### 5. Add Tool Support

Add support for new AI coding assistants:

1. Research the tool's configuration format
2. Create the appropriate entry point file
3. Document in README.md

## Pull Request Process

1. **Fork the repository** and create a branch from `main`
2. **Make your changes** with clear, focused commits
3. **Test your changes** by using the framework in a real project
4. **Update documentation** if needed
5. **Submit a pull request** with a clear description

### PR Title Format

Use conventional commit format:

- `feat: add Python/Django example`
- `fix: correct typo in process.md`
- `docs: clarify installation steps`
- `refactor: simplify task template`

### PR Description

Include:
- What changes you made and why
- How you tested the changes
- Any related issues (e.g., "Fixes #123")

## Guidelines

### Content Guidelines

- Keep rules concise and actionable
- Use clear, simple language
- Avoid tool-specific jargon in core rules
- Test prompts with multiple AI assistants when possible

### Style Guidelines

- Use Markdown formatting consistently
- Use tables for structured information
- Keep line lengths reasonable (no hard limit, but aim for readability)
- Use code blocks with language hints

### What We're Looking For

**Good contributions:**
- Rules that improve code quality or safety
- Examples for underrepresented tech stacks
- Clearer documentation
- Bug fixes

**Less likely to be accepted:**
- Highly opinionated rules that don't apply broadly
- Changes that break existing workflows
- Tool-specific rules in core files (put these in tool-specific folders)

## Development Setup

No build process required. To test changes:

1. Clone the repository
2. Copy to a test project
3. Use with your AI assistant
4. Verify the changes work as expected

## Questions?

- Open a GitHub Issue for questions
- Check existing issues and discussions first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
