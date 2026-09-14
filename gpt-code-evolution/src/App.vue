<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Composition } from './composition'

const gameHost = ref<HTMLElement | null>(null)
const mountError = ref<string | null>(null)
let composition: Composition | null = null

onMounted(() => {
  if (!gameHost.value) return

  composition = new Composition(gameHost.value)
  void composition.mount().catch((error: unknown) => {
    const detail = error instanceof Error ? error.message : String(error)
    mountError.value = detail
      ? `Game failed to initialize: ${detail}`
      : 'Game failed to initialize.'
  })
})

onBeforeUnmount(() => {
  composition?.dispose()
  composition = null
})
</script>

<template>
  <main
    ref="gameHost"
    class="game-host"
    data-testid="game-host"
    aria-label="Game area"
  >
    <p v-if="mountError" class="mount-error" data-testid="mount-error" role="alert">
      {{ mountError }}
    </p>
  </main>
</template>

<style scoped>
.game-host {
  background: #162033;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.game-host :deep(canvas) {
  display: block;
}

.mount-error {
  color: #fecaca;
  font: 1rem/1.5 system-ui, sans-serif;
  inset: 1rem;
  margin: 0;
  position: absolute;
}
</style>
