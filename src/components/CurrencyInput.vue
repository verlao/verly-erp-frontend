<template>
  <Input
    v-model="displayValue"
    type="text"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="props.class"
    @input="handleInput"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Input from './ui/Input.vue'
import { useCurrency } from '../composables/useCurrency'

const props = defineProps<{
  modelValue?: number | null
  placeholder?: string
  disabled?: boolean
  class?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const { handleCurrencyInput, formatCurrency } = useCurrency()
const displayValue = ref('')

// Initialize display value
watch(() => props.modelValue, (newValue) => {
  if (newValue !== null && newValue !== undefined) {
    displayValue.value = formatCurrency(newValue)
  } else {
    displayValue.value = ''
  }
}, { immediate: true })

const handleInput = (event: Event) => {
  const result = handleCurrencyInput(event)
  displayValue.value = result.display
  emit('update:modelValue', result.value)
}

const handleBlur = () => {
  // Ensure proper formatting on blur
  if (props.modelValue !== null && props.modelValue !== undefined) {
    displayValue.value = formatCurrency(props.modelValue)
  }
}
</script>
