<script setup lang="ts">
import { type HTMLAttributes } from 'vue'
import { cn } from '../../lib/utils'

const props = defineProps<{
  orientation?: 'horizontal' | 'vertical'
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    :class="cn(
      'shrink-0 bg-border',
      props.orientation === 'vertical' ? 'h-full w-[1px]' : 'h-[1px] w-full',
      props.class
    )"
  />
</template>
