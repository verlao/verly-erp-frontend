<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from '../ui/Button.vue'

const props = defineProps<{
  startDate: string
  endDate: string
}>()

const emit = defineEmits<{
  change: [range: { startDate: string; endDate: string }]
}>()

type PresetKey = 'today' | '7d' | 'month' | 'custom'

const presets: { key: PresetKey; label: string }[] = [
  { key: 'today', label: 'Hoje' },
  { key: '7d', label: '7 dias' },
  { key: 'month', label: 'Este mês' },
  { key: 'custom', label: 'Personalizado' },
]

const activePreset = ref<PresetKey>('month')
const localStart = ref(props.startDate)
const localEnd = ref(props.endDate)
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const activeRange = computed(() => {
  const start = parseDate(props.startDate)
  const end = parseDate(props.endDate)

  if (start.getTime() === end.getTime()) {
    return `${start.getDate()} ${MONTHS[start.getMonth()]}`
  }
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${MONTHS[end.getMonth()]}`
  }
  if (start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()} ${MONTHS[start.getMonth()]}–${end.getDate()} ${MONTHS[end.getMonth()]}`
  }
  return `${start.getDate()} ${MONTHS[start.getMonth()]} ${start.getFullYear()}–${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`
})

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function select(key: PresetKey) {
  activePreset.value = key
  if (key === 'custom') return
  const today = new Date()
  const end = iso(today)
  let start = end
  if (key === '7d') {
    const s = new Date()
    s.setDate(s.getDate() - 6)
    start = iso(s)
  } else if (key === 'month') {
    start = iso(new Date(today.getFullYear(), today.getMonth(), 1))
  }
  localStart.value = start
  localEnd.value = end
  emit('change', { startDate: start, endDate: end })
}

function emitCustom() {
  if (!localStart.value || !localEnd.value) return
  emit('change', { startDate: localStart.value, endDate: localEnd.value })
}

const inputClass =
  'h-9 px-3 rounded-md border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
</script>

<template>
  <div class="mb-4">
    <div class="flex items-center gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
      <span class="text-xs font-semibold text-foreground shrink-0">Período</span>
      <button
        v-for="p in presets"
        :key="p.key"
        type="button"
        class="h-8 px-3 rounded-full text-xs font-medium border transition-colors shrink-0"
        :class="
          activePreset === p.key
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-accent'
        "
        @click="select(p.key)"
      >
        {{ p.label }}
        <span v-if="activePreset === p.key">· {{ activeRange }}</span>
      </button>
    </div>
    <div v-if="activePreset === 'custom'" class="flex flex-col sm:flex-row gap-2 mt-2">
      <input v-model="localStart" type="date" :class="inputClass" />
      <input v-model="localEnd" type="date" :class="inputClass" />
      <Button size="sm" @click="emitCustom">Aplicar</Button>
    </div>
  </div>
</template>
