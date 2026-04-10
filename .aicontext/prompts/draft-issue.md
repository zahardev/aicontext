# Draft Issue

Draft a GitHub issue based on the current conversation context.

## 1. Gather Context

- Review the current conversation for requirements, decisions, and feature details
- Check `.aicontext/project.md` for project context if not already covered
- Optionally, ask the user for additional details

## 2. Draft the Issue

Use `.aicontext/templates/issue.template.md` as the body structure. Fill in each section.

**Requirements describe behavior, not implementation.**
- Bad: "Add explicit `left: 0; top: 0` to `.button` rule in `file.css`"
- Good: "Play button should be positioned at the container origin"

## 3. Save and Create

Follow `ensure-config.md` to read `issue.save_to_file` and `issue.create_in_github` from config.

### Local file

If `issue.save_to_file` is `true`: save the draft to `.aicontext/data/issue-drafts/` using a descriptive filename (e.g. `mobile-app-react-native.md`). Tell the user the filename — do not output the issue body in chat unless asked.

If `false`: skip file creation.

### GitHub issue

If `issue.create_in_github` is `true`: run `gh issue create --title "{title}" --body "{body without the title line}"` and show the URL.

If `ask`: prompt the user:

> Create this issue on GitHub?
> 1. Yes
> 2. No

If yes:
1. Create the issue via `gh issue create` and show the URL
2. Ask: "Save this as default? (y/N)" — if y, set `issue.create_in_github: true` in `config.yml`
3. If saved as true, follow up: "Still want to save draft files locally? (Y/n)" — if n, set `issue.save_to_file: false` in `config.yml`

If `false`: skip GitHub creation.

### After GitHub creation

When an issue is created, note the issue number (e.g. `#42`) in your reply. Downstream prompts like `create-task.md` check the conversation for this number to auto-fill `{issue_id}` in `task_naming.pattern`.
