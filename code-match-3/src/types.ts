/**
 * types.ts — Shared type contracts for commands & events
 *
 * This is the single API contract between:
 *    - Vue/UI   → ECS  via CommandQueue
 *    - ECS      → Vue  via EventBus
 *
 * Commands are split into two categories:
 *    - ControlCommand — structural/config actions (resize, setParam)
 *                       always processed, even when the loop is paused.
 *    - GameplayCommand — game-state mutations (selectEntity, moveEntity)
 *                       blocked when the loop is paused.
 *
 * The CommandQueue checks cmd.type against a control-types set at push time.
 * When paused, gameplay commands are dropped; control commands are queued normally.
 */

/* ── Control Commands (inward: UI → ECS, always processed) ───────────────── */

export type ControlCommand =
  | { type: 'resize'; width: number; height: number }
  | { type: 'setParam'; key: string; value: unknown };

/* ── Gameplay Commands (inward: UI + Input → ECS, paused when loop is paused) ── */

export type GameplayCommand =
  | { type: 'selectEntity'; entityId: number }
  | { type: 'deselectAll' }
  | { type: 'destroyEntity'; entityId: number };

/* ── All commands ─────────────────────────────────────────────────────────── */

export type Command = ControlCommand | GameplayCommand;

/** The set of command type strings that are control commands. */
export const CONTROL_TYPES = new Set<string>(
  (['resize', 'setParam'] as const).map((t) => t),
);

/* ── Events (outward: ECS → Vue/UI) ──────────────────────────────────────── */

export type GameEvent =
  | { type: 'entitySelected'; entityId: number }
  | { type: 'entityDestroyed'; entityId: number }
  | { type: 'scoreUpdated'; score: number };

/* ── Event map (record form for createTypedBus) ──────────────────────────── */

/**
 * Record-style event map. `createTypedBus<GameEventMap>()` gives typed
 * `on('entitySelected', p => p.entityId)` — payload is the event minus `type`.
 */
export type GameEventMap = {
  [E in GameEvent as E['type']]: Omit<E, 'type'>;
};

/* ── Command map (record form for createCommandQueue) ────────────────────── */

export type CommandMap = {
  [C in Command as C['type']]: C;
};
