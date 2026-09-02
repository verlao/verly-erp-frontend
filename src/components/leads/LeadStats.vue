<script setup lang="ts">
import { computed } from 'vue'
import Skeleton from '../ui/Skeleton.vue'
import type { LeadDTO, LeadCounts } from '../../services/lead'
import { isHotLead } from '../../composables/useLeadSignals'
import { useHorizontalOverflow } from '../../composables/useHorizontalOverflow'
import { selectPipeline } from '../../lib/leadPipeline'

const props = defineProps<{
  leads: LeadDTO[]
  counts: LeadCounts
  loading?: boolean
}>()

function formatBrl(n: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

const pipeline = computed(() => selectPipeline(props.counts))

// Pipeline = new + contacted + qualified of measuredTotals (itens com largura
// e altura). Exclui CONVERTED e LOST. Hoje coincide com measuredTotals.all
// porque converted=lost=0 — a escolha errada (usar `all`, ou `totals` em
// vez de `measuredTotals`) ficaria invisível agora e errada depois.
const pipelineValue = computed(() => {
  if (pipeline.value.value != null) return formatBrl(pipeline.value.value)
  const total = props.leads
    .filter(l => l.status !== 'CONVERTED' && l.status !== 'LOST')
    .reduce((s, l) => s + (l.totalEstimatedValue || 0), 0)
  return formatBrl(total)
})

const unmeasuredLabel = computed(() => {
  const gap = pipeline.value.unmeasured
  if (gap == null || gap <= 0) return null
  return `+ ${formatBrl(gap)} sem medida`
})

const partnersValue = computed(() => {
  const v = pipeline.value.partners
  if (v == null || v <= 0) return null
  return formatBrl(v)
})

const hotCount = computed(() =>
  props.leads.filter(l => l.status !== 'CONVERTED' && l.status !== 'LOST' && isHotLead(l)).length
)

const conversionRatePct = computed(() => {
  if (!props.counts.all) return '0%'
  return `${Math.round((props.counts.converted / props.counts.all) * 100)}%`
})

const { containerRef, maskStyle } = useHorizontalOverflow()
</script>

<template>
  <div
    class="rounded-lg border border-border bg-card shadow-sm h-10 md:h-11 overflow-hidden"
  >
    <div
      ref="containerRef"
      :style="maskStyle"
      class="h-full px-3 pr-6 md:pl-4 md:pr-6 flex items-center gap-3 md:gap-5 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <template v-if="loading">
        <Skeleton height="0.875rem" width="14rem" />
      </template>
      <template v-else>
        <div
          class="flex items-baseline gap-1.5 shrink-0"
          title="Itens com largura e altura. O restante (sem medida) aparece ao lado."
        >
          <span class="text-xs text-muted-foreground">Pipeline</span>
          <span class="text-sm font-bold text-foreground">{{ pipelineValue }}</span>
          <span
            v-if="unmeasuredLabel"
            class="text-[11px] text-muted-foreground"
            title="Itens sem largura ou altura — não entram no valor medido."
          >{{ unmeasuredLabel }}</span>
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
        <template v-if="partnersValue">
          <span class="h-4 w-px bg-border shrink-0" aria-hidden="true" />
          <div
            class="flex items-baseline gap-1.5 shrink-0"
            title="Conversas com fornecedores e instalador. Fora do pipeline de vendas."
          >
            <span class="text-xs text-muted-foreground">Fornec.</span>
            <span class="text-xs font-medium text-muted-foreground">{{ partnersValue }}</span>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>
