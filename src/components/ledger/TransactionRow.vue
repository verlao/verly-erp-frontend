<script setup lang="ts">
import { computed } from 'vue'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronDown,
  ChevronRight,
  FileText,
  MessageCircle,
  Package,
  Paperclip,
  User,
} from 'lucide-vue-next'
import Badge from '../ui/Badge.vue'
import Button from '../ui/Button.vue'
import type { LedgerResponseDTO } from '../../services/ledger'
import { useCurrency } from '../../composables/useCurrency'

const props = defineProps<{
  ledger: LedgerResponseDTO
  expanded: boolean
  actionLoading: number | null
}>()

const emit = defineEmits<{
  toggle: []
  post: [ledger: LedgerResponseDTO]
  cancel: [ledger: LedgerResponseDTO]
  reverse: [ledger: LedgerResponseDTO]
  receipt: [ledger: LedgerResponseDTO]
}>()

const currency = useCurrency()

const isOut = computed(
  () => props.ledger.documentType === 'EXPENSE' || props.ledger.documentType === 'REVERSAL'
)

const who = computed(
  () => props.ledger.customerName || props.ledger.leadName || props.ledger.description || '-'
)

const METHOD_LABELS: Record<string, string> = {
  PIX: 'PIX',
  DINHEIRO: 'Dinheiro',
  CARTAO_CREDITO: 'Crédito',
  CARTAO_DEBITO: 'Débito',
  TRANSFERENCIA: 'Transferência',
  BOLETO: 'Boleto',
}

const COUNTERPARTY_LABELS: Record<string, string> = {
  CUSTOMER: 'Cliente',
  SUPPLIER: 'Fornecedor',
  SERVICE_PROVIDER: 'Prestador',
  EMPLOYEE: 'Funcionário',
}

const DOC_LABELS: Record<string, string> = {
  PAYMENT: 'Recebimento',
  EXPENSE: 'Despesa',
  REVERSAL: 'Estorno',
}

const STATUS: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  POSTED: { label: 'Postado', variant: 'success' },
  PENDING: { label: 'Pendente', variant: 'warning' },
  REVERSED: { label: 'Estornado', variant: 'destructive' },
  CANCELLED: { label: 'Cancelado', variant: 'secondary' },
}

const status = computed(() => STATUS[props.ledger.status] ?? STATUS.PENDING)
const busy = computed(() => props.actionLoading === props.ledger.id)

const lowConfidence = computed(
  () =>
    props.ledger.status === 'PENDING' &&
    props.ledger.directionConfidence != null &&
    props.ledger.directionConfidence < 0.6
)

interface ChainItem {
  key: string
  label: string
  icon: any
  to?: { path: string; query: Record<string, string> }
}

const chain = computed<ChainItem[]>(() => {
  const items: ChainItem[] = []
  if (props.ledger.leadId) {
    items.push({
      key: 'lead',
      label: props.ledger.leadName || `Lead #${props.ledger.leadId}`,
      icon: User,
      to: { path: '/leads', query: { leadId: String(props.ledger.leadId) } },
    })
  }
  if (props.ledger.quoteId) {
    // TODO: deep-link quando Quotes.vue suportar query param
    items.push({ key: 'quote', label: `Orçamento #${props.ledger.quoteId}`, icon: FileText })
  }
  if (props.ledger.orderId) {
    // TODO: deep-link quando Orders.vue suportar query param
    items.push({
      key: 'order',
      label: `Pedido ${props.ledger.orderReference || '#' + props.ledger.orderId}`,
      icon: Package,
    })
  }
  return items
})

function formatDate(dateString: string): string {
  if (!dateString) return '-'
  const [y, m, d] = dateString.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}
</script>

