/**
 * src/main.ts — Composition root
 *
 * The single wiring file. Creates all layers, registers systems, builds the
 * board, wires the camera to the viewport, and starts everything.
 *
 * After this, `pnpm dev` shows an 8×8 grid of 64 cells, centered on screen and
 * scaled to fit the viewport (clamped to [360, 960] px wide), that stays centered
 * on window resize.
 */

import { createApp, provide, h, type App as VueApp } from 'vue';
import '@/index.css';
import { Container, type Graphics } from 'pixi.js';
import { createEcs }                   from './ecs/world';
import {
    createTypedBus,
     createCommandQueue,
      createGameLoop, Phase,
       createLogger, DOMAINS,
        type GameLoop,
        } from './kernel';
import { createPixiApp, type PixiApp } from './pixi/scene';
import { wirePointerInput }            from './pixi/input';
import {
    createCamera,
     fitCamera,
      applyCamera,
       type Camera,
       type Viewport,
      } from './pixi/camera';
import { handleCommand }               from './ecs/systems/input-system';
import { buildBoard, type BoardConfig } from './ecs/systems/board';
import {
    renderSyncSystem,
     removeRenderSystem,
      removeWorldSystem,
      } from './ecs/systems/render-system';
import {
   modelKey,
    sendCommandKey,
     loopKey,
      createGameModel,
       } from './ui/model';
import {
  CONTROL_TYPES,
   type CommandMap,
    type GameEventMap,
    } from './types';
import App from './ui/App.vue';

/* ── Loggers ───────────────────────────────────────────────────────────── */

const logInit   = createLogger([DOMAINS.init]);
const logLoop   = createLogger([DOMAINS.loop]);
const logRender = createLogger([DOMAINS.render]);

/* ── Board + camera config (single source of truth, the composition root) ── */

/** World-space 8×8 layout. */
export const BOARD: BoardConfig = { cols: 8, rows: 8, cellSize: 64, gap: 8 };
/** On-screen camera clamp. */
export const CAMERA_CLAMP = { minWidth: 360, maxWidth: 960, padding: 48 };

/** Derive the board's world-space size from the config (square grid). */
const STRIDE = BOARD.cellSize + BOARD.gap;
const BOARD_SIZE = {
  width: BOARD.cols * STRIDE - BOARD.gap,
  height: BOARD.rows * STRIDE - BOARD.gap,
};

/* ── State ────────────────────────────────────────────────────────────────*/

const ecs          = createEcs();
const bus          = createTypedBus<GameEventMap>();
const queue        = createCommandQueue<CommandMap>(CONTROL_TYPES);
const containerMap = new Map<number, Graphics>();

const camera: Camera = createCamera();
let cameraContainer: Container;

let loop: GameLoop;
let app: PixiApp;

/* ── Camera ↔ viewport ──────────────────────────────────────────────────── */

/** Read the real viewport and (re)compute the camera so the board re-centers. */
function fitBoard(): void {
  const viewport: Viewport = {
    width: app.renderer.width || window.innerWidth,
    height: app.renderer.height || window.innerHeight,
    };
  fitCamera(camera, viewport, BOARD_SIZE, CAMERA_CLAMP);
}

/* ── Board scene ──────────────────────────────────────────────────────────*/

/**
 * Build the 8×8 playfield: 64 `Position`+`Visual` cells in fixed world space.
 * Rendering of the cells into the camera container happens automatically in the
 * per-frame `renderSyncSystem`; the camera centers + scales that container.
 */
function createBoardScene(): void {
  const ids = buildBoard(ecs, BOARD);
  logInit.info(`board scene: ${ids.length} cells created`);
}

/* ── Main ───────────────────────────────────────────────────────────────── */

async function main(): Promise<void> {
  logInit.info('initialising Pixi app');
  app = await createPixiApp();

     /* Camera container: holds the cells; root stage stays untransformed. */
  cameraContainer = new Container();
  app.stage.addChild(cameraContainer);

       /* Game loop */
  loop = createGameLoop<CommandMap>(
      app.ticker,
      queue,
          (cmd) => {
            logLoop.debug(`handling command: ${cmd.type}`);
            handleCommand(cmd, ecs, bus);
            },
          bus,
          );

            /* Render systems (all in RENDER phase, in order) */
        loop.addSystem(() => {
            logRender.trace('renderSyncSystem tick');
            renderSyncSystem(ecs, containerMap, cameraContainer);
            }, Phase.RENDER);

        /* Camera: apply its current transform each frame. */
        loop.addSystem(() => {
          applyCamera(cameraContainer, camera);
          }, Phase.RENDER);

        loop.addSystem(
             () => removeRenderSystem(ecs, containerMap, cameraContainer),
             Phase.RENDER,
                );

        loop.addSystem(() => removeWorldSystem(ecs), Phase.RENDER);

              /* Pointer input */
        logInit.info('wiring pointer input');
        wirePointerInput(app.stage, queue);

               /* Build board + first fit. */
        createBoardScene();
        fitBoard();
        window.addEventListener('resize', fitBoard);

                /* Vue HUD */
        const model = createGameModel(bus);
        const vueApp: VueApp = createApp({
            setup() {
              provide(modelKey, model);
              provide(sendCommandKey, (cmd: CommandMap[keyof CommandMap]) => {
                logLoop.debug(`pushing command: ${cmd.type}`);
                queue.push(cmd);
                });
              provide(loopKey, loop);
              return () => h(App);
              },
            });

                       const uiMount = document.querySelector('#ui-layer');
                        if (uiMount) {
                          vueApp.mount(uiMount);
                          logInit.info('Vue HUD mounted to #ui-layer');
                            } else {
              console.error('[main] #ui-layer not found');
                      }

                         /* Start */
        logInit.info('starting game loop');
        loop.start();
}

main().catch((err) => {
  console.error('[main] fatal error:', err);
    });
