/**
 * types.test.ts — compile-time type safety for commands & events
 *
 * These assertions run at compile time via `pnpm typecheck`.
 * A trivial runtime test keeps the file registered with vitest.
 *
 * Run: `pnpm test:unit` (runtime) + `pnpm typecheck` (static assertions)
 */

import { describe, it, expect } from 'vitest';
import type { Command, CommandMap, GameEvent, GameEventMap } from '@/types';

describe('types.ts (compile-time assertions)', () => {
  it('file is a valid module (compile-time type checks run via tsc)', () => {
    expect(true).toBe(true);
   });
});

/* ── Command type safety ──────────────────────────────────────────────────── */

// ✅ Correct: a valid command.
const validCommand: Command = { type: 'selectEntity', entityId: 1 };
void validCommand;

// ✅ Correct: a valid CommandMap key.
const mapKey: keyof CommandMap = 'selectEntity';
void mapKey;

// ✅ Correct: a valid game event.
const validEvent: GameEvent = { type: 'entitySelected', entityId: 5 };
void validEvent;

// ✅ Event map key is the event 'type' field.
const evKey: keyof GameEventMap = 'entitySelected';
void evKey;

// ❌ Wrong command type — should fail typecheck:
// @ts-expect-error — 'unknown' is not a valid Command
const badCommand: Command = { type: 'unknown' };
void badCommand;

// ❌ Wrong event type — should fail typecheck:
// @ts-expect-error — 'unknown' is not a valid GameEvent
const badEvent: GameEvent = { type: 'unknown' };
void badEvent;
