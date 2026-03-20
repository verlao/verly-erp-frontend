<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '../../lib/utils'

const props = defineProps<{
  modelValue?: string | number
  placeholder?: string
  disabled?: boolean
  class?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const value = computed({
  get: () => props.modelValue,
  set: (newValue) => emit('update:modelValue', newValue as string | number)
})
</script>

<template>
  <select
    v-model="value"
    :disabled="disabled"
    :class="cn(
      'flex h-11 sm:h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2.5 sm:py-2 text-base sm:text-sm ring-offset-background placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      props.class
    )"
  >
    <option value="" v-if="placeholder" disabled selected hidden>{{ placeholder }}</option>
    <slot />
  </select>
</template>
