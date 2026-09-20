# Workflow

## Shared

- **Scope.** One task per worker session; no recursive delegation. [Runner](task-runner.md) may sequence fresh sessions.
- **Evidence.** Record actual check commands/results in the task before Done. Preserve failed work; do not weaken acceptance.
- **Handoff.** Update task, feature, and CURRENT.md; stop after the task. Queue new features behind unfinished work unless explicitly reprioritized.
- **Conditional.** Apply [ECS checks](ecs-checklist.md) for ECS changes and Architect below for changed shared boundaries.
- **Reflection.** Findings require authorized repairs; keep only reusable process lessons.

## Planner

- **Input.** Read [intent](../intend/INTEND.md), feature, and relevant shared decisions.
- **Output.** Define acceptance and applicable [feature change types](feature-types.md). Create ordered task files with scope, prerequisites, checks, exclusions, evidence, and handoff.
- **Status.** Feature Planned; CURRENT.md points to its first task, or retains the active feature while this one is queued.

## Implementer

- **Input.** Inspect installed APIs and task acceptance before changing code.
- **Checks.** Run task acceptance and regressions; preserve boundaries.
- **Status.** Feature In progress during work; Test when all implementation tasks pass. Task Done requires evidence.

## Reviewer

- **Context.** Fresh session; inspect code and independently rerun acceptance.
- **Lifetime.** Remount in the same document; reload can hide resource leaks.
- **Demo.** Record observed behavior and reproduction steps.
- **Status.** Blockers → repair task, feature In progress. Otherwise feature Done; select the next approved task without implementing it.

## Architect

- **Trigger.** New shared systems/dependencies or changed boundaries.
- **Decision.** Compare reuse with new design; define ownership, contracts, ordering, isolated checks, and trade-offs.
- **Record.** Update canonical docs; ADR only for consequential alternatives. Resolve important ambiguity with the user; return to planning, not implementation.
