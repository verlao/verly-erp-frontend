<script setup lang="ts">
import { type HTMLAttributes, provide, ref } from 'vue'
import { cn } from '../../lib/utils'

const props = defineProps<{
  value: string
  class?: HTMLAttributes['class']
}>()

const isOpen = ref(false)

provide('accordionItem', {
  value: props.value,
  isOpen,
  toggle: () => {
    isOpen.value = !isOpen.value
  }
})
</script>

<template>
  <div
    :class="cn(
      'border rounded-lg overflow-hidden transition-all duration-200',
      props.class
    )"
  >
    <slot />
  </div>
</template>

