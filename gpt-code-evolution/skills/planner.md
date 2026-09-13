# Planner checklist

Used when a feature status is `Draft` or `Planned`. Output is a clear, ordered plan;
no game code is written here.

## Steps

- [ ] Read the intent for this feature (`intend/README.md`, source `intend/INTEND.md`).
- [ ] Keep the feature document limited to outcome, scope, observable behavior, acceptance criteria, and links.
- [ ] Reuse canonical shared documents: `doc/tech-stack.md`, `doc/architecture.md`, and `doc/communication.md`. Do not copy shared design into the feature.
- [ ] If a new shared system, dependency, or boundary is needed, use [architect checklist](architect.md) before finalizing the plan; otherwise skip architecture work.
- [ ] Write **concrete, runnable acceptance tests** (headless state, pure math,
      browser, typecheck/build). List each as an explicit assertion or scenario.
- [ ] Create `tasks/<feature-id>/README.md` as an ordered link index and one numbered Markdown file per independently verifiable task. Each task owns its status, prerequisites, scope, acceptance commands, exclusions, evidence, and handoff. Link the index from the feature; CURRENT.md points directly to the next task.
- [ ] Tag each task with the checklist that executes it
      (`implementer` / `reviewer`).
- [ ] Identify what is deliberately deferred; do not design generic systems "just in case".
- [ ] Record any blockers or open ambiguities; ask the user only if one blocks the plan.

## Transition

- When the plan, acceptance tests, and ordered tasks all exist, set status
  `Planned`. If the next incomplete task is implementation, note that starting it
  flips status to `In progress` (see `implementer.md`).
- Update `CURRENT.md` to point at this feature and its next incomplete task.
- Then stop. The next run executes the first incomplete task.
