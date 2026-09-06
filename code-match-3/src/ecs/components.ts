/**
 * ecs/components.ts — Component definitions for BiteCS 0.4
 *
 * In BiteCS 0.4, `soa()` is an identity function used purely for TypeScript
 * inference. Components are plain object references registered with a world.
 *
 * Each component below is a structural record. Presence/absence on an entity
 * is tracked by BiteCS's bitflag system. Data for data-bearing components
 * (e.g. Position, Visual) is stored in external Maps managed by the wrapper.
 */

import { soa } from 'bitecs';

/* ── Position ─────────────────────────────────────────────────────────────── */

export interface PosData {
  x: number;
  y: number;
}
export const Position = soa({ x: 0, y: 0 });

/* ── Visual ───────────────────────────────────────────────────────────────── */

export interface VisualData {
  color: number;
  size: number;
}
export const Visual = soa({ color: 0, size: 16 });

/* ── Selected ─────────────────────────────────────────────────────────────── */

/** Flag-only component: presence means this entity is currently selected. */
export const Selected = soa({});

/* ── RemovedComponent ─────────────────────────────────────────────────────── */

/** Flag-only component: presence means this entity must be destroyed.
 *  `markRemoved()` adds this flag; `RemoveRenderSystem` + `RemoveSystem` handle
 *  cleanup — no direct `world.removeEntity` in game code. */
export const RemovedComponent = soa({});

/* ── Component registry ───────────────────────────────────────────────────── */

/** All registered component references. Use for `registerAll()` and query terms. */
export const Components = {
  Position,
  Visual,
  Selected,
  RemovedComponent,
} as const;
