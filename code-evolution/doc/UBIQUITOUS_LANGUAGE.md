# Ubiquitous Language

Living glossary. Add new terms as they appear in code or docs. One canonical term per concept.
Aliases and synonyms to be avoided are listed. If a term is ambiguous, flag it below.

---

## Process

| Term | Definition | Aliases to avoid |
|---|---|---|
| **Feature** | A unit of work that goes through the full pipeline (Define→Plan→Implement→Judge). Has a folder. | task, story, epic (for single features) |
| **Pipeline** | The continuous flow: Define→Plan→Implement→Test→Judge→Optimize→Log. Run once per feature. | workflow, process, phases (when meaning pipeline) |
| **Judge** | The AI review step. Produces `judge.md` by applying `doc/criteria/REVIEW.md` (which subsumes `DOC.md` + `IMPLEMENT.md`). | review, audit, check |
| **Reflection** | A `reflection.md` in a feature folder. Produced when a criterion fails. Proposes a principle change. | fix, hotfix, correction, post-mortem |
| **Log entry** | An entry in `LOG.md`. Records a principle change or significant evolution. | history, changelog, journal (when meaning LOG.md) |
| **OPEN.md** | File listing unresolved process items not yet applied to rules. | TODO, backlog, issues |
| **Bootstrap** | Feature 000. The first feature. Establishes the agent core. | setup, init, scaffold, foundation |
| **Run** | One complete pass of the pipeline for one feature. | iteration, cycle, pass, spin |
| **Criteria** | A checklist loaded by the agent at a specific phase. One file per phase group. See `doc/criteria/`. | gate, checklist (when meaning a criteria file) |
| **Invariant** | An absolute, cross-cutting principle in `doc/RULES.md`. Always on. No phase. | rule, law, principle (when meaning the absolute invariants) |
| **Phase** | A named step in the pipeline: Define, Plan, Implement, Test, Judge, Optimize, Log. | step, stage, phase (consistent) |

---

## Architecture & Tech

| Term | Definition | Aliases to avoid |
|---|---|---|
| **cmd_bus** | Typed event emitter connecting the 3 layers. Commands go UI→ECS, events go ECS→Vue/Pixi. | event bus, message router, event emitter, pub/sub (when referring to this specific bus) |
| **Command** | A typed message sent to `cmd_bus` from Vue or Pixi, triggering game logic. | event, signal, action (when meaning a request) |
| **Event** | A typed message emitted by a system on `cmd_bus`, consumed by `EventAdapter`. | signal, notification, callback (when meaning a state change broadcast) |
| **EventAdapter** | Translates ECS-emitted events into `shallowRef` updates for the Vue layer. | bridge, adapter, translator, middleware |
| **shallowRef** | Vue 3 reactive primitive. Holds a coarse game state snapshot. Not deeply reactive. | ref (when meaning shalldown), reactive state |
| **Renderable** | ECS component. Marks an entity as having a visual representation in PixiJS. | sprite, visual, drawable |
| **InputSystem** | ECS system. Reads input commands from `cmd_bus` and updates components. | input handler, controller, input adapter |
| **ChaseSystem** | ECS system. Updates the `ChaserEntity.Position` toward `MousePosition` every frame. | follow system, tracking system |
| **MousePosition** | ECS component. The current mouse cursor coordinates within the PixiJS canvas. | pointer, cursor, input position |
| **layer** | One of the three isolated domains: Vue (UI), bitECS (logic), PixiJS (render). | module, service, domain |
| **ADR** | Architecture Decision Record. A history document in `adrs/`. Records context, alternatives, decision, consequences. | decision doc, notes, rationale (when meaning an ADR file specifically) |

---

## Domain / Game Design

| Term | Definition | Aliases to avoid |
|---|---|---|
| **StaticEntity** | Entity with `Position` + `Renderable`, fixed initial position. Does not move. | static square, fixed entity, anchor |
| **ChaserEntity** | Entity with `Position` + `Renderable`, moved by `ChaseSystem` toward `MousePosition`. | following square, moving entity, target |
| **Game** | The full 3-layer system (Vue + ECS + PixiJS) running together. | app, project, world (when meaning the whole system) |
| **World** | The bitECS world instance. Contains all entities, components, and systems. | ecs, engine, universe (when meaning the bitECS world specifically) |
| **Component** | bitECS data structure. SoA plain object. No logic. | attribute, property, data (when meaning a bitECS component) |
| **System** | A pure function `(world) => void` that iterates entities and mutates components. | function, routine, handler (when meaning an ECS system) |
| **Agent core** | The portable set of files that define the self-improving process. Copyable to a new game. | framework, engine (when meaning the agent, not the game engine), harness |

---

## Flagged Ambiguities

- "**world**" refers to two things: the bitECS `World` instance and the meta-concept "the game world." Use `world` for bitECS, `game` for the full system.
- "**event**" means two things in a general sense: a DOM event and a `cmd_bus` `Event`. In `UBIQUITOUS_LANGUAGE.md`, an `Event` is specifically a `cmd_bus` message. DOM-level events are "input events" until they cross into `cmd_bus`.
