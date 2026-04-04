Draft a GitHub issue based on the current conversation context.

## 1. Gather Context

- Review the current conversation for requirements, decisions, and feature details discussed with the user
- Check `.aicontext/project.md` for project context if not already covered in the conversation
- Optionally, ask the user if there are any additional details or requirements to include in the issue

## 2. Draft the Issue

**Title** — one line, under 70 characters, imperative mood (e.g. "Add mobile app with React Native")

**Body** — use this structure:

```
## Summary
<1-2 sentences describing the feature/bug/task and its motivation>

## Requirements
- <bullet points of specific requirements and decisions made>

## Out of Scope
- <things explicitly excluded or deferred>

## Technical Notes
- <relevant technical context, architecture decisions, dependencies>
```

Keep it factual — describe what and why, not how to implement.

## 3. Save

Save the draft to `.aicontext/data/issue-drafts/` using a descriptive filename (e.g. `mobile-app-react-native.md`).

**Do not output the issue body in chat.** Just save the file and tell the user the filename. Only show the full content in chat if the user explicitly asks to see it.
