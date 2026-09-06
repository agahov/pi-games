<script setup lang="ts">
/**
 * shadcn-vue style CardDescription
 */

import { cn } from '@/lib/utils';

const props = withDefaults(defineProps<{
   class?: string;
}>(), {
   class: '',
});
</script>

<template>
   <p :class="cn('text-sm text-muted-foreground', props.class)">
      <slot />
    </p>
 </template>
