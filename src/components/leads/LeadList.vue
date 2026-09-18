<script setup lang="ts">
import { computed } from 'vue'
import LeadListItem from './LeadListItem.vue'
import type { LeadDTO } from '../../services/lead'

const props = defineProps<{
  leads: LeadDTO[]
  selectedId?: number
  checkedIds?: number[]
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [lead: LeadDTO]
  toggle: [leadId: number]
  quickAction: [leadId: number, action: string]
  toggleAll: []
}>()

// Freshness bands. The list arrives ordered by the backend's priority (highest profit
// first), and that order is PRESERVED inside each band — j/k navigation walks the raw
// array, so the headers stay purely visual.
//
// This used to be a single "today" block on the calendar day. At 00:00 it emptied, every
// lead answered hours earlier fell into an unlabelled remainder, and the page read as a
// frozen profit ranking — which is exactly how the staleness was reported. The `week`
// band gives recent work somewhere visible to land.
import { freshnessBand } from '../../lib/leadFreshness'

const todayLeads = computed(() => props.leads.filter(lead => freshnessBand(lead) === 'today'))
const weekLeads = computed(() => props.leads.filter(lead => freshnessBand(lead) === 'week'))
const olderLeads = computed(() => props.leads.filter(lead => freshnessBand(lead) === 'older'))

// Labels only once the list is actually partitioned — a single populated band means a
// flat list, and a lone header above everything says nothing.
const showHeaders = computed(() =>
  [todayLeads.value, weekLeads.value, olderLeads.value].filter(band => band.length > 0).length > 1
)

const bands = computed(() => [
  { key: 'today', label: 'Atividade hoje', leads: todayLeads.value },
  { key: 'week', label: 'Últimos 7 dias', leads: weekLeads.value },
  { key: 'older', label: 'Sem atividade recente', leads: olderLeads.value }
])
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="p-8 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p class="mt-2 text-sm text-muted-foreground">Carregando leads...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && leads.length === 0" class="p-12 text-center">
      <div class="mx-auto h-12 w-12 text-muted-foreground/40 mb-4">
        <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-foreground">Nenhum lead encontrado</h3>
      <p class="mt-1 text-sm text-muted-foreground">
        Não há leads com os filtros selecionados.
      </p>
    </div>

    <!-- Lead List: faixas por frescor; ordem de prioridade preservada dentro de cada faixa -->
    <div v-else>
      <template v-for="band in bands" :key="band.key">
        <p
          v-if="showHeaders && band.leads.length > 0"
          class="px-4 pt-3 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide"
        >
          {{ band.label }} ({{ band.leads.length }})
        </p>
        <LeadListItem
          v-for="lead in band.leads"
          :key="lead.id"
          :lead="lead"
          :selected="selectedId === lead.id"
          :checked="checkedIds?.includes(lead.id)"
          @select="emit('select', lead)"
          @toggle="emit('toggle', lead.id)"
          @quick-action="(action) => emit('quickAction', lead.id, action)"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
