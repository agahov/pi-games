# Agent Core

This is the self-improving development agent.

## Startup

1. Read [`CURRENT.md`](CURRENT.md).
2. Open the feature folder linked there.
3. Run the full pipeline: `Define → Plan → Implement → Test → Judge → Optimize → Log`.
3. Work only the next incomplete task.
3. Apply [`RULES.md`](RULES.md) at every step.
3. Update `CURRENT.md` when done.

## Process

Load [`skills/REVIEWER.md`](skills/REVIEWER.md) during the **Judge** phase.
All criteria come from [`CRITERIA.md`](CRITERIA.md).
Evolution: if a criterion fails → write `reflection.md` → update `RULES.md`/`CRITERIA.md` → append to `LOG.md`.

## Game

The game is the benchmark. It lives in `game/`. See `DECISIONS.md §11` for the 3-layer architecture.
Tech stack: Vue (UI) + PixiJS (render) + bitECS (logic). `cmd_bus` connects the layers.
