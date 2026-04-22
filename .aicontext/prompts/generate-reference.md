# Generate Reference

Generate internal technical reference documentation for the project. This prompt is called by `generate-docs.md` after config resolution.

## 1. Gather Source Material

**Discover first** — scan the project for existing documentation sources and artifacts. Use whatever exists — AIContext is not required.

Then read in this order (later overrides earlier for conflicts):

1. **Code** (primary source of truth):
   - Entry points, exports, public API surfaces
   - Config schemas and default values
   - Key data structures and types
   - Directory structure and module boundaries
2. **Existing documentation** (context for intent):
   - README, CONTRIBUTING, existing docs/ files
   - AIContext artifacts if present (project.md, specs, config, structure.md)
   - OpenAPI/Swagger specs, ADRs, or other structured docs

Do not read entire large files. Use Grep + targeted Read for specific sections.

## 2. Determine Sections

Adapt the document structure based on what source material exists. Include a section only if there is meaningful content for it. Default structure (skip any that don't apply):

1. **Overview** — what the project does, in 2-3 sentences
2. **Architecture** — how components connect, data flow, key abstractions
3. **Configuration** — all settings, what they do, defaults, valid values
4. **Features** — inventory of what the system does, grouped logically
5. **Key Decisions** — why things are the way they are (from specs)
6. **Data Model** — schemas, types, relationships (if applicable)
7. **Integration Points** — external services, APIs, dependencies (if applicable)
8. **Development** — how to run, test, deploy (from structure.md + code)

## 3. Write the Document

Write to `{output_path}/reference.md` (output_path from config).

Rules:
- Write for a developer joining the team — enough context to understand without reading every file
- Be factual and specific — no filler, no speculation
- Include code references (`file:line`) for key items so readers can dig deeper
- Use the project's actual terminology, not generic terms
- If existing `reference.md` exists, read it first — regenerate completely but preserve any sections that code/artifacts can't inform (mark them with `<!-- manual -->` comment)

## 4. Output

After writing:

```
Generated: {output_path}/reference.md
Sections: {list of sections included}
Skipped: {list of default sections omitted and why}
```
