# Domain documentation

This application uses a single context: a root `GLOSSARY.md` for domain vocabulary and `docs/adr/` for architectural decisions.

Before exploring a domain, read the glossary if present and ADRs relevant to the work. Use the glossary's canonical terms in specs, tickets, tests, and explanations. Surface conflicts with an ADR instead of silently overriding the decision.

Missing domain documents do not block exploration. Create the glossary only when a project-specific term has been resolved, and create ADRs when a consequential architectural trade-off needs recording. General programming terms and implementation details do not belong in the glossary.

The root `DESIGN.md` describes visual and interaction direction; it is separate from domain vocabulary and ADRs. Read it for UI work.
