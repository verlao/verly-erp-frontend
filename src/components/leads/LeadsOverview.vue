<template>
  <div class="h-full overflow-y-auto p-4 md:p-6 space-y-4">
    <div>
      <h2 class="text-lg md:text-xl font-bold text-foreground">Visão geral do funil</h2>
      <p class="text-sm text-muted-foreground">Selecione um lead à esquerda para ver os detalhes — ou aja pelos atalhos abaixo.</p>
    </div>

    <!-- Funil (distribuição por etapa; o total do pipeline vive na KPI row) -->
    <Card>
      <CardHeader class="p-4 pb-2">
        <CardTitle class="text-sm">Funil</CardTitle>
      </CardHeader>
      <CardContent class="p-4 pt-0 space-y-2">
        <div class="flex h-2 w-full overflow-hidden rounded-full bg-muted">
          <div class="bg-info" :style="{ width: pct(counts.new) }" title="Novos"></div>
          <div class="bg-warning" :style="{ width: pct(counts.contacted) }" title="Contatados"></div>
          <div class="bg-success" :style="{ width: pct(counts.qualified) }" title="Qualificados"></div>
          <div class="bg-primary" :style="{ width: pct(counts.converted) }" title="Convertidos"></div>
        </div>
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span><span class="inline-block w-2 h-2 rounded-full bg-info mr-1"></span>Novos {{ counts.new }}</span>
          <span><span class="inline-block w-2 h-2 rounded-full bg-warning mr-1"></span>Contatados {{ counts.contacted }}</span>
          <span><span class="inline-block w-2 h-2 rounded-full bg-success mr-1"></span>Qualificados {{ counts.qualified }}</span>
          <span><span class="inline-block w-2 h-2 rounded-full bg-primary mr-1"></span>Convertidos {{ counts.converted }}</span>
        </div>
      </CardContent>
    </Card>

    <!-- Quentes -->
    <Card v-if="hotLeads.length">
      <CardHeader class="p-4 pb-2">
        <CardTitle class="text-sm flex items-center gap-1.5">
          <span aria-hidden="true">🔥</span> Quentes ({{ hotLeads.length }})
        </CardTitle>
      </CardHeader>
      <CardContent class="p-4 pt-0">
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
      </CardContent>
    </Card>

    <!-- Ações pendentes -->
    <Card v-if="pendingActions.length">
      <CardHeader class="p-4 pb-2">
        <CardTitle class="text-sm flex items-center gap-1.5">
          <span aria-hidden="true">⏰</span> Ações pendentes
        </CardTitle>
      </CardHeader>
      <CardContent class="p-4 pt-0">
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
      </CardContent>
    </Card>

    <p v-if="!hotLeads.length && !pendingActions.length" class="text-sm text-muted-foreground text-center py-4">
      Sem leads quentes ou ações pendentes no momento.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from '../ui/Card.vue'
import CardHeader from '../ui/CardHeader.vue'
import CardTitle from '../ui/CardTitle.vue'
import CardContent from '../ui/CardContent.vue'
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
