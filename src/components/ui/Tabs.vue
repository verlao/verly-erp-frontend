<script setup lang="ts">
import { computed, provide } from 'vue'

const props = defineProps<{
  modelValue?: string | number
  defaultValue?: string | number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const selectedTab = computed({
  get: () => props.modelValue ?? props.defaultValue ?? '',
  set: (value) => emit('update:modelValue', value)
})

provide('selectedTab', selectedTab)
</script>

<template>
  <div class="tabs-container">
    <slot :selected="selectedTab" />
  </div>
</template>
