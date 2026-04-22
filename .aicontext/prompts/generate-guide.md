# Generate Guide

Generate user-facing usage documentation for the project. This prompt is called by `generate-docs.md` after config resolution.

## 1. Gather Source Material

**Discover first** — scan the project for existing documentation sources and artifacts. Use whatever exists — AIContext is not required.

Then read in this order. Code always wins on conflicts; docs provide context only.

1. **Code** (primary source of truth):
   - Public API, CLI commands, UI entry points
   - Config files users interact with
   - Input validation and error messages (reveal expected usage)
   - README, CHANGELOG, existing user-facing docs
2. **Existing documentation** (context for intent, not authority):
   - README, CONTRIBUTING, existing docs/ files
   - AIContext artifacts if present (project.md, specs, structure.md)
   - OpenAPI/Swagger specs or other structured docs

Do not read entire large files. Use Grep + targeted Read for specific sections.

## 2. Determine Sections

Adapt based on what the project offers to users. Include a section only if there is meaningful content. Default structure (skip any that don't apply):

1. **Introduction** — what the product does and who it's for, in 2-3 sentences
2. **Getting Started** — installation, setup, first use
3. **Usage** — core workflows, commands, or UI flows the user needs
4. **Configuration** — user-facing settings, how to customize
5. **Features** — what the user can do, grouped by workflow
6. **Troubleshooting** — common issues and solutions (from error messages, known gotchas)
7. **FAQ** — anticipated questions based on complexity or non-obvious behavior

## 3. Write the Document

Write to `{output_path}/guide.md` (output_path from config).

Rules:
- Write for the end user, not the developer — no internal jargon, no code references unless the product is a developer tool
- Task-oriented: "how do I do X" structure, not "here is component Y"
- Include concrete examples (commands, config snippets, expected output)
- Be honest about gaps — if something can't be determined from code, add a `<!-- TODO: describe X -->` placeholder
- If existing `guide.md` exists, read it first — regenerate completely but preserve `<!-- manual -->` sections

## 4. Output

After writing:

```
Generated: {output_path}/guide.md
Sections: {list of sections included}
TODOs: {count of placeholder items that need manual input}
```
