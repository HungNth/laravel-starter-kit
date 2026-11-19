# GitHub Issues

Specs and tickets live in GitHub Issues for `HungNth/laravel-starter-kit`. Use GitHub CLI 2.94 or newer for native sub-issues and dependencies.

The `origin` remote uses an SSH host alias. Set the repo explicitly in each PowerShell session that uses `gh`:

```powershell
$env:GH_REPO = 'github.com/HungNth/laravel-starter-kit'
gh repo view --json nameWithOwner,hasIssuesEnabled
```

Before publishing, confirm the command returns `HungNth/laravel-starter-kit` with `hasIssuesEnabled` set to `true`.

## Conventions

- **Publish.** Create one issue per spec or ticket with `gh issue create --title "..." --body-file <file>`. Use the [triage labels](triage-labels.md) when the skill calls for one. Publish approved tickets in dependency order. Include required behavior, acceptance criteria, the testing seam, and the demo path in each ticket.
- **Link.** Create a ticket with `--parent <spec>` and, when it has blockers, `--blocked-by <numbers>`. To link existing issues, use `gh issue edit <spec> --add-sub-issue <ticket>` and `gh issue edit <ticket> --add-blocked-by <blocker>`.
- **Read.** Use `gh issue view <number> --json number,title,body,labels,comments,state` or list issues with `gh issue list --state open --json number,title,body,labels,comments`, adding `--label` and adjusting `--limit` as needed.
- **Start.** Require delivery approval and all blockers to be closed. Check blockers with `gh api --paginate 'repos/{owner}/{repo}/issues/<number>/dependencies/blocked_by'` and inspect their `state` values.
- **Update.** Use `gh issue comment <number> --body-file <file>` for updates and `gh issue edit <number> --add-label <label>` or `--remove-label <label>` for triage. Post the resolution before running `gh issue close <number>`.

## Pull requests as a triage surface

**PRs as a request surface: no.**

When enabled, list open PRs with `gh api --paginate 'repos/{owner}/{repo}/pulls?state=open'` and filter out author associations `OWNER`, `MEMBER`, and `COLLABORATOR`. Read the body with `gh pr view`, comments with `gh pr view --comments`, and changes with `gh pr diff`. Use `gh pr comment`, `gh pr edit`, and `gh pr close` for updates. With PR triage enabled, check a bare `#number` with `gh pr view` before `gh issue view`.

## Wayfinding operations

- **Map.** Create one issue labeled `wayfinder:map` for the notes, decisions, and open questions.
- **Child.** Create a sub-issue labeled `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`, or `wayfinder:task`. Use native dependencies between children. Create missing `wayfinder:` labels with `gh label create` before applying them.
- **Frontier.** Read children in map order with `gh api --paginate 'repos/{owner}/{repo}/issues/<map>/sub_issues'`. Pick the first open child with no assignee and no open blockers.
- **Claim.** Use `gh issue edit <child> --add-assignee @me` before starting.
- **Resolve.** Comment with the answer, close the child, and add the decision and issue link to the map body with `gh issue edit <map> --body-file <file>`.
