/**
 * pixi/scene.ts — PixiJS Application factory
 *
 * Creates a `PIXI.Application`, mounts its canvas into `#canvas-layer`,
 * and keeps the renderer in sync with the window.
 *
 * No game logic here — only rendering scaffolding.
 */

import {
  Application,
  type Renderer,
  type Container,
  type FederatedPointerEvent,
} from 'pixi.js';
import type { Ticker } from '../kernel';

/**
 * The Pixi application context — the renderer, stage, and ticker
 * exposed to the render systems and input system.
 */
export interface PixiApp {
    /** Root container. Add/remove game objects here. */
  stage: Container;
    /** Pixi Ticker as our kernel `Ticker` interface. */
  ticker: Ticker;
    /** The Pixi renderer (for future use). */
  renderer: Renderer;
    /** The DOM canvas element. */
  canvas: HTMLCanvasElement;
    /** Clean up: destroy renderer, remove canvas. */
  destroy: () => void;
}

/**
 * Create and initialise a Pixi application.
 *
 * @param targetId — the DOM element id to mount the canvas into.
 *                Defaults to `'#canvas-layer'`.
 */
export async function createPixiApp(targetId = '#canvas-layer'): Promise<PixiApp> {
  const app = new Application();
  await app.init({
    antialias: true,
    autoDensity: true,
    resizeTo: window,
  });

   // Mount the canvas in the target DOM element.
  const mount = document.querySelector(targetId);
  if (!mount) throw new Error(`Pixi mount target not found: ${targetId}`);
   (mount as HTMLElement).append(app.canvas);

   // Wrap the Pixi Ticker as our kernel Ticker interface.
   // Pixi's add/remove return `this`; our kernel Ticker expects void returns.
   // The structural shape is compatible; extra `this` return is a no-op cast.
  const kernelTicker: Ticker = {
    add: (cb) => { app.ticker.add(cb); },
    remove: (cb) => { app.ticker.remove(cb); },
    start: () => app.ticker.start(),
    stop: () => app.ticker.stop(),
  };

  return {
    stage: app.stage,
    ticker: kernelTicker,
    renderer: app.renderer,
    canvas: app.canvas,
    destroy() {
      app.destroy(true, { children: true });
    },
  };
}

/* ── Module augmentation — Container.entityId ─────────────────────────────── */

declare module 'pixi.js' {
  interface Container {
    /** Entity ID associated with this container. Set by the render system. */
    entityId?: number;
  }
}

export type { FederatedPointerEvent };
