/**
 * ui/model.ts — GameModel closure factory
 *
 * Bridges EventBus → Vue ShallowRefs for reactive UI binding.
 * Not a class — a simple closure returned from createGameModel().
 */

import { shallowRef, type ShallowRef } from 'vue';
import type { TypedEventBus } from '@/kernel';
import type { GameEventMap } from '@/types';

/* ── Provide/inject keys ─────────────────────────────────────────────────── */

export const modelKey       = Symbol('game-model');
export const sendCommandKey = Symbol('send-command');
export const loopKey        = Symbol('game-loop');

/* ── Model interface ─────────────────────────────────────────────────────── */

export interface GameModel {
    /** Currently selected entity, or null. */
  selectedEntity: ShallowRef<number | null>;
    /** Current score. */
  score: ShallowRef<number>;
}

/* ── Factory ─────────────────────────────────────────────────────────────── */

export function createGameModel(
   bus: TypedEventBus<GameEventMap>,
): GameModel {
  const selectedEntity = shallowRef<number | null>(null);
  const score = shallowRef(0);

  bus.on('entitySelected', (p) => {
     selectedEntity.value = p.entityId;
        });
  bus.on('entityDestroyed', (p) => {
    if (selectedEntity.value === p.entityId) {
      selectedEntity.value = null;
        }
        });
  bus.on('scoreUpdated', (p) => {
     score.value = p.score;
        });

   return { selectedEntity, score };
   }
