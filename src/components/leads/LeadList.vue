<script setup lang="ts">
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

    <!-- Lead List -->
    <div v-else>
      <LeadListItem
        v-for="lead in leads"
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
