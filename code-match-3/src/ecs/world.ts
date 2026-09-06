/**
 * ecs/world.ts — Thin wrapper over BiteCS 0.4
 *
 * Exported surface: a `createEcs()` factory that returns a closed ECS module.
 * No raw BiteCS API calls should leak outside this file.
 *
 * Data-bearing components (Position, Visual) store their per-entity values in
 * external Maps. Flag components (Selected, RemovedComponent) use BiteCS's
 * bitflag presence/absence system directly.
 */

import {
  createWorld,
  createEntityIndex,
  withVersioning,
  addEntity,
  removeEntity,
  registerComponent,
  addComponents,
  hasComponent as bHasComponent,
  removeComponent,
  query as bQuery,
  getEntityComponents,
  commitRemovals,
  type World,
  type EntityId,
} from 'bitecs';
import {
  Position,
  Visual,
  Selected,
  RemovedComponent,
  Components,
  type PosData,
  type VisualData,
} from './components';

/* ── Types ────────────────────────────────────────────────────────────────── */

/** Result of a query — array of entity IDs matching all terms. */
export type QueryResult = EntityId[];

/** The full ECS module interface returned by `createEcs()`. */
export interface EcsModule {
  createEntity: () => EntityId;
  addPosition: (id: EntityId, x: number, y: number) => void;
  addVisual: (id: EntityId, color: number, size?: number) => void;
  setSelected: (id: EntityId, selected: boolean) => void;
  markRemoved: (id: EntityId) => void;
  query: (terms: object[]) => QueryResult;
  hasComponent: (id: EntityId, component: object) => boolean;
  getEntityComponents: (id: EntityId) => object[];
  /** Direct access to raw world for `removeEntity`/`commitRemovals` in RemoveSystem. */
  world: World;
  index: ReturnType<typeof createEntityIndex>;
  /** Per-entity position lookup (only entities with Position component). */
  positions: Map<EntityId, PosData>;
  /** Per-entity visual lookup (only entities with Visual component). */
  visuals: Map<EntityId, VisualData>;
}

/* ── Factory ──────────────────────────────────────────────────────────────── */

export function createEcs(): EcsModule {
  // Versioned entity index: getId(id) + getVersion(id) allow stale-reference detection.
  const index = createEntityIndex(withVersioning());
  const world = createWorld(index);

  // Register all known components.
  for (const component of Object.values(Components)) {
    registerComponent(world, component);
  }

  // External data storage for data-bearing components.
  const positions = new Map<EntityId, PosData>();
  const visuals = new Map<EntityId, VisualData>();

  /* ── API ──────────────────────────────────────────────────────────────── */

  function createEntity(): EntityId {
    return addEntity(world);
  }

  function addPosition(id: EntityId, x: number, y: number): void {
    addComponents(world, id, Position);
    positions.set(id, { x, y });
  }

  function addVisual(id: EntityId, color: number, size = 16): void {
    addComponents(world, id, Visual);
    visuals.set(id, { color, size });
  }

  function setSelected(id: EntityId, selected: boolean): void {
    if (selected) {
      addComponents(world, id, Selected);
    } else {
      removeComponent(world, id, Selected);
    }
  }

  function markRemoved(id: EntityId): void {
    addComponents(world, id, RemovedComponent);
  }

  function query(terms: object[]): QueryResult {
    return Array.from(bQuery(world, terms));
  }

  function hasComponent(id: EntityId, component: object): boolean {
    return bHasComponent(world, id, component);
  }

  function getComponents(id: EntityId): object[] {
    return getEntityComponents(world, id);
  }

  return {
    createEntity,
    addPosition,
    addVisual,
    setSelected,
    markRemoved,
    query,
    hasComponent,
    getEntityComponents: getComponents,
    world,
    index,
    positions,
    visuals,
  };
}

export { commitRemovals, removeEntity };
