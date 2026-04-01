# Branch Review

Review full branch diff against main, including uncommitted changes.

## Steps

1. Read the current task file in `.aicontext/tasks/` to understand requirements
2. Run `git diff main...HEAD --name-only` and `git diff --name-only` to identify all changed files on this branch
3. Review the changes against the task requirements
4. Present findings to the user
5. Save the review results to `.aicontext/data/code-reviews/`
