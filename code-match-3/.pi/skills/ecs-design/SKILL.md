---
name: ecs-design
description: Reference + review for the "General Systems ↔ Features" contract in this ECS game (BiteCS 0.4). General (parameterized, reusable, pure) systems live in src/ecs; a Feature instantiates one with a config/adapter instead of writing bespoke logic. Use when designing or wiring ANY feature that adds behaviour, when something smells like a one-off that could be a reusable system (cell-slide transitions and particle VFX are ONE general MovementSystem, not two), when deciding whether to EXTEND an existing system vs add a new one, or when wiring systems in main.ts. Triggers: "add a feature", "movement/transition/vfx/animation", "reuse", "general system", "should this be a system?".
---

# Skill: ecs-design — General Systems ↔ Features

> Invoked by item 6 of `.pi/skills/review`; also usable standalone.

The discipline is one sentence:

> A **Feature** does not own behaviour. It **instantiates a General System**
> (a pure, parameterized system) by supplying a config/adapter. Behaviour lives
> once, in `src/ecs`, generic and reusable.

If you ever find a Feature writing bespoke logic that is really a *configured
instance of something reusable*, stop: that is a General System missing from
`src/ecs`. Extract it.

---

## Glossary (ubiquitous language — keep these exact)

- **General System** — a *pure* function in `src/ecs/systems/` that implements a
  reusable behaviour, parameterized by a `config`. Takes `ecs` (+ the minimum
  other deps it genuinely needs) + config. No feature-specific constants.
  No `any`. No raw BiteCS (go through `EcsModule`). No Pixi import in ECS.
- **Feature** — a `features/<name>/` slice that *uses* a General System by
  passing a config, plus a thin **adapter** (often in `main.ts` wiring or the
  feature's own module). A Feature may also define a *new* General System.
- **Param surface** — the `config` type a General System exposes. **Minimal and
  intention-revealing.** This is the contract of reusability: if Feature B can be
  described by Feature A's param surface, they share one General System.
- **Lifecycle** — *when* a system runs. Three exist today (see below). A system's
  lifecycle is a property of the system, not of a Feature wiring it.
- **Phase** — the per-tick slot a per-frame system runs in
  (`COMMAND_DRAIN → UPDATE → AFTER_UPDATE → RENDER`).
- **Adapter** — the thin glue a Feature supplies to bind a General System to the
  world: the config value, the loop registration, the phase choice.

---

## The General System contract (as the code stands)

A General System is a function in `src/ecs/systems/`. It has a **lifecycle**:

| Lifecycle | Runs | Registered by | Example today |
|---|---|---|---|
| **one-shot** | once, at boot | called directly in `main.ts` | `buildBoard(ecs, BOARD)` |
| **per-frame** | every tick | `loop.addSystem(fn, Phase)` | `renderSyncSystem`, `removeWorldSystem` |
| **per-event** | on each queued command | `loop` drains → `handleCommand(cmd, ecs, bus)` | `handleCommand` |

Conventions every General System obeys:

1. **Pure** — reads the world via `ecs`, mutates only what its name says it
   mutates; no hidden global/stateful closure beyond its explicit params.
2. **`config` is the seam.** Reusability = Feature B compiles against Feature A's
   `config` type with *no signature change.*
3. **Boundary respected** — no raw BiteCS except `src/ecs/world.ts`; no Pixi in
   `src/ecs`; no game logic in `src/pixi/`.
4. **Phase is explicit** for per-frame systems; never implicit default if it
   matters (default `Phase.UPDATE` is a silent choice — write it).

---

## Review procedure (run at a feature's PLAN review and again at "done"/acceptance)

Answer these in order. Stop at the first that resolves the design; record the
answer in the feature's `intent.md` under "Systems".

1. **Reuse?** Does a General System in `src/ecs/systems/` already implement this
   behaviour (or superset)? If yes → instantiate it with a config/adapter.
   **Do not write a second one.**

2. **Generalize?** Is this a *one feature*, or will ≥1 other feature (or a future
   one) need the same shape under different params? **Classic smell: "transition
   for cells" vs "fade for particles" vs "spawn-in VFX" — all three are one
   `MovementSystem(ecs, {duration, ease, drive, onDone?, per-frame:UPDATE})`.**
   If shared → extract a General System *now*, give it a `config`, and have the
   current Feature instantiate it. Do not ship the bespoke version.

3. **One-off?** If it is genuinely singular AND unlikely to recur → a bespoke
   function is fine, **but write down why it won't generalize** in `intent.md`
   ("single, one-shot, never parameterized: …"). Silence = a missed extraction.

4. **Lifecycle & phase.** Which of the three lifecycles? Which `Phase`? If the
   needed lifecycle/phase is *not representable without a hack*, go to step 5.

5. **Extended-General-System test (the probe).** If steps 1–4 force you to:
   - bolt a 4th lifecycle onto `main.ts` wiring, or
   - special-case a system so it breaks the `config` seam, or
   - add a system whose "when/where it runs" can't be expressed cleanly,
   then **the framework is too small, not the feature**. That is the signal that
   an **extended General System** is needed: a first-class `System` abstraction —
   `{ name, lifecycle, phase, apply(ecs, config, ctx) }` — plus a small
   registry + a loop that runs registered systems by lifecycle/phase.
   **Don't inline the hack.** Instead: open a NEW feature `features/system-generalization/`
   (`intent` → `plan` → `acceptance`, per AGENTS.md) to introduce the abstraction,
   then this Feature instantiates it. One feature at a time.

**Record, in every feature's `intent.md`:** the General System(s) it instantiates,
its `config` param surface, its lifecycle + phase, and any "won't generalize" note.

---

## When the agent runs this skill

- At **feature intent/plan**: run steps 1–3 to decide extract-vs-reuse-vs-one-off.
- At **wiring (`main.ts`)**: confirm each `loop.addSystem(...)` has an explicit
  `Phase` and that the system is a real General System, not feature code smuggled
  through a closure.
- At **acceptance / "done"**: verify no new `src/ecs/systems/` function is
  feature-specific (fails step 2), and that `intent.md` records its systems.

## Stronger-model option (optional)

Because "is this a one-off or a missing General System?" is a cross-feature
judgment a same-context agent can bias, run the review in a **fresh context** for
a design you're unsure about:

```
spawnAgent:  prompt = "Run .pi/skills/ecs-design on this diff/design: <…>.
                          Answer steps 1–5. Be adversarial about extract-vs-one-off."
              model  = "gpt-5.6-sol"   (openai-codex provider; reachable via the
                          OpenAI login — NOT the default ollama qwen3.8 model)
              cwd    = project root
```

Use `gpt-5.6-sol` for the review (stronger reasoning in a fresh context); the
implementer stays on the default local model. The subagent result must be folded
back into `intent.md`, not executed blindly.

---

## Probe result (current codebase, run on build)

- `buildBoard` / `renderSyncSystem` / `removeWorldSystem` / `handleCommand` are
  **four ad-hoc functions, three lifecycles, no shared `System` type.** Lifecycle
  is *invisible* — it lives only in how `main.ts` wires each one.
- ⇒ **The "extended General System" is real and needed**: a typed `System`
  `{name, lifecycle, phase, apply(ecs, config, ctx)}` + registry would let a
  future `MovementSystem` (transitions + VFX) register cleanly and be reused by
  feature-config. Record as a future feature, don't build it under another feature
  (AGENTS.md: one feature at a time).
