<script setup lang="ts">
import { computed } from 'vue'
import Card from '../ui/Card.vue'
import type { DailyFlowDTO } from '../../services/ledger'
import { maxFlow } from '../../lib/dailySeries'
import { useCurrency } from '../../composables/useCurrency'

const props = defineProps<{
  series: DailyFlowDTO[]
}>()

const currency = useCurrency()

const max = computed(() => maxFlow(props.series))
const labelStep = computed(() => Math.max(1, Math.ceil(props.series.length / 8)))

function barPct(v: number): string {
  if (v === 0) return '2px'
  return `${Math.max((v / max.value) * 100, 3)}%`
}

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

function parts(date: string): { d: Date; dd: string; mm: string } {
  const [y, m, d] = date.split('-').map(Number)
  return { d: new Date(y, m - 1, d), dd: String(d).padStart(2, '0'), mm: String(m).padStart(2, '0') }
}

function shortLabel(date: string): string {
  const { d, dd, mm } = parts(date)
  return props.series.length > 14 ? `${dd}/${mm}` : `${WEEKDAYS[d.getDay()]} ${dd}`
}

function fullTitle(day: DailyFlowDTO): string {
  const { dd, mm } = parts(day.date)
  return `${dd}/${mm} — Entradas: ${currency.formatCurrency(day.in)} · Saídas: ${currency.formatCurrency(day.out)}`
}
</script>

<template>
  <Card class="p-3 md:p-4 mb-4">
    <div class="flex items-center gap-3 mb-2">
      <h3 class="text-sm font-medium text-foreground">Fluxo diário</h3>
      <span class="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
        <span class="w-2 h-2 rounded-full bg-success" /> Entradas
        <span class="w-2 h-2 rounded-full bg-destructive ml-2" /> Saídas
      </span>
    </div>
    <div class="overflow-x-auto [scrollbar-width:thin]">
      <div :class="series.length > 31 ? 'min-w-[640px]' : ''">
        <div class="flex items-end gap-[3px] h-24 md:h-32">
          <div
            v-for="day in series"
            :key="day.date"
            class="flex-1 min-w-[8px] h-full flex items-end justify-center gap-px cursor-default"
            :title="fullTitle(day)"
          >
            <div
              class="w-1/2 max-w-[10px] rounded-t-sm"
              :class="day.in > 0 ? 'bg-success/90' : 'bg-muted'"
              :style="{ height: barPct(day.in) }"
            />
            <div
              class="w-1/2 max-w-[10px] rounded-t-sm"
              :class="day.out > 0 ? 'bg-destructive/90' : 'bg-muted'"
              :style="{ height: barPct(day.out) }"
            />
          </div>
        </div>
        <div class="flex gap-[3px] mt-1">
          <span
            v-for="(day, i) in series"
            :key="day.date"
            class="flex-1 min-w-[8px] text-center text-[9px] text-muted-foreground truncate"
          >
            {{ i % labelStep === 0 ? shortLabel(day.date) : '' }}
          </span>
        </div>
      </div>
    </div>
  </Card>
</template>
