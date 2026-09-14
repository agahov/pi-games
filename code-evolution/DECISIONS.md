# Design Decisions

> Decisions from grilling session, 2025-01-01. Status: Draft — pending user review.
> All decisions are in scope for `feature 000-bootstrap`.

## 1. Project Vision

**The project is a self-improving development agent, using a 2D web game as a stress test and evolution benchmark.**

- **Agent core** (`AGENTS.md`, `RULES.md`, `CRITERIA.md`, `skills/`, `LOG.md`, `OPEN.md`, `CURRENT.md`) is a portable artifact. To build a new game: copy the agent core, start a new `game/` dir.
- **The game** is the benchmark. The first game: a 2D web game, tech stack = Vue (UI) + PixiJS (render) + bitECS (game logic).
- **Evolution**: the agent improves its own process (rules, criteria, skills) as it builds features. The improvement is visible and traceable.

## 2. The Loop

One continuous pipeline, no separate skill invocations. The six activities from `INTEND.md` map to phases of one flow:

```
Define → Plan → Implement → (remove tasks as needed) → Test → Judge → Optimize → [log]
```

| Phase | Activity | Output |
|---|---|---|
| Define | `feature.md` written | Intent, acceptance scenario, diagram (optional) |
| Plan | `plan.md` written | Task breakdown |
| Implement | Code written in `game/src/` | "Remove tasks" is an action within implement — agent backtracks when a planned task is unnecessary |
| Test | Acceptance tests run | Major success scenario passes |
| Judge | `judge.md` written | AI (prompt template) scores each criterion: `✓ / ✗ / N/A` |
| Optimize | Post-judge refactor | If a criterion fails → `reflection.md` → propose rule change → apply to `RULES.md` or `CRITERIA.md` |
| Log | `LOG.md` appended | Rule change recorded |

**Run boundary**: Agent works autonomously through all phases, pauses only when it hits something it can't decide (ambiguity, a proposed major rule change, a `✗` in judging that looks wrong). User intervenes at those gates only.

## 3. Agent Core Structure

Agent core lives at the project root. It's the primary artifact. Single current version. Git tracks history.

```
code-evolution/
├── AGENTS.md             # entry point, minimal, reads CURRENT.md
├── RULES.md              # evolving rules (short, reactive-updated)
├── CRITERIA.md           # AI judge checklist (evolving)
├── CURRENT.md            # "where we are" snapshot, minimal
├── LOG.md                # human-readable evolution story (grows)
├── OPEN.md               # unresolved process items (grows)
├── DECISIONS.md          # this file, design record
├── archive/              # superseded content (e.g., original INTEND.md)
├── skills/
│   └── REVIEWER.md       # judge prompt template
├── tasks/
│   └── features/
│       ├── 000-bootstrap/
│       │   ├── feature.md
│       │   ├── plan.md
│       │   └── judge.md
│       ├── 001-two-squares/
│       │   ├── feature.md
│       │   ├── plan.md
│       │   ├── judge.md
│       │   └── diagram.*    (optional)
│       └── ...
└── game/
    ├── src/              # live game code (the "final result")
    ├── tests/            # acceptance tests for game
    └── decisions/        # ADRs (created during proactive review, not v1)
```

**Feature folder** is fixed structure, even for trivial features:
```
tasks/features/NNN-name/
  feature.md      # intent, acceptance scenario (given/when/then)
  plan.md         # task breakdown, "removed" tasks are annotated [REMOVED: reason]
  judge.md        # AI judge's criterion-by-criterion verdict
  reflection.md   # only if a criterion failed; proposes rule change
  diagram.*       # optional, only if it answers a question prose can't
```

## 4. First Features

### Feature 000-bootstrap

The agent core. Goes through the full loop.
- **Intent**: establish the agent core (AGENTS.md, RULES.md, CRITERIA.md, CURRENT.md, LOG.md, OPEN.md, skills/REVIEWER.md, DECISIONS.md, archive/).
- **Acceptance**: all files exist and are non-empty. `CURRENT.md` points to feature 001.
- **Judge**: applies CRITERIA.md to the agent core itself. This sets the precedent — the process is judged like any other artifact.

### Feature 001-two-squares

The first game feature. The benchmark.
- **Intent**: two squares on a PixiJS canvas. One static. One follows the mouse cursor.
- **Tech**: 3-layer architecture (§11). Two entities, `StaticEntity` and `ChaserEntity`. Both have `Position` and `Renderable` components. `InputSystem` reads Pixi mouse move events via `cmd_bus` and writes `MousePosition`. `ChaseSystem` reads `MousePosition` and updates `ChaserEntity.Position`. `RenderSystem` reads all `Renderable` entities and draws to Pixi. Vue has a mount point for Pixi plus a small UI overlay.
- **Acceptance**: move mouse over canvas → second square follows. First square doesn't move.
- **Judge**: applies CRITERIA.md.

**Genre/theme**: irrelevant for the benchmark.

## 5. Criteria Checklist (v1)

### Structure
- [ ] One sentence per function. If you can't, split it.
- [ ] Systems are independent. No system imports or references another system.
- [ ] General systems are reused. A new feature doesn't write a new render system — it adds a component.
- [ ] Low coupling. If removing a feature requires editing multiple systems, that's a smell.

### Documentation
- [ ] Doc describes what code can't say. If the code says it, delete the doc.
- [ ] Diagrams are maps. Every diagram must answer a question prose can't.
- [ ] Feature folder exists for every feature, even trivial ones.

### ECS / Game Design
- [ ] Components are data only. No logic in components.
- [ ] Systems are pure functions of the world. No side effects outside mutating the world.
- [ ] Entity types are open — new features add entities and components, not edit existing systems.

