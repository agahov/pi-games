# Centered square: task index

Feature: [001-square](../../features/001-square.md).

Execute in order, one task per run. Each task file owns its status and evidence; this index owns order only.

1. [0011 — Project foundation](0011-project-foundation.md)
2. [0012 — Game and RenderSystem](0012-game-render-system.md)
3. [0013 — Pixi integration](0013-pixi-integration.md)
4. [0014 — Browser acceptance](0014-browser-acceptance.md)
5. [0015 — Review, demo, reflection](0015-review-demo-reflection.md)

## Bootstrap history

- Intent, workflow, and architecture established. Qwen timed out after partial checklist creation; Luna completed setup; parent reviewed scope and UI ownership.
- Shared design separated into doc/; feature behavior stays in features/.
- Prior documentation link scans passed (13 files, then 17 files).
- Task 0011 foundation is complete; scaffold unit/browser checks, typecheck, and build pass. Game-feature acceptance remains pending. See task 0011 for the outstanding development-dependency audit findings.

## Shared references

[Architecture](../../doc/architecture.md) · [Stack](../../doc/tech-stack.md) · [Communication](../../doc/communication.md)

If a task needs a changed shared boundary, follow [architect checklist](../../skills/architect.md) before proceeding.
