<template>
  <div 
    :class="cn('animate-pulse rounded-md bg-muted', className)"
    :style="{ width, height }"
  />
</template>

<script setup lang="ts">
import { cn } from '../../lib/utils'

withDefaults(defineProps<{
  className?: string
  width?: string
  height?: string
}>(), {
  className: '',
  width: '100%',
  height: '1rem'
})
</script>