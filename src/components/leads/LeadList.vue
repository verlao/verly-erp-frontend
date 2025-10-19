<script setup lang="ts">
import { computed } from 'vue'
import LeadListItem from './LeadListItem.vue'
import ScrollArea from '../ui/ScrollArea.vue'
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

const allChecked = computed(() => {
  return props.leads.length > 0 && props.leads.every(lead =>
    props.checkedIds?.includes(lead.id)
  )
})

const someChecked = computed(() => {
  return props.checkedIds && props.checkedIds.length > 0 && !allChecked.value
})
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header with select all -->
    <div class="flex items-center gap-3 p-3 border-b border-border bg-muted/30">
      <input
        type="checkbox"
        :checked="allChecked"
        :indeterminate="someChecked"
        class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
        @change="emit('toggleAll')"
      />
      <span class="text-sm text-muted-foreground">
        {{ checkedIds?.length ? `${checkedIds.length} selecionado(s)` : 'Selecionar todos' }}
      </span>
    </div>

    <!-- List -->
    <ScrollArea class="flex-1">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="mt-2 text-sm text-muted-foreground">Carregando leads...</p>
      </div>

      <div v-else-if="leads.length === 0" class="p-8 text-center">
        <div class="mx-auto h-12 w-12 text-muted-foreground mb-4">
          <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-foreground">Nenhum lead encontrado</h3>
        <p class="mt-1 text-sm text-muted-foreground">
          Não há leads com os filtros selecionados.
        </p>
      </div>

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
    </ScrollArea>
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
