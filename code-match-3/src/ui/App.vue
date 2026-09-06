<script setup lang="ts">
/**
 * ui/App.vue — HUD root component
 *
 * Renders a Card-based HUD using shadcn-vue Button + Card components.
 * Passively displays the GameModel via provide/inject.
 * Actions call through provided callbacks.
 */

import { inject } from 'vue';
import {
   modelKey,
   sendCommandKey,
   loopKey,
   type GameModel,
} from './model';
import type { CommandMap } from '@/types';
import type { GameLoop } from '@/kernel';
import {
   Button,
   Card,
   CardHeader,
   CardTitle,
   CardContent,
   CardFooter,
} from '@/ui/components';

const model: GameModel | null = inject<GameModel | null>(modelKey, null);
const sendCommand:
   ((cmd: CommandMap[keyof CommandMap]) => void) | null
   = inject<((cmd: CommandMap[keyof CommandMap]) => void) | null>(sendCommandKey, null);
const loop: GameLoop | null = inject<GameLoop | null>(loopKey, null);

function destroySelected(): void {
   const eid = model?.selectedEntity.value;
   if (eid === null || eid === undefined) return;
   sendCommand?.({ type: 'destroyEntity', entityId: eid });
}

function togglePause(): void {
   if (!loop) return;
   if (loop.paused) {
      loop.resume();
   } else {
      loop.pause();
   }
}
</script>

<template>
   <div id="hud" class="pointer-events-auto">
      <Card class="bg-black/70 text-[#eee] border-white/20">
         <CardHeader>
            <CardTitle class="text-sm">
               Match-3 Debug
            </CardTitle>
         </CardHeader>

         <CardContent class="space-y-1 text-sm font-mono">
            <p>
               Selected: <strong>{{ model?.selectedEntity.value ?? '—' }}</strong>
            </p>
            <p>
               Score: {{ model?.score.value }}
            </p>
         </CardContent>

         <CardFooter class="flex-col items-stretch gap-2">
            <Button
               variant="destructive"
               size="sm"
               :disabled="!model?.selectedEntity.value"
               @click="destroySelected"
            >
               Destroy Selected
            </Button>
            <Button
               variant="outline"
               size="sm"
               @click="togglePause"
            >
               {{ loop?.paused ? 'Resume' : 'Pause' }}
            </Button>
         </CardFooter>
      </Card>
   </div>
</template>

<style scoped>
#hud {
   position: fixed;
   top: 12px;
   left: 12px;
   min-width: 180px;
}
</style>
