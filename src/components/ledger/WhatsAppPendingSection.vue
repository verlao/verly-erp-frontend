<script setup lang="ts">
import { useRouter } from 'vue-router'
import { MessageCircle, MessageSquareText, ArrowDownToLine, ArrowUpFromLine, Paperclip } from 'lucide-vue-next'
import Button from '../ui/Button.vue'
import Badge from '../ui/Badge.vue'
import type { LedgerResponseDTO } from '../../services/ledger'
import { useCurrency } from '../../composables/useCurrency'

defineProps<{
  entries: LedgerResponseDTO[]
  actionLoading: number | null
}>()

const emit = defineEmits<{
  post: [ledger: LedgerResponseDTO]
  cancel: [ledger: LedgerResponseDTO]
  receipt: [ledger: LedgerResponseDTO]
}>()

const router = useRouter()
const currency = useCurrency()

function relative(iso?: string): string {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `há ${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `há ${hours}h`
  const days = Math.floor(hours / 24)
  return `há ${days} dia${days > 1 ? 's' : ''}`
}

function openConversation(l: LedgerResponseDTO) {
  if (l.leadId) router.push({ path: '/leads', query: { leadId: String(l.leadId) } })
}
</script>

<template>
  <div
    v-if="entries.length > 0"
    class="rounded-lg border border-warning/40 bg-card shadow-sm mb-4"
  >
    <div class="flex items-center gap-2 px-4 py-3 border-b border-border">
      <MessageCircle class="w-4 h-4 text-success" />
      <h3 class="text-sm font-semibold text-foreground">Comprovantes do WhatsApp</h3>
      <Badge variant="warning" class="ml-auto">{{ entries.length }} pendente{{ entries.length > 1 ? 's' : '' }}</Badge>
    </div>

    <ul
      class="divide-y divide-border max-h-64 overflow-y-auto overscroll-contain"
      aria-label="Comprovantes pendentes"
      tabindex="0"
    >
      <li
        v-for="l in entries"
        :key="l.id"
        class="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3"
      >
        <component
          :is="l.documentType === 'EXPENSE' ? ArrowUpFromLine : ArrowDownToLine"
          class="w-4 h-4 shrink-0 hidden sm:block"
          :class="l.documentType === 'EXPENSE' ? 'text-destructive' : 'text-success'"
        />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-foreground truncate">
            {{ l.customerName || l.description }}
          </p>
          <p class="text-xs text-muted-foreground truncate flex items-center gap-1.5">
            {{ l.documentType === 'EXPENSE' ? 'PIX enviado' : 'PIX recebido' }} · {{ relative(l.createdAt) }}
            <!-- Palavra não é prova: pendência sem mídia — postar aqui é confiar na palavra. -->
            <span
              v-if="l.hasReceipt === false"
              class="px-1.5 py-px rounded border border-warning/50 text-warning text-[10px] font-medium shrink-0"
            >
              sem comprovante
            </span>
          </p>
        </div>
        <span
          class="text-sm font-bold shrink-0"
          :class="l.documentType === 'EXPENSE' ? 'text-destructive' : 'text-success'"
        >
          {{ l.documentType === 'EXPENSE' ? '-' : '+' }}{{ currency.formatCurrency(l.totalAmount) }}
        </span>
        <div class="flex items-center gap-1.5 shrink-0">
          <Button
            v-if="l.hasReceipt"
            variant="ghost"
            size="sm"
            title="Ver comprovante"
            @click="emit('receipt', l)"
          >
            <Paperclip class="w-4 h-4" />
          </Button>
          <Button
            v-if="l.leadId"
            variant="ghost"
            size="sm"
            title="Ver conversa"
            @click="openConversation(l)"
          >
            <MessageSquareText class="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="actionLoading === l.id"
            @click="emit('cancel', l)"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            :disabled="actionLoading === l.id"
            @click="emit('post', l)"
          >
            {{ actionLoading === l.id ? '...' : 'Postar' }}
          </Button>
        </div>
      </li>
    </ul>
  </div>
</template>
