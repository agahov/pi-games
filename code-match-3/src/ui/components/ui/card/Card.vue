<script setup lang="ts">
/**
 * shadcn-vue style Card — outer container
 */

import { cn } from '@/lib/utils';

const props = withDefaults(defineProps<{
   class?: string;
}>(), {
   class: '',
});
</script>

<template>
   <div
      :class="cn(
       'rounded-lg border border-border bg-background p-6 text-foreground shadow-sm',
    props.class,
   )"
   >
     <slot />
    </div>
 </template>
