<script setup lang="ts">
/**
 * shadcn-vue style CardTitle
 */

import { cn } from '@/lib/utils';

const props = withDefaults(defineProps<{
   class?: string;
}>(), {
   class: '',
});
</script>

<template>
   <h3 :class="cn('text-base font-semibold leading-none tracking-tight', props.class)">
      <slot />
    </h3>
 </template>
