<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '../../lib/utils'

const props = defineProps<{
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'
  class?: HTMLAttributes['class']
}>()

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
    case 'destructive':
      return 'bg-destructive text-destructive-foreground hover:bg-destructive/80'
    case 'outline':
      return 'border border-input bg-background hover:bg-accent'
    case 'success':
      return 'bg-green-500 text-white hover:bg-green-600'
    case 'warning':
      return 'bg-yellow-500 text-white hover:bg-yellow-600'
    case 'info':
      return 'bg-blue-500 text-white hover:bg-blue-600'
    default:
      return 'bg-primary text-primary-foreground hover:bg-primary/80'
  }
})
</script>

<template>
  <div
    :class="cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      variantClasses,
      props.class
    )"
  >
    <slot />
  </div>
</template>
