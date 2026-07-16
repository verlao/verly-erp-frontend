<template>
  <div class="h-full overflow-y-auto p-4 md:p-6 space-y-5">
    <div>
      <h2 class="text-lg md:text-xl font-bold text-foreground">Visão geral do funil</h2>
      <p class="text-sm text-muted-foreground">Selecione um lead à esquerda para ver os detalhes — ou aja pelos atalhos abaixo.</p>
    </div>

    <!-- Pipeline -->
    <section class="rounded-lg border border-border bg-white p-4">
      <div class="flex items-baseline justify-between gap-2 mb-3">
        <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pipeline</span>
        <span class="text-xs text-muted-foreground">{{ counts.all }} leads</span>
      </div>
      <p class="text-2xl md:text-3xl font-bold text-green-600 leading-none">{{ pipelineValue }}</p>
      <p class="text-[11px] text-muted-foreground mt-1">valor estimado (leads carregados)</p>

      <!-- Barra de funil -->
      <div class="mt-4 space-y-2">
        <div class="flex h-2 w-full overflow-hidden rounded-full bg-muted">
          <div class="bg-blue-500" :style="{ width: pct(counts.new) }" title="Novos"></div>
          <div class="bg-amber-500" :style="{ width: pct(counts.contacted) }" title="Contatados"></div>
          <div class="bg-emerald-500" :style="{ width: pct(counts.qualified) }" title="Qualificados"></div>
          <div class="bg-gray-400" :style="{ width: pct(counts.converted) }" title="Convertidos"></div>
        </div>
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span><span class="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span>Novos {{ counts.new }}</span>
          <span><span class="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1"></span>Contatados {{ counts.contacted }}</span>
          <span><span class="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>Qualificados {{ counts.qualified }}</span>
          <span><span class="inline-block w-2 h-2 rounded-full bg-gray-400 mr-1"></span>Convertidos {{ counts.converted }}</span>
        </div>
      </div>
    </section>

    <!-- Quentes -->
    <section v-if="hotLeads.length" class="rounded-lg border border-border bg-white p-4">
      <h3 class="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
        <span aria-hidden="true">🔥</span> Quentes ({{ hotLeads.length }})
      </h3>
      <ul class="divide-y divide-border">
        <li v-for="lead in hotLeads" :key="lead.id">
          <button
            type="button"
            class="w-full flex items-center justify-between gap-2 py-2 text-left hover:bg-accent/50 rounded px-1 -mx-1 transition-colors"
            @click="emit('select', lead)"
          >
            <div class="min-w-0">
              <p class="text-sm font-medium text-foreground truncate">{{ lead.name }}</p>
              <p class="text-xs text-muted-foreground truncate">{{ hotReason(lead) }}</p>
            </div>
            <span v-if="lead.totalEstimatedValue != null" class="text-xs font-mono text-foreground shrink-0">
              {{ formatBrl(lead.totalEstimatedValue) }}
            </span>
          </button>
        </li>
      </ul>
    </section>

    <!-- Ações pendentes -->
    <section v-if="pendingActions.length" class="rounded-lg border border-border bg-white p-4">
      <h3 class="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
        <span aria-hidden="true">⏰</span> Ações pendentes
      </h3>
      <div class="space-y-3">
        <div v-for="bucket in pendingActions" :key="bucket.key">
          <p class="text-xs font-medium text-muted-foreground mb-1">{{ bucket.label }} ({{ bucket.leads.length }})</p>
          <ul class="space-y-0.5">
            <li v-for="lead in bucket.leads" :key="lead.id">
              <button
                type="button"
                class="w-full flex items-center gap-2 py-1 text-left text-sm text-foreground hover:bg-accent/50 rounded px-1 -mx-1 transition-colors truncate"
                @click="emit('select', lead)"
              >
                <span aria-hidden="true" class="shrink-0">{{ bucket.icon }}</span>
                <span class="truncate">{{ lead.name }}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <p v-if="!hotLeads.length && !pendingActions.length" class="text-sm text-muted-foreground text-center py-4">
      Sem leads quentes ou ações pendentes no momento.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LeadDTO } from '../../services/lead'
import { parseLeadData, isHotLead, hotReason } from '../../composables/useLeadSignals'

const props = defineProps<{
  leads: LeadDTO[]
  counts: { all: number; new: number; contacted: number; qualified: number; converted: number; lost: number }
}>()

const emit = defineEmits<{ (e: 'select', lead: LeadDTO): void }>()

function formatBrl(n?: number | null): string {
  if (n == null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

const pipelineValue = computed(() => {
  const total = props.leads
    .filter(l => l.status !== 'CONVERTED' && l.status !== 'LOST')
    .reduce((s, l) => s + (l.totalEstimatedValue || 0), 0)
  return formatBrl(total)
})

// Larguras da barra de funil (proporcional ao total de status conhecidos).
function pct(n: number): string {
  const total = props.counts.new + props.counts.contacted + props.counts.qualified + props.counts.converted
  if (!total) return '0%'
  return `${Math.round((n / total) * 100)}%`
}

const hotLeads = computed(() =>
  props.leads
    .filter(l => l.status !== 'CONVERTED' && l.status !== 'LOST' && isHotLead(l))
    .slice(0, 6)
)

const pendingActions = computed(() => {
  const visit: LeadDTO[] = []
  const payment: LeadDTO[] = []
  const closed: LeadDTO[] = []
  for (const l of props.leads) {
    if (l.status === 'CONVERTED' || l.status === 'LOST') continue
    const s = parseLeadData(l.data)?.signals
    if (!s) continue
    if (s.closed?.detected) closed.push(l)
    else if (s.payment?.detected) payment.push(l)
    else if (s.visit?.detected) visit.push(l)
  }
  const buckets = [
    { key: 'closed', label: 'Fechamentos → converter em cliente', icon: '✅', leads: closed },
    { key: 'payment', label: 'Pagamentos → conferir comprovante', icon: '💰', leads: payment },
    { key: 'visit', label: 'Visitas → confirmar agenda', icon: '📅', leads: visit },
  ]
  return buckets.filter(b => b.leads.length > 0)
})
</script>
