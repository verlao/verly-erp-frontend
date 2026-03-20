<script setup lang="ts">
import { ref } from 'vue'
import { type HTMLAttributes } from 'vue'
import { cn } from '../../lib/utils'

const props = defineProps<{
  content?: string
  class?: HTMLAttributes['class']
}>()

const isVisible = ref(false)
</script>

<template>
  <div class="relative inline-block">
    <div
      @mouseenter="isVisible = true"
      @mouseleave="isVisible = false"
      @focus="isVisible = true"
      @blur="isVisible = false"
    >
      <slot />
    </div>
    <Transition name="tooltip">
      <div
        v-if="isVisible && content"
        :class="cn(
          'absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md',
          props.class
        )"
      >
        {{ content }}
        <div class="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-4 border-transparent border-t-popover"></div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.15s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}
</style>
