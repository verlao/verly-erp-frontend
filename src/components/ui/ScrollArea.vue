<script setup lang="ts">
import { type HTMLAttributes } from 'vue'
import { cn } from '../../lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  height?: string
}>()
</script>

<template>
  <div
    :class="cn('relative overflow-auto', props.class)"
    :style="{ height: props.height }"
  >
    <slot />
  </div>
</template>
