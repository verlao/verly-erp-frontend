<template>
  <div class="editable-cell">
    <div v-if="!editing" @click="startEditing" class="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded">
      <span v-if="isMoney">R$ {{ formatMoney(displayValue) }}</span>
      <span v-else-if="isPercent">{{ displayValue }}%</span>
      <span v-else>{{ displayValue }}</span>
    </div>
    <input 
      v-else
      ref="inputRef"
      v-model="inputValue"
      type="number"
      step="0.01"
      min="0"
      class="w-full px-2 py-1 border border-input bg-background text-foreground rounded focus:outline-none focus:ring-2 focus:ring-ring text-sm"
      @blur="handleBlur"
      @keydown.enter="handleEnter"
      @keydown.escape="cancelEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

interface Props {
  cost: any
  field: string
  isMoney?: boolean
  isPercent?: boolean
}

interface Emits {
  update: [field: string, value: any]
}

const props = withDefaults(defineProps<Props>(), {
  isMoney: false,
  isPercent: false
})

const emit = defineEmits<Emits>()

const editing = ref(false)
const inputValue = ref('')
const inputRef = ref<HTMLInputElement>()

const displayValue = computed(() => {
  const value = props.cost[props.field]
  return value ?? 0
})

const formatMoney = (value: number) => {
  return value.toFixed(2).replace('.', ',')
}

const startEditing = async () => {
  editing.value = true
  inputValue.value = String(displayValue.value)
  await nextTick()
  inputRef.value?.focus()
  inputRef.value?.select()
}

const handleBlur = () => {
  if (editing.value) {
    saveValue()
  }
}

const handleEnter = () => {
  saveValue()
}

const cancelEdit = () => {
  editing.value = false
  inputValue.value = String(displayValue.value)
}

const saveValue = () => {
  const newValue = parseFloat(inputValue.value) || 0
  if (newValue !== displayValue.value) {
    emit('update', props.field, newValue)
  }
  editing.value = false
}
</script>

<style scoped>
.editable-cell {
  min-width: 80px;
}
</style>