<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'
import Badge from '../ui/Badge.vue'
import KanbanCard from './KanbanCard.vue'
import type { KanbanCardDTO, KanbanColumnKey } from '../../services/kanban'
import { useCurrency } from '../../composables/useCurrency'

const props = defineProps<{
  columnKey: KanbanColumnKey
  title: string
  cards: KanbanCardDTO[]
  acceptsDrop: boolean
}>()

const emit = defineEmits<{
  'update:cards': [cards: KanbanCardDTO[]]
  moved: [card: KanbanCardDTO, to: KanbanColumnKey]
  action: [card: KanbanCardDTO, column: KanbanColumnKey]
  invalidTarget: []
  moveCheck: [from: string, to: string, allowed: (ok: boolean) => void]
}>()

const currency = useCurrency()

const localCards = computed({
  get: () => props.cards,
  set: (v: KanbanCardDTO[]) => emit('update:cards', v),
})

const total = computed(() => props.cards.reduce((s, c) => s + (c.value || 0), 0))

// Grupo do SortableJS: PAGO não aceita drop (put:false → snap-back nativo).
const group = computed(() => ({ name: 'kanban', pull: true, put: props.acceptsDrop }))

// Pré-validação do drag: destino fora do mapa de transições → bloqueia antes do drop.
function onMove(evt: any): boolean {
  const from = evt.from?.dataset?.column
  const to = evt.to?.dataset?.column
  if (!from || !to || from === to) return true
  let ok = false
  emit('moveCheck', from, to, (allowed: boolean) => {
    ok = allowed
  })
  return ok
}

// Card ADICIONADO nesta coluna vindo de outra → dispara a ação da transição.
function onChange(evt: any) {
  if (evt.added?.element) {
    emit('moved', evt.added.element, props.columnKey)
  }
}
</script>

<template>
  <div class="min-w-72 w-72 shrink-0 rounded-lg bg-muted/40 flex flex-col max-h-[calc(100vh-11rem)]">
    <div class="flex items-center justify-between px-3 py-2 shrink-0">
      <div class="flex items-center gap-2 min-w-0">
        <h3 class="text-sm font-semibold text-foreground truncate">{{ title }}</h3>
        <Badge variant="secondary">{{ cards.length }}</Badge>
      </div>
      <span v-if="total > 0" class="text-xs text-muted-foreground shrink-0">
        {{ currency.formatCurrency(total) }}
      </span>
    </div>

    <div class="flex-1 overflow-y-auto px-2 pb-2">
      <draggable
        v-model="localCards"
        item-key="key"
        :group="group"
        :move="onMove"
        :delay="150"
        :delay-on-touch-only="true"
        :touch-start-threshold="5"
        ghost-class="opacity-40"
        class="space-y-2 min-h-16"
        :data-column="columnKey"
        @change="onChange"
      >
        <template #item="{ element }">
          <KanbanCard
            :card="element"
            :column="columnKey"
            @action="(c, col) => emit('action', c, col)"
          />
        </template>
        <template #footer>
          <div
            v-if="cards.length === 0"
            class="border border-dashed border-border rounded-md p-4 text-center text-xs text-muted-foreground"
          >
            {{ acceptsDrop ? 'Arraste um card' : 'Automático via Financeiro' }}
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>
