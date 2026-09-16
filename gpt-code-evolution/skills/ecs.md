# ECS checklist

For ECS components, queries, systems, or presentation integration.

[System map](../doc/ecs-systems.md) · [Patterns](../doc/ecs-patterns.md)

## Plan

- **Reuse.** Try archetypes/defaults/initialization values, component combinations, then justified tags before new systems. Distinguish data changes from [behavior/visualization changes](../doc/feature-types.md).
- **Responsibility.** One policy per system; one named operation per function. Multiple loops alone do not justify more systems.
- **Contract.** Inspect query, reads/writes, effects, lifetime, and ordering. Document only non-obvious rationale.

## Implementation

- **Independence.** Systems never call other systems. Composition owns order; ports isolate external effects.
- **Authority.** ECS owns game state. Presentation caches hold only necessary bookkeeping.
- **Tags.** Express capabilities, not feature names or duplicate information.
- **Semantics.** Verify installed bitECS mutation and entity-ID reuse behavior.

## Review

- **Membership.** Check matching/non-matching entities, entry, repeated updates, component removal, deletion, and re-entry.
- **Lifetime.** Check live-resource teardown, repeated disposal, and calls after disposal.
- **Isolation.** Construct worlds directly; fake external ports. Test the real adapter against fake graphics resources separately.
- **Findings.** Record Pass / Finding / Not applicable with evidence. Classify correctness, boundary, coverage, or readability.
- **Loop.** Finding → proposed repair → authorized task → tests/review → retain or remove the rule. Review-only requests do not authorize refactoring.
