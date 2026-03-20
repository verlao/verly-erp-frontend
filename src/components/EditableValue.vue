<template>
  <div class="editable-value">
    <div
      v-if="!edit.isEditing.value"
      @click="edit.startEdit"
      :class="cn(
        'cursor-pointer px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 group',
        compact ? 'px-2 py-1 text-sm' : 'text-base',
        displayClasses,
        props.class
      )"
    >
      <span :class="valueClasses">{{ formattedValue }}</span>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        :width="compact ? '12' : '14'" 
        :height="compact ? '12' : '14'" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        class="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        :class="iconClasses"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </div>

    <div v-else class="relative flex items-center gap-2">
      <div class="relative flex-1">
        <input
          :ref="(el) => edit.inputRef.value = el as HTMLInputElement"
          v-model="edit.inputValue.value"
          :type="inputType"
          :step="step"
          :min="min"
          :max="max"
          :class="cn(
            'w-full border-2 rounded-lg font-semibold shadow-sm transition-all duration-200',
            compact ? 'px-2 py-1 text-sm' : 'px-3 py-2 text-base',
            // Add right padding for non-percentage suffix
            suffix && !isPercentage ? (compact ? 'pr-8' : 'pr-10') : '',
            edit.error.value
              ? 'border-red-400 focus:ring-red-400 bg-red-50'
              : inputClasses,
            'focus:outline-none focus:ring-2'
          )"
          @blur="edit.saveEdit"
          @keydown="edit.handleKeydown"
        />
        
        <!-- Suffix inside input (only if not percentage mask) -->
        <span 
          v-if="suffix && !isPercentage"
          :class="cn(
            'absolute top-1/2 -translate-y-1/2 font-semibold whitespace-nowrap pointer-events-none select-none',
            compact ? 'text-xs right-1.5' : 'text-sm right-2',
            suffixColorClass
          )"
        >
          {{ suffix }}
        </span>
      </div>
      
      <!-- External suffix (fallback for when suffix prop is not used) -->
      <span 
        v-if="!suffix && (type === 'currency' || type === 'number')"
        :class="cn(
          'font-semibold whitespace-nowrap',
          compact ? 'text-xs' : 'text-sm',
          type === 'currency' ? 'text-green-600' : 'text-blue-600'
        )"
      >
        {{ type === 'currency' ? 'R$' : '%' }}
      </span>

      <div v-if="edit.error.value" class="absolute -bottom-6 left-0 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded shadow-sm">
        {{ edit.error.value }}
      </div>

      <div v-if="edit.isSaving.value" class="absolute right-2 top-1/2 -translate-y-1/2">
        <svg
          class="animate-spin h-4 w-4"
          :class="spinnerClasses"
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
import { computed, watch, ref } from 'vue'
import { useInlineEdit } from '../composables/useInlineEdit'
import { useCurrency } from '../composables/useCurrency'
import { usePercentageMask } from '../composables/usePercentageMask'
import { cn } from '../lib/utils'

type ColorVariant = 'blue' | 'green' | 'purple' | 'orange' | 'default'

const props = withDefaults(defineProps<{
  modelValue: number | string | null
  type?: 'text' | 'number' | 'currency'
  min?: number
  max?: number
  step?: number
  validator?: (value: any) => boolean | string
  class?: string
  variant?: ColorVariant
  compact?: boolean
  suffix?: string  // Custom suffix to display inside input (e.g., '%', '/m²', 'R$')
}>(), {
  type: 'text',
  step: 0.01,
  variant: 'default',
  compact: false,
  suffix: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: number | string]
  'save': [value: number | string]
}>()

const { formatCurrency, parseCurrency, formatInput } = useCurrency()
const { formatPercentage, parsePercentage, formatInput: formatPercentageInput } = usePercentageMask()

// Check if we should use percentage formatting
const isPercentage = computed(() => props.suffix === '%')

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
  
  if (isPercentage.value) {
    return formatPercentage(Number(props.modelValue))
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
    if (isPercentage.value) {
      return formatPercentageInput(Number(value))
    }
    return String(value)
  },
  parser: (input) => {
    if (props.type === 'currency') {
      return parseCurrency(input)
    }
    if (props.type === 'number' || isPercentage.value) {
      return parsePercentage(input)
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

// Variant-based styling
const variantStyles = {
  blue: {
    display: 'bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-200/50',
    value: 'text-blue-900',
    icon: 'text-blue-500',
    input: 'border-blue-300 focus:ring-blue-400 focus:border-blue-400 bg-blue-50/50',
    spinner: 'text-blue-600'
  },
  green: {
    display: 'bg-green-50 hover:bg-green-100 border border-green-200 hover:border-green-300 hover:shadow-md hover:shadow-green-200/50',
    value: 'text-green-900',
    icon: 'text-green-500',
    input: 'border-green-300 focus:ring-green-400 focus:border-green-400 bg-green-50/50',
    spinner: 'text-green-600'
  },
  purple: {
    display: 'bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 hover:shadow-md hover:shadow-purple-200/50',
    value: 'text-purple-900',
    icon: 'text-purple-500',
    input: 'border-purple-300 focus:ring-purple-400 focus:border-purple-400 bg-purple-50/50',
    spinner: 'text-purple-600'
  },
  orange: {
    display: 'bg-orange-50 hover:bg-orange-100 border border-orange-200 hover:border-orange-300 hover:shadow-md hover:shadow-orange-200/50',
    value: 'text-orange-900',
    icon: 'text-orange-500',
    input: 'border-orange-300 focus:ring-orange-400 focus:border-orange-400 bg-orange-50/50',
    spinner: 'text-orange-600'
  },
  default: {
    display: 'bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 hover:shadow-md',
    value: 'text-gray-900',
    icon: 'text-gray-500',
    input: 'border-gray-300 focus:ring-blue-400 focus:border-blue-400 bg-gray-50/50',
    spinner: 'text-blue-600'
  }
}

const displayClasses = computed(() => variantStyles[props.variant].display)
const valueClasses = computed(() => variantStyles[props.variant].value)
const iconClasses = computed(() => variantStyles[props.variant].icon)
const inputClasses = computed(() => variantStyles[props.variant].input)
const spinnerClasses = computed(() => variantStyles[props.variant].spinner)

// Get suffix color based on variant
const suffixColorClass = computed(() => {
  const variantColors: Record<ColorVariant, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    default: 'text-gray-600'
  }
  
  if (props.type === 'currency') {
    return 'text-green-600'
  }
  
  return variantColors[props.variant]
})
</script>

<style scoped>
.editable-value {
  min-width: 80px;
  position: relative;
}
</style>
