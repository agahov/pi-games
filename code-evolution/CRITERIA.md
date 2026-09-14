# Criteria v1

Gate for the AI judge. Each item scored `✓ met`, `✗ not met (reason)`, or `N/A (explanation)`.

## Structure
- [ ] One sentence per function. If you can't, split it.
- [ ] Systems are independent — no system imports or references another system.
- [ ] General systems are reused. A new feature adds a component, not a new system.
- [ ] Low coupling: removing a feature does not require editing unrelated systems.

## Documentation
- [ ] Doc describes what code can't say. If the code says it, delete the doc.
- [ ] Diagrams are maps. Every diagram answers a question prose can't.
- [ ] Feature folder exists for every feature, even trivial ones.

## ECS / Game Design
- [ ] Components are data only. No logic in components.
- [ ] Systems are pure functions of the world. No side effects outside mutating the world.
- [ ] Entity types are open — new features add entities/components, not edit existing systems.

## Process
- [ ] Agent works on the next incomplete task only.
- [ ] Each run produces `judge.md`. No judge = not done.
- [ ] A bug after a feature triggers `reflection.md`, not a hotfix.
- [ ] `CURRENT.md` always shows the one active task and its status.
