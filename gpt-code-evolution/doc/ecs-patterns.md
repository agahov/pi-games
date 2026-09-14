# ECS patterns

[System map](ecs-systems.md) · [Checklist](../skills/ecs.md)

## Selection

```text
New behavior → existing values → component combinations → capability tags
                                                        ↓ insufficient
                                              one new policy/system
```

- **Values.** Vary existing behavior through configuration/components.
- **Composition.** Combine capabilities; avoid named entity-type branches.
- **Tags.** Use presence/absence for eligibility. Avoid redundant or feature-name tags.
- **Transform.** Read components and produce one behavior. Declare competing writers/order.
- **Reconciliation.** Keep external resources aligned with query membership; handle entry, updates, and exit.
- **Phases.** Composition orders dependent computations; systems share data, not references.
- **Requests.** Use transient components/queues only for cross-phase work; define consumption and clearing.
- **Deferred mutation.** Queue structural changes only when actual ECS iteration semantics require it.
- **Dirty tracking.** Add only after measuring expensive unchanged updates.
- **Helpers.** Name sub-operations before splitting one policy into systems sharing a cache.

## Documentation

- **Rationale.** Preserve why a boundary, tag, or ordering constraint exists.
- **Mechanics.** Link code/tests for queries, fields, and lifecycle details.
- **Alternatives.** Record rejected options only when they affect future decisions.
