<script setup lang="ts">
import { inject } from 'vue'
import { cn } from '../../lib/utils'

const props = defineProps<{
  value: string | number
  disabled?: boolean
  class?: string
}>()

const emit = inject('select-emit') as (event: 'update:modelValue', value: string | number) => void
const close = inject('select-close') as () => void

const handleClick = () => {
  if (!props.disabled && emit) {
    emit('update:modelValue', props.value)
    close()
  }
}
</script>

<template>
  <div
    @click="handleClick"
    :class="cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      disabled && 'pointer-events-none opacity-50',
      props.class
    )"
  >
    <slot />
  </div>
</template>
