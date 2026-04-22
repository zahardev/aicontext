---
name: generate-docs
description: Generate project documentation from code and AIContext artifacts — reference (internal technical), guide (user-facing), or both
---

Read and follow `.aicontext/prompts/generate-docs.md` for steps 1–2 (config + type selection).

For step 3, spawn `docs-generator` subagent(s) instead of following prompts inline:

- **Reference**: spawn `docs-generator` with type `reference`
- **Guide**: spawn `docs-generator` with type `guide`
- **Both**: spawn two `docs-generator` agents in parallel (one per type)

Agent prompt: `Generate {type} documentation. Write to: {output_path}/{filename}. Project root: {project_root}.`

Where `{filename}` is `reference.md` or `guide.md`.

After agent(s) return, relay their summary per step 4.
