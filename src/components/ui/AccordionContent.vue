<script setup lang="ts">
import { type HTMLAttributes, inject } from 'vue'
import { cn } from '../../lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const accordionItem = inject<any>('accordionItem')

const onEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.maxHeight = '0'
  window.requestAnimationFrame(() => {
    element.style.maxHeight = element.scrollHeight + 'px'
  })
}

const onLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.maxHeight = element.scrollHeight + 'px'
  window.requestAnimationFrame(() => {
    element.style.maxHeight = '0'
  })
}

const onAfterEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.maxHeight = 'none'
}
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out overflow-hidden"
    enter-from-class="max-h-0 opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in overflow-hidden"
    leave-from-class="opacity-100"
    leave-to-class="max-h-0 opacity-0"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @leave="onLeave"
  >
    <div
      v-show="accordionItem?.isOpen.value"
      :class="cn(
        'overflow-hidden text-sm transition-all border-t',
        props.class
      )"
    >
      <div class="pb-4 pt-0 px-4 md:px-6">
        <slot />
      </div>
    </div>
  </Transition>
</template>

