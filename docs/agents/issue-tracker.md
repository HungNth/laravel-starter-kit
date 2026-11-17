# Issue tracker: local Markdown

Specs and issues live in this repository under `.scratch/`. Publishing means writing a local Markdown file, with no external issue tracker.

## Conventions

- Each feature has a directory: `.scratch/<feature-slug>/`.
- Its spec is `spec.md` in that directory.
- Each implementation ticket has its own file at `issues/<NN>-<slug>.md`, numbered from `01` with blockers first.
- Each spec or ticket records `Status:` using the [triage vocabulary](triage-labels.md). Delivery approval is recorded separately; a triage label does not authorize implementation.
- Tickets name their parent spec, required behavior, acceptance criteria, testing boundary, demo path, and `Blocked by:` dependencies. A ticket without dependencies says `None`.
- Conversation updates append under `## Comments`.

When fetching an issue, read the referenced file. When publishing approved tickets, write one file per ticket. Work only on tickets whose blockers are complete and whose delivery is approved.

## Wayfinding

For `/wayfinder`, the effort map is `.scratch/<effort>/map.md` and each child ticket is `issues/NN-<slug>.md`. Children record `Type: research`, `prototype`, `grilling`, or `task`; `Status: claimed` or `resolved` describes exploration progress rather than triage. `Blocked by: NN, NN` lists blocking children.

The frontier contains open, unblocked, unclaimed children, ordered by number. Claim before starting. Resolve by appending an answer, recording `Status: resolved`, and adding the answer's gist and link to the map's decisions.
