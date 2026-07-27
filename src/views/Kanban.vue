<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <p class="text-sm text-muted-foreground">
        Arraste os cards entre etapas — pagamentos entram sozinhos pelo Financeiro
      </p>
      <Button variant="outline" size="sm" :disabled="loading" @click="refreshBoard">
        <RotateCw class="w-4 h-4 mr-2" :class="loading ? 'animate-spin' : ''" />
        Atualizar
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="loading && !loaded" class="flex gap-3 md:gap-4 overflow-x-auto pb-4">
      <div v-for="i in 6" :key="i" class="min-w-72 w-72 shrink-0 space-y-2">
        <Skeleton height="2rem" />
        <Skeleton height="5rem" />
        <Skeleton height="5rem" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="rounded-lg border border-border bg-card p-8 text-center">
      <p class="text-sm text-foreground mb-3">Não foi possível carregar o funil.</p>
      <Button variant="outline" size="sm" @click="refreshBoard">Tentar de novo</Button>
    </div>

    <!-- Board -->
    <div v-else class="flex gap-3 md:gap-4 overflow-x-auto pb-4">
      <KanbanColumn
        v-for="col in KANBAN_COLUMNS"
        :key="col.key"
        :column-key="col.key"
        :title="col.label"
        :cards="board[col.key]"
        :accepts-drop="col.key !== 'PAGO'"
        @update:cards="(cards) => (board[col.key] = cards)"
        @moved="onCardMoved"
        @action="onCardAction"
        @move-check="onMoveCheck"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { RotateCw } from 'lucide-vue-next'
import Button from '../components/ui/Button.vue'
import Skeleton from '../components/ui/Skeleton.vue'
import KanbanColumn from '../components/kanban/KanbanColumn.vue'
import kanbanService, { KANBAN_COLUMNS } from '../services/kanban'
import type { KanbanBoard, KanbanCardDTO, KanbanColumnKey } from '../services/kanban'
import leadService from '../services/lead'
import quoteService from '../services/quote'
import { useNotificationStore } from '../stores/notification'

const router = useRouter()
const notification = useNotificationStore()

const board = reactive<KanbanBoard>({
  NOVO: [],
  PRECISA_MEDIR: [],
  AGUARDANDO_ORCAMENTO: [],
  FECHAMENTO: [],
  PEDIDO: [],
  PAGO: [],
})
const loading = ref(true)
const loaded = ref(false)
const error = ref(false)

async function refreshBoard() {
  loading.value = true
  error.value = false
  try {
    const data = await kanbanService.getBoard()
    for (const col of KANBAN_COLUMNS) {
      board[col.key] = data[col.key]
    }
    loaded.value = true
  } catch (e) {
    console.error('Erro ao carregar kanban:', e)
    error.value = true
  } finally {
    loading.value = false
  }
}

// ---- Mapa EXPLÍCITO de transições permitidas (drag) ----
// Fora do mapa = snap-back nativo (pré-validado no :move do SortableJS).
// AGUARDANDO→FECHAMENTO não é drag (orçamento precisa ser criado — ação do card);
// QUALQUER→PAGO não é drag (pagamento entra pelo Financeiro; coluna tem put:false).
type MoveHandler = (card: KanbanCardDTO) => Promise<unknown>
const ALLOWED: Record<string, MoveHandler> = {
  'NOVO->PRECISA_MEDIR': (c) => leadService.updateMeasurement(c.leadId!, 'NEEDED'),
  'NOVO->AGUARDANDO_ORCAMENTO': (c) => leadService.updateStatus(c.leadId!, 'CONTACTED'),
  'PRECISA_MEDIR->AGUARDANDO_ORCAMENTO': (c) => leadService.updateMeasurement(c.leadId!, 'DONE'),
  'AGUARDANDO_ORCAMENTO->PRECISA_MEDIR': (c) => leadService.updateMeasurement(c.leadId!, 'NEEDED'),
  'FECHAMENTO->PEDIDO': (c) => quoteService.convertToOrder(c.quoteId!),
}

// Último par from->to validado no :move — no drop, é a transição que aconteceu.
let lastMove: { from: string; to: string } | null = null

function onMoveCheck(from: string, to: string, allowed: (ok: boolean) => void) {
  const ok = `${from}->${to}` in ALLOWED
  if (ok) lastMove = { from, to }
  allowed(ok)
}

// v-model do draggable já moveu o card visualmente (optimistic); aqui dispara a
// API da transição. Falhou → re-deriva o board do servidor (rollback = verdade).
async function onCardMoved(card: KanbanCardDTO, to: KanbanColumnKey) {
  const handler =
    lastMove && lastMove.to === to ? ALLOWED[`${lastMove.from}->${lastMove.to}`] : undefined
  lastMove = null
  if (!handler) {
    await refreshBoard()
    return
  }
  try {
    await handler(card)
    if (to === 'PEDIDO') {
      // Conversão cria pedido novo (ids mudam) → re-deriva o board.
      await refreshBoard()
    }
    notification.success('Card movido')
  } catch (e: any) {
    const msg = e?.response?.data?.message || 'Não foi possível mover — tente de novo'
    notification.error(msg)
    await refreshBoard()
  }
}

// Ações contextuais que não são navegação (o card resolve navegação sozinho).
async function onCardAction(card: KanbanCardDTO, column: KanbanColumnKey) {
  try {
    if (column === 'PRECISA_MEDIR' && card.leadId) {
      await leadService.updateMeasurement(card.leadId, 'DONE')
      notification.success('Medição concluída')
      await refreshBoard()
    } else if (column === 'FECHAMENTO' && card.quoteId) {
      await quoteService.convertToOrder(card.quoteId)
      notification.success('Orçamento convertido em pedido')
      await refreshBoard()
    } else if (card.leadId) {
      router.push({ path: '/leads', query: { leadId: String(card.leadId) } })
    }
  } catch (e: any) {
    notification.error(e?.response?.data?.message || 'Ação falhou')
  }
}

onMounted(refreshBoard)
</script>
