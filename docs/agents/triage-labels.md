# Triage labels

The local tracker uses the default canonical labels without renaming.

| Canonical role    | Local status      | Meaning                                          |
| ----------------- | ----------------- | ------------------------------------------------ |
| `needs-triage`    | `needs-triage`    | A maintainer needs to evaluate the issue.        |
| `needs-info`      | `needs-info`      | More information is required.                    |
| `ready-for-agent` | `ready-for-agent` | The issue is specified for agent implementation. |
| `ready-for-human` | `ready-for-human` | Implementation requires a human.                 |
| `wontfix`         | `wontfix`         | The issue will not be actioned.                  |

Skills apply the matching string to the file's `Status:` field. Triage readiness does not replace the project's delivery approval requirement.
