<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '../../lib/utils'

const props = defineProps<{
  name?: string
  src?: string
  class?: HTMLAttributes['class']
}>()

const initials = computed(() => {
  if (!props.name) return '?'
  const names = props.name.split(' ')
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase()
  }
  return names[0][0].toUpperCase()
})
</script>

<template>
  <div
    :class="cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      props.class
    )"
  >
    <img
      v-if="src"
      :src="src"
      :alt="name"
      class="aspect-square h-full w-full object-cover"
    />
    <div
      v-else
      class="flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground"
    >
      {{ initials }}
    </div>
  </div>
</template>
