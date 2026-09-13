# Rules

Base, evolution-oriented rules for this self-improving development agent. They are
general (not project-specific code details); feature specifics live in
`features/*.md`. When a rule is obsolete, delete it; keep the checklist minimal.

## Agent and routing

- The agent **is** this file-driven workflow: `AGENTS.md` (routing) +
  `CURRENT.md` (pointer) + `skills/*.md` (checklists) + `RULES.md` (this file) +
  `features/*.md` (work). It is **not** a custom pi extension, sub-agent, or tool;
  no extension code or configuration is added for it.
- One run does one thing: the **single next incomplete task**. No batching, no
  speculative follow-ups, no recursive delegation to another agent workflow.
- `AGENTS.md` routes by feature status: `Draft`/`Planned` → `skills/planner.md`,
  `In progress` → `skills/implementer.md`, `Test`/`Review` → `skills/reviewer.md`.
- `CURRENT.md` is the entry point: it points to the active feature and names the
  next incomplete task. When the next task's nature differs from the status routing,
  start the task by setting the status that matches it, then follow the checklist.

## Status values

`Draft` → `Planned` → `In progress` → `Test` → `Review` → `Done`. Each transition
is an explicit, intentional update written to the feature file and `CURRENT.md`.

## Evidence and claims

- A task is "done" only when its **acceptance tests ran and passed**, with the
  command and result recorded in its task plan. No unsupported success claims.
- If a test runner or implementation does not exist yet, say so explicitly; do not
  report a claim as verified.
- Record evidence (command + observed result) at the task that requires it, not in
  prose elsewhere.

## Structure and language

- Feature documents own behavior and acceptance criteria. `tasks/<feature-id>/README.md` owns task order; numbered task files own status, execution scope, acceptance commands, evidence, and handoff. CURRENT.md links the next task directly. Shared architecture, communication, and stack live once under `doc/`; link rather than duplicate.
- Planner maintains this separation. Use `skills/architect.md` only for a new shared system/dependency or changed boundary, not as a mandatory phase for every feature.

- Use the **ubiquitous language** and canonical terms defined in
  [`doc/glossary.md`](doc/glossary.md). Rename a term repo-wide, do not add a synonym.
- Docs explain **why and what boundaries exist**, not a restatement of code.
- Diagrams are project maps (prefer Mermaid); keep prose minimal.
- Each general concept/function should be explainable in one sentence; if not, split it.

## Evolution

- Feature work reuses existing general systems; add a new general system only when a
  feature genuinely needs it, and each general system is described and tested in isolation.
- Review/reflection updates change process docs **only when a lesson is reusable**.
  Feature-specific notes stay in the feature file.
- Keep phase artifacts clean: when a checklist or rule stops being used, remove it.
  Completed task bodies move to `tasks/` history; durable knowledge stays in `doc/`,
  `features/`, `src/`, `tests/`.
