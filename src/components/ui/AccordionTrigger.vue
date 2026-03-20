<script setup lang="ts">
import { type HTMLAttributes, inject } from 'vue'
import { cn } from '../../lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const accordionItem = inject<any>('accordionItem')
</script>

<template>
  <button
    type="button"
    :class="cn(
      'flex w-full items-center justify-between py-4 px-4 md:px-6 font-medium transition-all hover:underline text-left',
      '[&[data-state=open]>svg]:rotate-180',
      props.class
    )"
    :data-state="accordionItem?.isOpen.value ? 'open' : 'closed'"
    @click="accordionItem?.toggle"
  >
    <slot />
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="shrink-0 transition-transform duration-200"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </button>
</template>

