/**
 * pixi/input.ts — Pointer input wiring
 *
 * Wires Pixi's event system to push commands into the `CommandQueue`.
 * Only containers with `eventMode` set participate in hit-testing.
 * The stage uses a full-screen `Rectangle` as its hit area.
 *
 * No game logic here — only input routing to the command queue.
 */

import { type Container, type FederatedPointerEvent, Rectangle } from 'pixi.js';
import type { CommandQueue } from '../kernel';
import type { CommandMap } from '../types';

/**
 * Walk up the parent chain to find the nearest `Container.entityId`.
 *
 * Allows clicking on a child sprite to select its parent container's
 * entity — the standard Pixi pattern for composite objects.
 */
export function findEntityId(obj: Container | null | undefined): number | null {
  let current: Container | null | undefined = obj;
  while (current) {
    if (current.entityId !== undefined) return current.entityId;
    current = current.parent;
  }
  return null;
}

/**
 * Wire pixel pointer input on a stage container.
 *
 * Pushes `{ type: 'selectEntity', entityId }` to the queue on each `pointerdown`.
 *
 * @param stage — the Pixi stage container
 * @param queue — the game command queue
 * @returns an unbind function
 */
export function wirePointerInput(
  stage: Container,
  queue: CommandQueue<CommandMap>,
): () => void {
  // Enable event propagation on the stage with a large hit area.
  stage.eventMode = 'static';
  stage.hitArea = new Rectangle(0, 0, 10_000, 10_000);

  const onPointerDown = (event: FederatedPointerEvent): void => {
    // Only respond to primary button (0) / touch.
    if (event.button !== 0 && event.button !== undefined) return;

    // Find the entity ID from the clicked target (bubbles up to parent).
    const entityId = findEntityId(event.target as Container | null);
    if (entityId === null) return;

    queue.push({ type: 'selectEntity', entityId });
  };

  stage.on('pointerdown', onPointerDown);

  // Return an unbind function.
  return () => {
    stage.off('pointerdown', onPointerDown);
  };
}
