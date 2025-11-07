<template>
  <div class="flex items-center space-x-2">
    <label for="page-size" class="text-sm text-gray-700">
      Itens por página:
    </label>
    <Select
      :model-value="String(modelValue)"
      @update:model-value="handleChange"
      class="w-20"
    >
      <template #trigger="{ value }">
        <span>{{ value }}</span>
      </template>
      <SelectItem
        v-for="option in options"
        :key="option"
        :value="String(option)"
      >
        {{ option }}
      </SelectItem>
    </Select>
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import Select from './ui/Select.vue'
import SelectItem from './ui/SelectItem.vue'

const props = withDefaults(defineProps<{
  modelValue?: number
  options?: number[]
}>(), {
  modelValue: 10,
  options: () => [10, 25, 50, 100]
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

// Provide emit and close functions for SelectItem
provide('select-emit', (event: string, value: string | number) => {
  if (event === 'update:modelValue') {
    handleChange(value)
  }
})

const selectRef = { isOpen: false, close: () => {} }
provide('select-close', () => {
  if (selectRef && typeof selectRef.close === 'function') {
    selectRef.close()
  }
})

const handleChange = (value: string | number) => {
  const numValue = typeof value === 'string' ? parseInt(value) : value
  emit('update:modelValue', numValue)
}
</script>
