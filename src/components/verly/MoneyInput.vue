<template>
  <div class="grid gap-1.5">
    <label :for="inputId" class="text-[15px] font-medium text-verly-ink">{{ label }}</label>
    <input
      :id="inputId"
      :value="displayValue"
      type="text"
      inputmode="decimal"
      placeholder="Digite o valor"
      :disabled="disabled"
      :aria-invalid="hasError ? 'true' : undefined"
      :aria-describedby="describedBy"
      class="min-h-11 w-full rounded-md border border-verly-muted/50 bg-verly-background px-3 py-2 font-verly-mono text-[17px] text-verly-ink placeholder:font-normal placeholder:text-verly-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verly-glass disabled:cursor-not-allowed disabled:opacity-50"
      @input="handleInput"
      @blur="handleBlur"
    />
    <p v-if="hint" :id="hintId" class="text-[15px] text-verly-muted">{{ hint }}</p>
    <p v-if="visibleError" :id="errorId" class="text-[15px] text-verly-overdue" role="alert">
      {{ visibleError }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { formatBRL, parseBRL } from '@/lib/money'

const props = defineProps<{
  modelValue: number | null
  label: string
  id?: string
  disabled?: boolean
  error?: string
  hint?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  invalid: [value: boolean]
}>()

const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)
const hintId = computed(() => `${inputId.value}-hint`)
const errorId = computed(() => `${inputId.value}-error`)
const displayValue = ref(props.modelValue === null ? '' : safeDisplay(props.modelValue))
const locallyInvalid = ref(props.modelValue !== null && !Number.isSafeInteger(props.modelValue))
let emittedValue: number | null | undefined

function safeDisplay(value: number): string {
  return Number.isSafeInteger(value) ? formatBRL(value) : ''
}

const visibleError = computed(() => props.error || (locallyInvalid.value ? 'Digite um valor válido' : ''))
const hasError = computed(() => Boolean(visibleError.value))
const describedBy = computed(() => {
  const ids = []
  if (props.hint) ids.push(hintId.value)
  if (hasError.value) ids.push(errorId.value)
  return ids.length ? ids.join(' ') : undefined
})

function setInvalid(value: boolean) {
  locallyInvalid.value = value
  emit('invalid', value)
}

function handleInput(event: Event) {
  const text = (event.target as HTMLInputElement).value
  displayValue.value = text
  if (text.trim() === '') {
    setInvalid(false)
    emittedValue = null
    emit('update:modelValue', null)
    return
  }

  const cents = parseBRL(text)
  if (cents === null || !Number.isSafeInteger(cents)) {
    setInvalid(true)
    emittedValue = undefined
    return
  }

  setInvalid(false)
  emittedValue = cents
  emit('update:modelValue', cents)
}

function handleBlur() {
  if (locallyInvalid.value) return
  const cents = parseBRL(displayValue.value)
  if (displayValue.value.trim() === '') return
  if (cents !== null && Number.isSafeInteger(cents)) displayValue.value = formatBRL(cents)
}

watch(() => props.modelValue, (value) => {
  if (emittedValue !== undefined && value === emittedValue) {
    emittedValue = undefined
    return
  }
  displayValue.value = value === null ? '' : safeDisplay(value)
  locallyInvalid.value = value !== null && !Number.isSafeInteger(value)
})
</script>
