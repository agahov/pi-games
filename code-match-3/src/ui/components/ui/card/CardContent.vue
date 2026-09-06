<script setup lang="ts">
/**
 * shadcn-vue style CardContent
 */

import { cn } from '@/lib/utils';

const props = withDefaults(defineProps<{
   class?: string;
}>(), {
   class: '',
});
</script>

<template>
   <div :class="cn('space-y-0', props.class)">
      <slot />
    </div>
 </template>
