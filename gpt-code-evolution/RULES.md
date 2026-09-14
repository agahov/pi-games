# Rules

## Execution

- **Entry.** AGENTS.md → CURRENT.md → feature → next task.
- **Routing.** Draft/Planned → planner; In progress → implementer; Test/Review → reviewer.
- **Scope.** One task per worker session. No recursive delegation.
- **Runner.** The [controller](doc/task-runner.md) may sequence fresh sessions: checks → independent review → local task commit. Stop on issues or decisions.
- **Completion.** Record passing commands/results before marking Done. Missing tests are not passing tests.

## Documents

- **Format.** `- **Short title.** Details.` One point per item; minimum necessary text.
- **Content.** Document project-specific intent, rationale, boundaries, and constraints—not obvious advice or code mechanics. Use [documentation checklist](skills/documentation.md).
- **Ownership.** Features own behavior; task indexes own order; task files own status/evidence; doc/ owns shared decisions.
- **Maps.** Diagrams orient; links locate details. Start at [project map](doc/README.md).
- **Terms.** Use the [glossary](doc/glossary.md).

## Evolution

- **ECS.** Apply the conditional [ECS checklist](skills/ecs.md); reuse data before adding systems.
- **Architecture.** Use [architect](skills/architect.md) only for changed shared boundaries.
- **Reflection.** Keep reusable lessons; remove obsolete rules. Findings do not authorize unsolicited refactoring.
- **History.** Retain completed tasks under tasks/; durable decisions belong in doc/.
