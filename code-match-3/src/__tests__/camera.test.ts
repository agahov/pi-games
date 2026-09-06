/**
 * camera.test.ts — fitCamera centers + clamps; applyCamera drives a container
 *
 * Run: `pnpm test:unit -- camera.test`
 */

import { describe, it, expect } from 'vitest';
import { Container } from 'pixi.js';
import {
  createCamera,
  fitCamera,
  applyCamera,
} from '@/pixi/camera';

const BOARD = { width: 568, height: 568 }; // 8×8 @ stride 72, last offset 568
const CLAMP = { minWidth: 360, maxWidth: 960, padding: 48 };

describe('fitCamera', () => {
  it('centers a board that fits the viewport (no clamp engaged)', () => {
    const cam = createCamera();
    // fitSize = min(1000,1000) − 2·48 = 904 → desiredW 904 (within [360,960]).
    fitCamera(cam, { width: 1000, height: 1000 }, BOARD, CLAMP);

    expect(cam.zoom).toBeCloseTo(904 / 568, 6);
    expect(cam.offsetX).toBe(48); // (1000 − 904) / 2
    expect(cam.offsetY).toBe(48);
   });

  it('clamps to minWidth on a tiny viewport (board may overflow)', () => {
    const cam = createCamera();
    // fitSize = min(300,300) − 96 = 204 < 360 → clamped to 360.
    fitCamera(cam, { width: 300, height: 300 }, BOARD, CLAMP);

    expect(cam.zoom).toBeCloseTo(360 / 568, 6);
    expect(cam.offsetX).toBe(-30); // (300 − 360) / 2
    expect(cam.offsetY).toBe(-30);
   });

  it('clamps to maxWidth on a huge viewport (never up-scales past 960)', () => {
    const cam = createCamera();
    // fitSize = min(4000,4000) − 96 = 3904 > 960 → clamped to 960.
    fitCamera(cam, { width: 4000, height: 4000 }, BOARD, CLAMP);

    expect(cam.zoom).toBeCloseTo(960 / 568, 6);
    expect(cam.offsetX).toBe((4000 - 960) / 2); // 1520
    expect(cam.offsetY).toBe((4000 - 960) / 2);
  });

  it('scales height proportionally (square board, uniform zoom)', () => {
    const cam = createCamera();
    fitCamera(cam, { width: 1000, height: 1000 }, BOARD, CLAMP);

    // Uniform zoom on a square board ⇒ the on-screen board is square.
    expect(BOARD.width * cam.zoom).toBeCloseTo(BOARD.height * cam.zoom, 10);
    expect(cam.offsetY).toBe(cam.offsetX);
  });

  it('uses the smaller axis for fit (wide-but-short viewport)', () => {
    const cam = createCamera();
    // min(1200, 500) − 96 = 404 → desiredW 404.
    fitCamera(cam, { width: 1200, height: 500 }, BOARD, CLAMP);

    expect(cam.zoom).toBeCloseTo(404 / 568, 6);
  });
});

describe('applyCamera', () => {
  it('sets container position + scale from the camera', () => {
    const cam = { offsetX: 48, offsetY: 48, zoom: 1.5915 };
    const container = new Container();

    applyCamera(container, cam);

    expect(container.position.x).toBe(48);
    expect(container.position.y).toBe(48);
    expect(container.scale.x).toBeCloseTo(1.5915, 4);
    expect(container.scale.y).toBeCloseTo(1.5915, 4);
   });
});
