<script setup lang="ts">
import { computed } from 'vue'
import Skeleton from '../ui/Skeleton.vue'
import type { LeadDTO } from '../../services/lead'
import { isHotLead } from '../../composables/useLeadSignals'

const props = defineProps<{
  leads: LeadDTO[]
  counts: { all: number; new: number; contacted: number; qualified: number; converted: number; lost: number }
  loading?: boolean
}>()

function formatBrl(n: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

// Mesmo critério do funil: soma dos leads ainda abertos (exclui convertidos/perdidos).
const pipelineValue = computed(() => {
  const total = props.leads
    .filter(l => l.status !== 'CONVERTED' && l.status !== 'LOST')
    .reduce((s, l) => s + (l.totalEstimatedValue || 0), 0)
  return formatBrl(total)
})

const hotCount = computed(() =>
  props.leads.filter(l => l.status !== 'CONVERTED' && l.status !== 'LOST' && isHotLead(l)).length
)

const conversionRatePct = computed(() => {
  if (!props.counts.all) return '0%'
  return `${Math.round((props.counts.converted / props.counts.all) * 100)}%`
})
</script>

<template>
  <div
    class="rounded-lg border border-border bg-card shadow-sm h-10 md:h-11 px-3 md:px-4 flex items-center gap-3 md:gap-5 overflow-x-auto whitespace-nowrap [scrollbar-width:none]"
  >
    <template v-if="loading">
      <Skeleton height="0.875rem" width="14rem" />
    </template>
    <template v-else>
      <div class="flex items-baseline gap-1.5 shrink-0">
        <span class="text-xs text-muted-foreground">Pipeline</span>
        <span class="text-sm font-bold text-foreground">{{ pipelineValue }}</span>
      </div>
      <span class="h-4 w-px bg-border shrink-0" aria-hidden="true" />
      <div class="flex items-baseline gap-1.5 shrink-0">
        <span class="text-xs text-muted-foreground">Novos</span>
        <span class="text-sm font-bold text-foreground">{{ counts.new }}</span>
      </div>
      <span class="h-4 w-px bg-border shrink-0" aria-hidden="true" />
      <div class="flex items-baseline gap-1.5 shrink-0" title="Leads quentes — sinal de compra ou alto valor">
        <span class="text-xs" aria-hidden="true">🔥</span>
        <span class="sr-only">Leads quentes</span>
        <span class="text-sm font-bold text-foreground">{{ hotCount }}</span>
      </div>
      <span class="h-4 w-px bg-border shrink-0" aria-hidden="true" />
      <div class="flex items-baseline gap-1.5 shrink-0">
        <span class="text-xs text-muted-foreground">Conv.</span>
        <span class="text-sm font-bold text-foreground">
          {{ counts.converted }}
          <span class="font-normal text-muted-foreground">({{ conversionRatePct }})</span>
        </span>
      </div>
    </template>
  </div>
</template>
