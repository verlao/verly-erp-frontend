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

// Bloco "Novos hoje": leads com atividade hoje (criados OU re-sintetizados pelo bot —
// lastActivityDate vem do backend, que já os entrega contíguos no topo). Membership é
// por DATA de atividade, não por não-lido: ler um lead só tira o negrito, ele fica no
// bloco até o dia virar. Headers são visuais — a ordem do array não muda, então a
// navegação j/k (que anda o array cru) continua consistente com a tela.
const isToday = (lead: LeadDTO): boolean => {
  const stamp = lead.lastActivityDate ?? lead.createdDate
  if (!stamp) return false
  const d = new Date(stamp)
  const now = new Date()
  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate()
}

const todayLeads = computed(() => props.leads.filter(isToday))
const earlierLeads = computed(() => props.leads.filter(lead => !isToday(lead)))
// Headers só quando a lista está de fato particionada — com filtros esvaziando um dos
// lados, a lista volta a ser plana e sem rótulos.
const showHeaders = computed(() => todayLeads.value.length > 0 && earlierLeads.value.length > 0)
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

    <!-- Lead List: bloco "Novos hoje" (atividade hoje) + demais em ordem de prioridade -->
    <div v-else>
      <p
        v-if="showHeaders"
        class="px-4 pt-3 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide"
      >
        Novos hoje ({{ todayLeads.length }})
      </p>
      <LeadListItem
        v-for="lead in todayLeads"
        :key="lead.id"
        :lead="lead"
        :selected="selectedId === lead.id"
        :checked="checkedIds?.includes(lead.id)"
        @select="emit('select', lead)"
        @toggle="emit('toggle', lead.id)"
        @quick-action="(action) => emit('quickAction', lead.id, action)"
      />
      <p
        v-if="showHeaders"
        class="px-4 pt-3 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide"
      >
        Anteriores
      </p>
      <LeadListItem
        v-for="lead in earlierLeads"
        :key="lead.id"
        :lead="lead"
        :selected="selectedId === lead.id"
        :checked="checkedIds?.includes(lead.id)"
        @select="emit('select', lead)"
        @toggle="emit('toggle', lead.id)"
        @quick-action="(action) => emit('quickAction', lead.id, action)"
      />
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
