/**
 * kernel/game-loop.ts — Phase-ordered game loop
 *
 * Decoupled from Pixi: uses a `Ticker` interface that `app.ticker` structurally
 * satisfies, but which is trivially mockable in tests.
 *
 * Phases per tick (strict order, by enum value):
 *      COMMAND_DRAIN -> UPDATE -> AFTER_UPDATE -> RENDER
 *
 * COMMAND_DRAIN is auto-registered and always runs first.
 * The command handler (draining the queue) is provided at creation time.
 */

import type { CommandQueue } from './command-queue';
import type { TypedEventBus, EventMap } from './event-bus';

export type { EventMap };

/* --- Ticker ---------------------------------------------------------------- */

/**
 * Minimal frame-scheduler interface.
 *
 * PixiJS `app.ticker` structurally satisfies this.
 * Mock in tests by calling `runTick()` manually.
 */
export interface Ticker {
  add: (cb: () => void) => void;
  remove: (cb: () => void) => void;
  stop: () => void;
  start: () => void;
}

/* --- Phases ---------------------------------------------------------------- */

export enum Phase {
  COMMAND_DRAIN = 0,
  UPDATE         = 100,
  AFTER_UPDATE   = 200,
  RENDER         = 300,
}

const PHASE_ORDER: readonly Phase[] = [
  Phase.COMMAND_DRAIN,
  Phase.UPDATE,
  Phase.AFTER_UPDATE,
  Phase.RENDER,
];

/* --- GameLoop interface ---------------------------------------------------- */

export interface GameLoop {
     /** Register a system in a given phase (default: UPDATE). */
  addSystem(fn: () => void, phase?: Phase): void;
     /** Begin ticking the loop via the Ticker. */
  start(): void;
     /** Stop ticker + pause command queue. Queue is NOT cleared. */
  pause(): void;
     /** Start ticker + unpause command queue. */
  resume(): void;
     /** Stop everything, clear all systems. No further ticks. */
  destroy(): void;
     /** Execute one frame manually — for tests. */
  tick(): void;
     /** Whether the loop is currently paused. */
  readonly paused: boolean;
}

/* --- Implementation -------------------------------------------------------- */

export function createGameLoop<TCommands>(
  ticker: Ticker,
  cmdQueue: CommandQueue<TCommands>,
  onCommand: (cmd: TCommands[keyof TCommands]) => void,
   _eventBus?: TypedEventBus<EventMap>,
): GameLoop {
  const phases = new Map<Phase, Array<() => void>>();
  for (const p of PHASE_ORDER) phases.set(p, []);

   // Auto-registered COMMAND_DRAIN system — always runs first.
  phases.get(Phase.COMMAND_DRAIN)!.push(() => cmdQueue.drain(onCommand));

  let destroyed = false;
  let pausedFlag = false;

  function addSystem(fn: () => void, phase: Phase = Phase.UPDATE): void {
    if (destroyed) return;
    const arr = phases.get(phase);
    if (arr) arr.push(fn);
    else phases.set(phase, [fn]);
     }

  function tick(): void {
    if (destroyed) return;
    for (const phase of PHASE_ORDER) {
      const arr = phases.get(phase);
      if (!arr || arr.length === 0) continue;
      for (let i = 0; i < arr.length; i++) {
      arr[i]!();
         }
       }
       }

   function start(): void {
        if (destroyed) return;
     ticker.add(tick);
     ticker.start();
      pausedFlag = false;
        }

  function pause(): void {
    ticker.stop();
     ticker.remove(tick);
     cmdQueue.pause();
     pausedFlag = true;
        }

  function resume(): void {
    if (destroyed) return;
    ticker.add(tick);
    ticker.start();
    cmdQueue.resume();
     pausedFlag = false;
        }

  function destroy(): void {
    destroyed = true;
     pausedFlag = false;
     ticker.remove(tick);
     ticker.stop();
     cmdQueue.destroy();
     phases.clear();
        }

   return {
    addSystem,
    start,
    pause,
    resume,
    destroy,
    tick,
    get paused() { return pausedFlag; },
     };
}
