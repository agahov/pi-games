/**
 * board.test.ts — buildBoard lays out an N×N grid in fixed world space
 *
 * Run: `pnpm test:unit -- board.test`
 */

import { describe, it, expect } from 'vitest';
import { buildBoard } from '@/ecs/systems/board';
import { createEcs } from '@/ecs/world';
import { Position, Visual } from '@/ecs/components';

describe('buildBoard', () => {
  it('creates cols*rows cells with Position + Visual', () => {
    const ecs = createEcs();
    const ids = buildBoard(ecs, { cols: 8, rows: 8, cellSize: 64, gap: 8 });

    expect(ids).toHaveLength(64);
    expect(ecs.query([Position, Visual])).toHaveLength(64);
   });

  it('places cell (0,0) at world origin', () => {
    const ecs = createEcs();
    const ids = buildBoard(ecs, { cols: 8, rows: 8, cellSize: 64, gap: 8 });

    const first = ecs.positions.get(ids[0]!);
    expect(first).toEqual({ x: 0, y: 0 });
    expect(ecs.visuals.get(ids[0]!)!.size).toBe(64);
  });

  it('places the last cell at (cols-1, rows-1)*stride', () => {
    const ecs = createEcs();
    const ids = buildBoard(ecs, { cols: 8, rows: 8, cellSize: 64, gap: 8 });

    // stride = cellSize + gap = 72; last cell is (row 7, col 7).
    const last = ecs.positions.get(ids[ids.length - 1]!);
    expect(last).toEqual({ x: 504, y: 504 }); // 7 * 72 = 504
   });

  it('honours a non-square grid', () => {
    const ecs = createEcs();
    const ids = buildBoard(ecs, { cols: 4, rows: 3, cellSize: 50, gap: 10 });

    expect(ids).toHaveLength(12);
    expect(ecs.query([Position, Visual])).toHaveLength(12);
    // stride = 60; last is (row 2, col 3) → (180, 120).
    expect(ecs.positions.get(ids[ids.length - 1]!)).toEqual({ x: 180, y: 120 });
   });

  it('applies the default blue colour to every cell', () => {
    const ecs = createEcs();
    const ids = buildBoard(ecs, { cols: 2, rows: 2, cellSize: 16, gap: 4 });

    for (const id of ids) {
      expect(ecs.visuals.get(id)!.color).toBe(0x33_88_ff);
     }
  });
});
