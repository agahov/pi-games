/**
 * pixi/camera.ts — View-layer camera (translate + zoom only)
 *
 * A minimal camera that maps a fixed WORLD-SPACE board to a variable SCREEN
 * viewport: it centers the board and scales it to fit, clamped to a min/max
 * on-screen width. This is a *rendering* concern — no game logic lives here —
 * so the board's `Position` entities stay in fixed world space and never need
 * per-entity repositioning on resize.
 *
 * `fitCamera` is pure math (writes a Camera object, returns it); `applyCamera`
 * mutates a Pixi container. Both take the viewport / clamp as params, so they
 * are testable with arbitrary inputs.
 */

import type { Container } from 'pixi.js';

/* ── Types ────────────────────────────────────────────────────────────────── */

/** The transform a camera applies to its container. */
export interface Camera {
  /** Screen-space X offset (world → screen). */
  offsetX: number;
    /** Screen-space Y offset (world → screen). */
  offsetY: number;
    /** Uniform scale (world → screen). */
  zoom: number;
}

/** Screen viewport size. */
export interface Viewport {
  width: number;
  height: number;
}

/** Board size in world space. */
export interface BoardSize {
  width: number;
  height: number;
}

/** Fit/center clamp: on-screen width bounds + screen-space margin. */
export interface CameraClamp {
  /** Minimum on-screen board width (px). */
  minWidth: number;
    /** Maximum on-screen board width (px). */
  maxWidth: number;
    /** Screen-space margin the fit respects. Default 0. */
  padding?: number;
}

/* ── Factory ──────────────────────────────────────────────────────────────── */

/** Create a camera at the identity transform. */
export function createCamera(): Camera {
  return { offsetX: 0, offsetY: 0, zoom: 1 };
}

/* ── Fit ──────────────────────────────────────────────────────────────────── */

/**
 * Center `board` in `viewport` and scale it to fit, mutating + returning
 * `camera`.
 *
 * - `fitSize` uses the *smaller* axis (`min(vw, vh)`), minus padding, so a square
 *   board always fits even on a wide-but-short window.
 * - On-screen width is clamped to `[minWidth, maxWidth]`.
 * - `zoom = desiredW / board.width`; the board is square, so height scales
 *   proportionally.
 * - `offset` centers the board in the viewport.
 */
export function fitCamera(
  camera: Camera,
  viewport: Viewport,
  board: BoardSize,
  clamp: CameraClamp,
): Camera {
  const padding = clamp.padding ?? 0;

  const fitSize = Math.min(viewport.width, viewport.height) - 2 * padding;
  const desiredW = clampValue(fitSize, clamp.minWidth, clamp.maxWidth);
  const zoom = desiredW / board.width;

  camera.zoom = zoom;
  camera.offsetX = (viewport.width - board.width * zoom) / 2;
  camera.offsetY = (viewport.height - board.height * zoom) / 2;

  return camera;
}

/* ── Apply ────────────────────────────────────────────────────────────────── */

/**
 * Apply a camera to a Pixi container: `.position` = offset, `.scale` = zoom.
 * Cells render into this container in world coords; the transform then maps
 * them to screen.
 */
export function applyCamera(container: Container, camera: Camera): void {
  container.position.set(camera.offsetX, camera.offsetY);
  container.scale.set(camera.zoom, camera.zoom);
}

/* ── Helper ───────────────────────────────────────────────────────────────── */

function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
