/**
 * ecs/systems/render-system.ts — Render bridge systems
 *
 * Per-frame sync between the ECS world and the Pixi stage:
 *
 *  renderSyncSystem    — iterate [Position, Visual], create/update containers
 *  removeRenderSystem  — iterate [Visual, RemovedComponent], destroy containers
 *  removeWorldSystem   — call world.removeEntity for all [RemovedComponent]
 *
 * These are plain functions, not BiteCS systems, because BiteCS observers
 * don't fit the full per-frame sync pattern.
 * A `Map<number, Graphics>` is the source of truth for rendered entities.
 */

import { Graphics, type Container, type Renderer } from 'pixi.js';
import type { EcsModule } from '../world';
import { removeEntity, commitRemovals } from '../world';
import { Position, Visual, RemovedComponent } from '../components';

/* ── renderSyncSystem ──────────────────────────────────────────────────────── */

/**
 * Sync all entities with [Position, Visual] to the Pixi stage.
 *
 * New entity       → create a Graphics container, add to stage + map
 * Existing entity  → update fill colour and position
 *
 * Graphics are drawn at origin (0,0) and positioned via .x/.y on the container.
 *
 * @param ecs          the ECS module
 * @param containerMap Map of EntityId → Graphics
 * @param stage        root Pixi container
 * @param _renderer    Pixi renderer (unused in template stub)
 */
export function renderSyncSystem(
  ecs: EcsModule,
  containerMap: Map<number, Graphics>,
  stage: Container,
  _renderer?: Renderer,
): void {
  const ids = ecs.query([Position, Visual]);

  for (const id of ids) {
    let gfx = containerMap.get(id);
    if (!gfx) {
      gfx = new Graphics();
      gfx.eventMode = 'static'; // participates in pointer events
      gfx.entityId = id;
      stage.addChild(gfx);
      containerMap.set(id, gfx);
    }

    const pos = ecs.positions.get(id);
    const vis = ecs.visuals.get(id);
    if (!pos || !vis || !gfx) continue;

    // Wipe and redraw at origin, then position the container in stage space.
    gfx.clear();
    gfx.rect(0, 0, vis.size, vis.size);
    gfx.fill({ color: vis.color, alpha: 1 });
    gfx.x = pos.x;
    gfx.y = pos.y;
  }
}

/* ── removeRenderSystem ───────────────────────────────────────────────────── */

/**
 * Destroy Pixi containers for entities marked [Visual, RemovedComponent].
 *
 * - Removes the Graphics from the stage
 * - Destroys the Graphics (cascading to children, not textures)
 * - Cleans up the external dataMaps (positions, visuals)
 * - Deletes from containerMap
 *
 * Must run BEFORE `removeWorldSystem` (queries still match during this call).
 */
export function removeRenderSystem(
  ecs: EcsModule,
  containerMap: Map<number, Graphics>,
  stage: Container,
): void {
  const ids = ecs.query([Visual, RemovedComponent]);
  for (const id of ids) {
    const gfx = containerMap.get(id);
    if (!gfx) continue;
    // Clean up external data maps before removing.
    ecs.positions.delete(id);
    ecs.visuals.delete(id);
    // Remove from stage, then destroy.
    stage.removeChild(gfx);
    gfx.destroy({ children: true, texture: false });
    containerMap.delete(id);
  }
}

/* ── removeWorldSystem (runs last in RENDER phase) ─────────────────────────── */

/**
 * Deregister all [RemovedComponent] entities from the BiteCS world.
 *
 * This is the last system in the RENDER phase — after the render system
 * has cleaned up containers, entities are freed from the ECS.
 */
export function removeWorldSystem(ecs: EcsModule): void {
  const ids = ecs.query([RemovedComponent]);
  for (const id of ids) {
    removeEntity(ecs.world, id);
  }
  commitRemovals(ecs.world);
}
