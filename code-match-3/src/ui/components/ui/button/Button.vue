<script setup lang="ts">
/**
 * shadcn-vue style Button
 *
 * Variants: default | destructive | outline | ghost
 * Sizes:    default | sm | lg | icon
 */

import { computed } from 'vue';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/* ─── Props ─────────────────────────────────────────────────────────────── */

const props = withDefaults(defineProps<{
   class?: string;
   variant?: 'default' | 'destructive' | 'outline' | 'ghost';
   size?: 'default' | 'sm' | 'lg' | 'icon';
   disabled?: boolean;
}>(), {
   variant: 'default',
   size: 'default',
   disabled: false,
});

const emit = defineEmits<{
 (e: 'click', ev: MouseEvent): void;
}>();

/* ─── Variants ──────────────────────────────────────────────────────────── */

const buttonVariants = cva(
      'inline-flex items-center justify-center rounded-md text-sm font-medium '
  + 'transition-colors '
  + 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring '
  + 'focus-visible:ring-offset-2 focus-visible:ring-offset-background '
  + 'disabled:pointer-events-none disabled:opacity-50',
      {
       variants: {
         variant: {
           default:     'bg-primary text-primary-foreground hover:bg-primary/90',
            destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            outline:     'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
            ghost:       'hover:bg-accent hover:text-accent-foreground',
          },
         size: {
           default: 'h-10 px-4 py-2',
            sm:    'h-8 rounded-md px-3 text-xs',
            lg:    'h-11 rounded-md px-8',
            icon:  'h-10 w-10',
          },
        },
       defaultVariants: {
         variant: 'default',
          size:    'default',
        },
      },
      );

const rootClass = computed(() => cn(
   buttonVariants({ variant: props.variant, size: props.size }),
   props.class,
   ));
</script>

<template>
   <button
        :class="rootClass"
        :disabled="disabled"
        type="button"
        @click="emit('click', $event)"
   >
      <slot />
   </button>
   </template>
