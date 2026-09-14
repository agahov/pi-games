# 0015 — Review, demo, reflection

Status: Planned
Role: reviewer
Prerequisite: [0014](0014-browser-acceptance.md) Done
Feature: [centered square](../../features/001-square.md)

## Scope

- Use a fresh review context; follow [reviewer checklist](../../skills/reviewer.md).
- Inspect dependency boundaries, entity/graphic lifecycle, async cleanup, test quality, and unnecessary abstractions against shared architecture.
- Apply [extended ECS checklist](../../skills/ecs.md) and revisit the [first audit's E1/E2 proposals](../ecs-review/0001-checklist-audit.md). Record disposition and evidence; the user requested no immediate RenderSystem refactoring. Plan any necessary repair separately rather than silently changing the design.
- Independently rerun the complete acceptance suite and inspect browser output.
- Record demo instructions and observed results for initial display and resizing.
- Update rules/checklists only for demonstrated reusable lessons; remove obsolete guidance rather than accumulating rules.

## Acceptance

- `npm run test:unit`, `npm run test:e2e`, `npm run typecheck`, and `npm run build` pass on review.
- Feature criteria have credible evidence; no unresolved blocking findings.
- Demo steps and review findings are recorded here, along with any reusable reflection change or an explicit statement that none is needed.

## Evidence

Not run; implementation and review pending.

## Handoff

If changes are needed, record findings and make the next bounded repair task explicit; set feature In progress and update CURRENT.md. Do not mark the feature Done.

Otherwise mark this task and feature Done, retain this directory as task history, and set CURRENT.md to no active task. Stop.
