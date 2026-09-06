/**
 * src/main.ts — Composition root
 *
 * The single wiring file. Creates all layers, registers systems,
 * populates the PoC scene, and starts everything.
 *
 * After this, `pnpm dev` shows a 3×3 grid of colored tiles that respond
 * to clicks, with a HUD showing the selected entity.
 */

import { createApp, provide, h, type App as VueApp } from 'vue';
import '@/index.css';
import type { Graphics } from 'pixi.js';
import { createEcs }                  from './ecs/world';
import {
   createTypedBus,
    createCommandQueue,
     createGameLoop, Phase,
     createLogger, DOMAINS,
     type GameLoop,
       } from './kernel';
import { createPixiApp, type PixiApp }from './pixi/scene';
import { wirePointerInput }           from './pixi/input';
import { handleCommand }              from './ecs/systems/input-system';
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

/* ── State ────────────────────────────────────────────────────────────────*/

const ecs           = createEcs();
const bus           = createTypedBus<GameEventMap>();
const queue         = createCommandQueue<CommandMap>(CONTROL_TYPES);
const containerMap  = new Map<number, Graphics>();

let loop: GameLoop;
let app: PixiApp;

/* ── PoC scene: 3×3 grid ─────────────────────────────────────────────────*/

function createPoCScene(): void {
  const cellSize= 80;
  const colors = [
    0xff3355, 0x33ff88, 0x3388ff,
    0xffcc33, 0xff33ff, 0x33ddff,
    0xff6633, 0x66ff33, 0x6633ff,
                     ];
  for (let row= 0; row < 3; row++) {
    for (let col= 0; col < 3; col++) {
      const id= ecs.createEntity();
      const x= col* cellSize + cellSize / 2 + 160;
      const y= row* cellSize + cellSize / 2 + 100;
      ecs.addPosition(id, x, y);
      ecs.addVisual(id, colors[row * 3 + col]!, cellSize - 8);
      logLoop.debug(`created entity ${id} at (${x}, ${y})`);
      }
     }
  logInit.info('PoC scene: 9 entities created');
}

/* ── Main ───────────────────────────────────────────────────────────────── */

async function main(): Promise<void> {
  logInit.info('initialising Pixi app');
  app= await createPixiApp();

      /* Game loop */
  loop= createGameLoop<CommandMap>(
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
        renderSyncSystem(ecs, containerMap, app.stage);
          }, Phase.RENDER);

        loop.addSystem(
            () => removeRenderSystem(ecs, containerMap, app.stage),
             Phase.RENDER,
               );

        loop.addSystem(() => removeWorldSystem(ecs), Phase.RENDER);

             /* Pointer input */
        logInit.info('wiring pointer input');
        wirePointerInput(app.stage, queue);

              /* Create PoC scene */
        createPoCScene();

               /* Vue HUD */
        const model= createGameModel(bus);
        const vueApp: VueApp= createApp({
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
