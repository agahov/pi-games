/**
 * ecs/systems/board.ts — Board rule
 *
 * `buildBoard` is the pure ECS rule that lays out the playfield: it creates
 * `cols * rows` cell entities, each carrying `Position` + `Visual`, in FIXED
 * WORLD SPACE (origin at 0,0). Centering + zoom to the viewport is a separate,
 * view-layer concern (see `src/pixi/camera.ts`) — the board itself is world-space
 * and knows nothing about the screen.
 *
 * Pure: mutates the ECS world only, takes its layout as params. No Pixi, no `any`.
 */

import type { EcsModule } from '../world';

/* ── Types ────────────────────────────────────────────────────────────────── */

/** World-space layout for the board. All in world pixels. */
export interface BoardConfig {
   /** Columns in the grid. */
  cols: number;
   /** Rows in the grid. */
  rows: number;
   /** Filled square face per cell (world px). */
  cellSize: number;
   /** Space between adjacent cells (world px). */
  gap: number;
   /** Filled square colour per cell. */
  color?: number;
}

/** Default cell colour (a single blue). */
export const DEFAULT_BOARD_COLOR = 0x33_88_ff;

/* ── Rule ─────────────────────────────────────────────────────────────────── */

/**
 * Build a grid of `cols * rows` cells in fixed world space.
 *
 * Origin is `(0, 0)`; a cell at `(col, row)` is placed at world
 * `(col * stride, row * stride)` where `stride = cellSize + gap`. Returns the
 * created entity IDs (row-major, row 0 first) so callers can keep a registry.
 *
 * @param ecs    the ECS module
 * @param config the world-space layout
 * @returns      array of the created cell entity IDs
 */
export function buildBoard(
  ecs: EcsModule,
  config: Pick<BoardConfig, 'cols' | 'rows' | 'cellSize' | 'gap'> &
    Partial<Pick<BoardConfig, 'color'>>,
): number[] {
  const { cols, rows, cellSize, gap, color = DEFAULT_BOARD_COLOR } = config;
  const stride = cellSize + gap;

  const ids: number[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const id = ecs.createEntity();
      ecs.addPosition(id, col * stride, row * stride);
      ecs.addVisual(id, color, cellSize);
      ids.push(id);
    }
  }
  return ids;
}
