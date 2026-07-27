<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from '../ui/Button.vue'
import type { KanbanCardDTO, KanbanColumnKey } from '../../services/kanban'
import { tierBadgeClass } from '../../composables/useLeadSignals'
import { useCurrency } from '../../composables/useCurrency'

const props = defineProps<{
  card: KanbanCardDTO
  column: KanbanColumnKey
}>()

const emit = defineEmits<{
  action: [card: KanbanCardDTO, column: KanbanColumnKey]
}>()

const router = useRouter()
const currency = useCurrency()

const tierClass = computed(() => tierBadgeClass(props.card.tier))

// Ação contextual por coluna: pequenos cliques fazem grandes partes.
const actionLabel = computed(() => {
  switch (props.column) {
    case 'NOVO':
      return 'Abrir lead'
    case 'PRECISA_MEDIR':
      return 'Marcar medido'
    case 'AGUARDANDO_ORCAMENTO':
      return 'Criar orçamento'
    case 'FECHAMENTO':
      return 'Converter em pedido'
    case 'PEDIDO':
      return 'Registrar pagamento'
    case 'PAGO':
      return 'Ver financeiro'
    default:
      return ''
  }
})

function onAction() {
  switch (props.column) {
    case 'NOVO':
      if (props.card.leadId) router.push({ path: '/leads', query: { leadId: String(props.card.leadId) } })
      return
    case 'AGUARDANDO_ORCAMENTO':
      if (props.card.leadId) router.push(`/leads/${props.card.leadId}/orcamento`)
      return
    case 'PEDIDO':
    case 'PAGO':
      router.push('/ledger')
      return
    default:
      emit('action', props.card, props.column)
  }
}
</script>

<template>
  <div class="bg-card border border-border rounded-md p-3 shadow-sm cursor-grab active:cursor-grabbing space-y-1.5">
    <div class="flex items-start justify-between gap-2">
      <p class="text-sm font-medium text-foreground truncate">{{ card.title }}</p>
      <span
        v-if="card.tier"
        :class="['inline-flex items-center px-1.5 py-0.5 rounded font-bold text-[10px] shrink-0', tierClass]"
      >
        {{ card.tier }}
      </span>
    </div>
    <p v-if="card.phone" class="text-xs text-muted-foreground truncate">{{ card.phone }}</p>
    <div class="flex items-center justify-between gap-2">
      <span v-if="card.value != null" class="text-sm font-semibold text-foreground">
        {{ currency.formatCurrency(card.value) }}
      </span>
      <div class="flex flex-wrap gap-1 justify-end">
        <span
          v-for="b in card.badges"
          :key="b"
          class="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-warning/15 text-warning"
        >
          {{ b }}
        </span>
      </div>
    </div>
    <Button variant="ghost" size="sm" class="w-full h-7 text-xs justify-start px-1 text-primary" @click.stop="onAction">
      {{ actionLabel }} →
    </Button>
  </div>
</template>
