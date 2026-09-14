# Rules

Short, evolving. Each rule is one sentence.

## Process
- The agent works on only the next incomplete task.
- Each feature produces a `judge.md`. No judge = not done.
- A bug after a completed feature triggers `reflection.md`, not a hotfix.
- `CURRENT.md` always shows the one active task and its status.
- Single-line rule changes apply autonomously. Changes affecting 2+ criteria require user review.

## Architecture
- Systems are independent. No system imports or references another system.
- Components are data only. No logic in components.
- Systems are pure functions of the world. Side effects only via mutating the world or emitting via `cmd_bus`.
- Vue (UI) and PixiJS (render) do not import each other. Both communicate through `cmd_bus`.
- `shallowRef` holds the active game state for Vue. No deep reactivity.

## Code
- One sentence per function. If you can't, split it.
- General systems are reused. A new feature adds a component, not a new system.
- Commands are typed via a shared types module. No string-keyed events.
- `game/` holds the live game code. Agent-core files stay at root.
