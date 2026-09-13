# Architect checklist

Conditional responsibility, not a mandatory feature phase or separate model.

Trigger: a feature requires a new shared system, dependency, or changed ownership/API boundary. The planner identifies the trigger; the same agent or a bounded architect subagent can perform this review.

- [ ] Read shared architecture, stack, communication map, glossary, and relevant implementation.
- [ ] Check whether existing systems plus game-specific data satisfy the feature first.
- [ ] Document the smallest necessary shared change: ownership, typed contracts, dependency direction, isolated tests, and one trade-off.
- [ ] Update canonical documents under doc/; use an ADR under doc/adr/ for a consequential decision needing durable alternatives/rationale.
- [ ] Leave feature-specific dimensions, behavior, and acceptance criteria in the feature; execution steps and evidence in its task plan.
- [ ] Ask the user only about consequential unresolved trade-offs. Link the decision from the task plan and return to planning; do not implement another task.
