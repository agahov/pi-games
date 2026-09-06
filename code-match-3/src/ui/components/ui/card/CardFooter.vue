<script setup lang="ts">
/**
 * shadcn-vue style CardFooter
 */

import { cn } from '@/lib/utils';

const props = withDefaults(defineProps<{
   class?: string;
}>(), {
   class: '',
});
</script>

<template>
   <div :class="cn('flex items-center pt-4', props.class)">
      <slot />
    </div>
 </template>