<template>
  <div class="hover:bg-accent/50 transition-colors">
    <button type="button" class="w-full flex items-center gap-3 px-4 py-3 text-left" @click="emit('toggle')">
      <component
        :is="isOut ? ArrowUpFromLine : ArrowDownToLine"
        class="w-4 h-4 shrink-0"
        :class="isOut ? 'text-destructive' : 'text-success'"
      />
      <div class="flex-1 min-w-0">
        <p class="text-sm md:text-base font-medium text-foreground truncate">{{ who }}</p>
        <p class="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
          {{ formatDate(ledger.entryDate) }}
          <span
            v-if="ledger.paymentMethod"
            class="px-1.5 py-px rounded bg-muted text-muted-foreground text-[10px] font-medium"
          >
            {{ METHOD_LABELS[ledger.paymentMethod] || ledger.paymentMethod }}
          </span>
          <MessageCircle v-if="ledger.source === 'WHATSAPP'" class="w-3 h-3 text-success" />
          <span
            v-if="ledger.counterpartyType && COUNTERPARTY_LABELS[ledger.counterpartyType]"
            class="px-1.5 py-px rounded border border-border text-[10px] font-medium"
          >
            {{ COUNTERPARTY_LABELS[ledger.counterpartyType] }}
          </span>
          <span
            v-if="lowConfidence"
            class="px-1.5 py-px rounded bg-warning/15 text-warning text-[10px] font-medium"
          >
            ⚠️ confirmar direção
          </span>
          <!-- Palavra não é prova: linha do WhatsApp sem mídia anexada — o dono
               confirma sabendo que está confiando na palavra. -->
          <span
            v-if="ledger.source === 'WHATSAPP' && ledger.hasReceipt === false"
            class="px-1.5 py-px rounded border border-warning/50 text-warning text-[10px] font-medium"
          >
            sem comprovante
          </span>
          <span>· {{ DOC_LABELS[ledger.documentType] || ledger.documentType }}</span>
        </p>
      </div>
      <Button
        v-if="ledger.status === 'PENDING'"
        size="sm"
        variant="outline"
        class="hidden md:inline-flex border-success/40 text-success hover:bg-success/10"
        :disabled="busy"
        @click.stop="emit('post', ledger)"
      >
        Postar
      </Button>
      <div class="text-right shrink-0">
        <p class="text-sm md:text-base font-semibold" :class="isOut ? 'text-destructive' : 'text-success'">
          {{ isOut ? '-' : '+' }}{{ currency.formatCurrency(ledger.totalAmount) }}
        </p>
        <Badge :variant="status.variant" class="text-[10px] md:text-xs">{{ status.label }}</Badge>
      </div>
      <ChevronDown
        class="w-4 h-4 text-muted-foreground shrink-0 transition-transform"
        :class="expanded && 'rotate-180'"
      />
    </button>

    <div v-if="expanded" class="px-4 pb-3 pl-11 space-y-3">
      <!-- Cadeia lead → orçamento → pedido -->
      <nav v-if="chain.length" class="flex items-center gap-1.5 flex-wrap text-xs">
        <template v-for="(item, i) in chain" :key="item.key">
          <ChevronRight v-if="i > 0" class="w-3 h-3 text-muted-foreground/60" />
          <RouterLink
            v-if="item.to"
            :to="item.to"
            class="inline-flex items-center gap-1 text-primary hover:underline font-medium"
          >
            <component :is="item.icon" class="w-3 h-3" />{{ item.label }}
          </RouterLink>
          <span v-else class="inline-flex items-center gap-1 text-muted-foreground">
            <component :is="item.icon" class="w-3 h-3" />{{ item.label }}
          </span>
        </template>
      </nav>

      <p v-if="ledger.description && ledger.description !== who" class="text-xs text-muted-foreground">
        {{ ledger.description }}
      </p>
      <p v-if="ledger.reversalReason" class="text-xs text-muted-foreground italic">
        Estorno: {{ ledger.reversalReason }}
      </p>

      <!-- Partidas dobradas -->
      <div v-if="ledger.entries?.length" class="rounded-md border border-border divide-y divide-border">
        <div v-for="e in ledger.entries" :key="e.id" class="flex items-center gap-2 px-3 py-1.5 text-xs">
          <span class="text-muted-foreground w-4">{{ e.lineNumber }}</span>
          <span class="flex-1 truncate text-foreground">{{ e.accountName }}</span>
          <Badge variant="outline" class="text-[9px]">{{ e.entryType === 'DEBIT' ? 'D' : 'C' }}</Badge>
          <span class="font-medium tabular-nums">{{ currency.formatCurrency(e.amount) }}</span>
        </div>
      </div>

      <!-- Ações -->
      <div class="flex gap-2">
        <Button
          v-if="ledger.hasReceipt"
          size="sm"
          variant="outline"
          class="gap-1.5"
          @click.stop="emit('receipt', ledger)"
        >
          <Paperclip class="w-3.5 h-3.5" />
          Comprovante
        </Button>
        <Button
          v-if="ledger.status === 'PENDING'"
          size="sm"
          class="bg-success hover:bg-success/90 text-success-foreground"
          :disabled="busy"
          @click.stop="emit('post', ledger)"
        >
          Postar
        </Button>
        <Button
          v-if="ledger.status === 'PENDING'"
          size="sm"
          variant="outline"
          class="text-destructive border-destructive/40 hover:bg-destructive/10"
          :disabled="busy"
          @click.stop="emit('cancel', ledger)"
        >
          Cancelar
        </Button>
        <Button
          v-if="ledger.status === 'POSTED'"
          size="sm"
          variant="outline"
          class="text-warning border-warning/40 hover:bg-warning/10"
          :disabled="busy"
          @click.stop="emit('reverse', ledger)"
        >
          Estornar
        </Button>
      </div>
    </div>
  </div>
</template>
