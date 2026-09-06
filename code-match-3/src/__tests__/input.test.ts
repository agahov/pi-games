/**
 * input.ts test — findEntityId helper
 *
 * Run: `pnpm test:unit -- input.test`
 *
 * Tests the `findEntityId` helper which walks the parent chain to find
 * the entity ID. No actual Pixi rendering required.
 */

import { describe, it, expect } from 'vitest';
import { Container } from 'pixi.js';
import { findEntityId } from '@/pixi/input';

/* ── Module augmentation import — needed for TypeScript to know about entityId */
import '@/pixi/scene';

describe('input.ts — findEntityId', () => {
  it('returns entityId directly if the container has it', () => {
    const container = new Container();
    container.entityId = 5;
    expect(findEntityId(container)).toBe(5);
    });

  it('walks up to parent to find entityId', () => {
    const parent = new Container();
    parent.entityId = 10;

    const child = new Container();
    parent.addChild(child);

    expect(findEntityId(child)).toBe(10);
    });

  it('returns null when no entityId is found', () => {
    const container = new Container();
    expect(findEntityId(container)).toBeNull();
    });

  it('returns null when input is null', () => {
    expect(findEntityId(null)).toBeNull();
    });

  it('returns null when input is undefined', () => {
    expect(findEntityId(undefined)).toBeNull();
    });
});
