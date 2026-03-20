<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '../../lib/utils'

const props = defineProps<{
  modelValue?: boolean
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isChecked = computed(() => props.modelValue)

const toggle = () => {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="isChecked"
    :disabled="disabled"
    @click="toggle"
    :class="cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      isChecked ? 'bg-primary text-primary-foreground' : 'bg-background',
      props.class
    )"
  >
    <svg
      v-if="isChecked"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-4 w-4"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </button>
</template>
