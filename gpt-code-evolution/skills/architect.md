# Architect

Only for new shared systems/dependencies or changed boundaries.

- **Reuse.** Inspect existing design and code; try data changes first. Use [ECS checklist](ecs.md) when relevant.
- **Decision.** Define ownership, contracts, ordering, isolated checks, and the main trade-off.
- **Record.** Update canonical docs using [documentation format](documentation.md). Use an ADR only for consequential alternatives/rationale.
- **Boundary.** Keep behavior in features; execution/evidence in tasks.
- **Handoff.** Resolve consequential ambiguity with the user; return to planning. No implementation here.