### Process
- [ ] The agent works on the next incomplete task only.
- [ ] Each run produces `judge.md`. No judge = not done.
- [ ] A bug after a feature triggers `reflection.md`, not a hotfix.
- [ ] `CURRENT.md` always shows the one active task and its status.

## 6. Judge Mechanics

- **Mechanism**: prompt template in `skills/REVIEWER.md`. Agent loads it during the judge phase.
- **Model**: same agent, no context reset. Prompt template enforces objectivity.
- **Output format**: per-criterion `✓ met`, `✗ not met (reason)`, or `N/A (explanation)`. No scores. Gate, not grade.
- **Human veto**: user reviews `judge.md`. If the agent's `✗` is wrong, user overrides. If the agent missed a real `✗`, user flags it and agent updates.
- **No human in loop otherwise**: once CRITERIA.md and AGENTS.md are locked, agent runs to completion.

## 7. Evolution Mechanism

### Reactive (primary)

Trigger: a criterion fails during judging, or a bug found post-feature.
Flow: `judge.md` → `reflection.md` (proposes change) → apply to `RULES.md` or `CRITERIA.md` → append to `LOG.md`.
Size threshold: single-line rule changes → agent applies autonomously. New global system, new ADR, or any change affecting more than 2 existing criteria → user review required.

### Proactive (future, not in v1)

Trigger: N features completed with no reflections.
Flow: review session → new ADRs in `game/decisions/` → criteria updates → log.

### Log

- `LOG.md` at root: human-readable, grows. Each entry: timestamp | feature | type (reactive/proactive) | before → after | reason.
- Git tracks exact diffs and blame. No per-run snapshots — single current version at any time.
- To see evolution: `git log --follow RULES.md` or `git log --follow CRITERIA.md`.

## 8. Starting State

At time of writing:
- **Existing**: `AGENTS.md` (generic shell, references `CURRENT.md` which didn't exist), `intend/INTEND.md` (rough vision — superseded by `DECISIONS.md`).
- **To create** in `feature 000-bootstrap`: full agent core per §3, plus `feature 001` spec, plus scaffold for `game/`.
- `intend/INTEND.md` is superseded by `DECISIONS.md`. Kept in `archive/` as raw reference.

## 9. Open Questions

To be resolved in `feature 000-bootstrap`:
- [ ] `OPEN.md` schema — free-form list or structured?
- [ ] `game/` dir name — confirmed by design, not explicitly user-approved.
- [ ] `cmd_bus` type — typed event emitter? string-keyed pub/sub? bitECS observer-based?
- [ ] Command shape — TypeScript interface, or loosely-typed event object?
- [ ] Vue reactive primitive — `shallowRef` or `ref`?
- [ ] PixiJS mount point — inside a Vue `<canvas>` element, or a sibling DOM node?

## 10. What This Document Is

A design record. Not the agent core itself — the agent core is `AGENTS.md`, `RULES.md`, `CRITERIA.md`, `skills/`, etc. This is the "why" behind all of it. It stays in the project as a permanent record of the first design conversation. When the process evolves, `DECISIONS.md` itself doesn't change — new design conversations append to it or produce new decision records.

## 11. Architecture: 3-Layer Design

**Principle**: The game is 3 independent layers communicating through a `cmd_bus` and an `EventAdapter` to Vue `ShallowRef`s.

```
┌───────────────────────────────────────┐
│           Vue (UI layer)               │
│  HTML overlay, buttons, labels         │
│  Emits commands via cmd_bus            │
│  Receives state via EventAdapter       │
│  → ShallowRef → Vue reactivity         │
│  Contains the PixiJS canvas container   │
└──────────────┬─────────────────────────┘
               │ commands ↓        ↑ events (via ShallowRef)
               ▼                   │
┌───────────────────────────────────────┐
│       cmd_bus (event router)          │
│  Vue UI events → ECS commands         │
│  Pixi input events → ECS commands     │
│  ECS events → EventAdapter → ref      │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│       bitECS (logic layer)            │
│  Entities + Components + Systems       │
│  No knowledge of Vue or Pixi          │
│  Communicates via cmd_bus only        │
└──────────────────┬────────────────────┘
                   │ Renderable components
                   ▼
┌───────────────────────────────────────┐
│       PixiJS (render layer)           │
│  Canvas, sprites, visuals             │
│  RenderSystem reads ECS → draws       │
│  Mouse/pointer events → cmd_bus       │
└───────────────────────────────────────┘
```

**Data flow paths:**

1. **Vue → ECS** (user action):
   `Vue UI event → cmd_bus.emit(command) → cmd_bus handler → ECS system mutates component`

2. **ECS → Vue** (state change):
   `ECS system → cmd_bus.emit(event) → EventAdapter → ShallowRef.value = data → Vue re-renders`

3. **Pixi → ECS** (input):
   `Pixi interaction/mouse event → cmd_bus.emit(inputCommand) → ECS InputSystem → component update`

4. **ECS → Pixi** (render):
   `ECS world query with Renderable → RenderSystem → PixiJS display object position/creation`

**bitECS 0.4.0** — current version. Key API:
- `createWorld()`, `addEntity(world)`, `query(world, [Comp])`
- `addComponent(world, eid, component)` — parameter order: `(world, eid, comp)`
- SoA components: `const Position = { x: [] as number[], y: [] as number[] }`
- Observers: `observe(world, onAdd(Position), callback)` — reactive to component changes
- No `defineQuery`, no `Types.f32` — plain objects
- Prefabs and relations available if needed later

---

**Status: Draft — pending user review.**
After review, agent runs `feature 000-bootstrap` autonomously with human veto on `AGENTS.md`, `CRITERIA.md`, `REVIEWER.md` only.
