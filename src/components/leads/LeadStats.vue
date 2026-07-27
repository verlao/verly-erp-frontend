<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, Sparkles, Flame, CircleCheckBig } from 'lucide-vue-next'
import StatCard from '../ui/StatCard.vue'
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

const conversionRate = computed(() => {
  if (!props.counts.all) return null
  return `${Math.round((props.counts.converted / props.counts.all) * 100)}% de conversão`
})
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
    <StatCard
      label="Pipeline"
      :value="pipelineValue"
      :sub="`${counts.all} leads carregados`"
      :loading="loading"
    >
      <template #icon><TrendingUp class="w-4 h-4" /></template>
    </StatCard>
    <StatCard
      label="Novos"
      :value="counts.new"
      sub="aguardando contato"
      :loading="loading"
    >
      <template #icon><Sparkles class="w-4 h-4" /></template>
    </StatCard>
    <StatCard
      label="Quentes"
      :value="hotCount"
      sub="sinal de compra ou alto valor"
      :loading="loading"
    >
      <template #icon><Flame class="w-4 h-4" /></template>
    </StatCard>
    <StatCard
      label="Convertidos"
      :value="counts.converted"
      :sub="conversionRate ?? undefined"
      :loading="loading"
    >
      <template #icon><CircleCheckBig class="w-4 h-4" /></template>
    </StatCard>
  </div>
</template>
