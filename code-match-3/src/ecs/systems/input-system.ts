/**
 * ecs/systems/input-system.ts — Command handler
 *
 * Handles commands from the `CommandQueue` and updates the ECS world.
 * Emits outward events via the `EventBus` for Vue to react to.
 */

import type { EcsModule } from '../world';
import { Selected } from '../components';
import type { CommandMap, GameEventMap } from '../../types';
import type { TypedEventBus } from '../../kernel';

/**
 * Handle a single command, updating the ECS world and emitting events.
 *
 * @param cmd      the command to handle
 * @param ecs      the ECS module
 * @param eventBus the event bus for outward events
 */
export function handleCommand(
  cmd: CommandMap[keyof CommandMap],
  ecs: EcsModule,
  eventBus: TypedEventBus<GameEventMap>,
): void {
  switch (cmd.type) {
    case 'selectEntity':
      deselectAll(ecs);
      ecs.setSelected(cmd.entityId, true);
      eventBus.emit('entitySelected', { entityId: cmd.entityId });
      break;
     case 'deselectAll':
      deselectAll(ecs);
      break;
     case 'destroyEntity':
      ecs.markRemoved(cmd.entityId);
      eventBus.emit('entityDestroyed', { entityId: cmd.entityId });
      break;
      }
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function deselectAll(ecs: EcsModule): void {
  const currentlySelected = ecs.query([Selected]);
  for (const id of currentlySelected) {
    ecs.setSelected(id, false);
     }
}
