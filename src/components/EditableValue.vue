<template>
  <div class="editable-value">
    <div
      v-if="!edit.isEditing.value"
      @click="edit.startEdit"
      :class="cn(
        'cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors',
        props.class
      )"
    >
      <span v-if="type === 'currency'">{{ formattedValue }}</span>
      <span v-else-if="type === 'number'">{{ edit.value.value }}</span>
      <span v-else>{{ edit.value.value }}</span>
    </div>

    <div v-else class="relative">
      <input
        :ref="(el) => edit.inputRef.value = el as HTMLInputElement"
        v-model="edit.inputValue.value"
        :type="inputType"
        :step="step"
        :min="min"
        :max="max"
        :class="cn(
          'w-full px-2 py-1 border rounded text-sm',
          edit.error.value
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500',
          'focus:outline-none focus:ring-2'
        )"
        @blur="edit.saveEdit"
        @keydown="edit.handleKeydown"
      />

      <div v-if="edit.error.value" class="absolute -bottom-5 left-0 text-xs text-red-600">
        {{ edit.error.value }}
      </div>

      <div v-if="edit.isSaving.value" class="absolute right-2 top-1/2 -translate-y-1/2">
        <svg
          class="animate-spin h-4 w-4 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useInlineEdit } from '../composables/useInlineEdit'
import { useCurrency } from '../composables/useCurrency'
import { cn } from '../lib/utils'

const props = withDefaults(defineProps<{
  modelValue: number | string | null
  type?: 'text' | 'number' | 'currency'
  min?: number
  max?: number
  step?: number
  validator?: (value: any) => boolean | string
  class?: string
}>(), {
  type: 'text',
  step: 0.01
})

const emit = defineEmits<{
  'update:modelValue': [value: number | string]
  'save': [value: number | string]
}>()

const { formatCurrency, parseCurrency, formatInput } = useCurrency()

// Determine input type based on component type
const inputType = computed(() => {
  if (props.type === 'currency' || props.type === 'number') {
    return 'text' // Use text for better control over formatting
  }
  return 'text'
})

// Format value for display
const formattedValue = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) {
    return '-'
  }

  if (props.type === 'currency') {
    return formatCurrency(Number(props.modelValue))
  }

  return String(props.modelValue)
})

// Setup inline edit composable
const edit = useInlineEdit({
  initialValue: props.modelValue ?? 0,
  formatter: (value) => {
    if (props.type === 'currency') {
      return formatInput(Number(value))
    }
    return String(value)
  },
  parser: (input) => {
    if (props.type === 'currency') {
      return parseCurrency(input)
    }
    if (props.type === 'number') {
      const num = parseFloat(input)
      return isNaN(num) ? 0 : num
    }
    return input
  },
  validator: (value) => {
    if (props.validator) {
      return props.validator(value)
    }

    if (props.type === 'number' || props.type === 'currency') {
      const num = Number(value)
      if (isNaN(num)) {
        return 'Valor inválido'
      }
      if (props.min !== undefined && num < props.min) {
        return `Valor mínimo: ${props.min}`
      }
      if (props.max !== undefined && num > props.max) {
        return `Valor máximo: ${props.max}`
      }
    }

    return true
  },
  onSave: async (value) => {
    emit('update:modelValue', value)
    emit('save', value)
  }
})

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (!edit.isEditing.value && newValue !== edit.value.value) {
    edit.setValue(newValue ?? 0)
  }
})
</script>

<style scoped>
.editable-value {
  min-width: 80px;
  position: relative;
}
</style>
