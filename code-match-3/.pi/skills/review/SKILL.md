---
name: review
description: General design + code review checklist for THIS ECS game, used by a reviewer (incl. a fresh-context gpt-5.6-sol subagent). Run it at a feature's PLAN review and again at "done"/acceptance. Checks that are broader than any one concern: automated gates green, clear interface, test coverage, low coupling, one-sentence functions, and — gated — whether a change reuses/generalizes a General System (item 6 runs the ecs-design skill). Triggers: "review", "run the reviewer", "before done", "sign off", a feature/PR close-out.
---

# Skill: Review (the checker)

One reviewer, one checklist, one verdict. Treat it as the gate a feature must pass
before it's "done". Most items are *objective* (run the gates, read the type);
items 2, 4, 6 are *judgment* — run the whole checklist in a **fresh context on a
stronger model** so author bias can't rubber-stamp itself.

## Checklist — all must pass

**1. Automated gates (run, don't assume)**
- `pnpm test:unit`, `pnpm typecheck`, `pnpm build` are green/clean — **run them now**.
- `console-clean` e2e passes: no new `console.*` in the render loop.
- No new `any`; no raw BiteCS outside `src/ecs/world.ts`; no game logic in `src/pixi/`.
- *Proof = the command output* (e.g. "96/96 unit + 3 e2e, typecheck clean"), not a claim.

**2. Clear interface** — for every *public* function/system:
- Minimal, fully-typed signature; the params **are** the contract (a `config`/param surface).
- No `any` (use `unknown` + narrow). Names reveal intent (ubiquitous language).
- Returns the caller's need and nothing speculative.

**3. Test coverage**
- New *logic* has a unit test that asserts **behaviour**, not implementation.
- Cross-layer behaviour has an `acceptance` stage; boot hygiene guarded by e2e.
- Test names read like specs (`buildBoard → 64 cells at stride 72`).

**4. Low coupling**
- Layers stay isolated: ECS ↔ UI is one-directional (events **out**, commands **in**).
- `main.ts` is the **only** wiring file; no wiring leaks elsewhere.
- A logic unit test needs no Pixi, no DOM, no world internals.

**5. One-sentence functions**
- Each function/system is describable in **one sentence**. If you can't finish the
   sentence, it carries two responsibilities → **decompose**.

**6. General systems — GATED: run `ecs-design`**
- Ask: does this change **add or reuse** behaviour in the ECS/loop layers, or is it a
  *"one-off that could generalize"* (cell-slide transition / particle fade / spawn-in /
  movement — these are **ONE** General System, not N)?
- **If YES — or it merely *smells* reusable → run `.pi/skills/ecs-design`** (its 5-step
  reuse-vs-generalize-vs-one-off probe) and record the answer in `intent.md`.
- **If NO** — write *why it won't generalize* in `intent.md`. Silence = a missed extraction.

## Verdict format

One line per item: `1 PASS` / `FAIL — <change needed>` / `6 N-A — <reason>`.
End with a single line:

```
READY TO DONE? yes | no   (1–5 must PASS; 6 must be resolved: extracted+recorded OR justified)
```

Post the verdict into the feature's `acceptance.md`.

## Run it as a stronger-model reviewer (recommended for any design)

Because items **2, 4, 6** are judgment the author can't see in their own work, run the
whole checklist in a **fresh context on a stronger model**, then fold its verdict back:

```
spawnAgent:
  prompt: "Run the .pi/skills/review checklist on this diff/feature: <…>.
           Answer each item PASS/FAIL/NA. For item 6, actually open and run
           .pi/skills/ecs-design. Be adversarial: assume every interface is too wide
           and every coupling is too high until proven otherwise."
  model: "gpt-5.6-sol"   # openai-codex provider — NOT the default ollama qwen3.8 model
  cwd:  <project root>
```

The subagent only *reports*; the main agent applies the changes and folds the verdict
into `acceptance.md`. Don't execute its suggestions blindly.

## When to run

- **PLAN review** — before coding starts (or right after the plan is written).
- **"done" / acceptance** — `READY TO DONE?` must be `yes` before the feature moves to ✅.
