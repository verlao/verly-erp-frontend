<script setup lang="ts">
import { computed } from 'vue'
import { MapPin, Phone, ClipboardCheck, CheckCircle } from 'lucide-vue-next'
import Badge from '../ui/Badge.vue'
import Avatar from '../ui/Avatar.vue'
import Checkbox from '../ui/Checkbox.vue'
import type { LeadDTO } from '../../services/lead'
import { isHotLead, parseLeadData, getNextAction, statusBadgeConfig, tierBadgeClass, negotiatedInfo, isPaymentAwaitingReceipt } from '../../composables/useLeadSignals'

const props = defineProps<{
  lead: LeadDTO
  selected?: boolean
  checked?: boolean
}>()

const emit = defineEmits<{
  select: []
  toggle: []
  quickAction: [action: string]
}>()

const statusConfig = computed(() => statusBadgeConfig(props.lead.status))

const isUnread = computed(() => !props.lead.isRead)

const timeAgo = computed(() => {
  if (!props.lead.createdDate) return ''

  try {
    const date = new Date(props.lead.createdDate)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'agora'
    if (diffMins < 60) return `há ${diffMins}min`
    if (diffHours < 24) return `há ${diffHours}h`
    if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  } catch {
    return ''
  }
})

const priority = computed(() => props.lead.priority || 'MEDIUM')

const priorityClass = computed(() => {
  if (priority.value === 'HIGH') return 'border-l-4 border-l-destructive'
  return ''
})

// V2_17: tier badge classes ($ / $$ / $$$) — fonte única no composable
const tierClass = computed(() => tierBadgeClass(props.lead.tier))

// V2_17: compact items summary — "PORTA 200×80 (1x) + espelho (2x)"
const itemsSummary = computed(() => {
  const items = props.lead.items || []
  if (items.length === 0) return ''
  const parts = items.slice(0, 2).map((i) => {
    const qty = i.quantity && i.quantity > 1 ? ` (${i.quantity}x)` : ''
    const dims = i.widthCm && i.heightCm ? ` ${i.widthCm}×${i.heightCm}` : ''
    return `${i.productType || 'ITEM'}${dims}${qty}`
  })
  const extra = items.length > 2 ? ` +${items.length - 2}` : ''
  return parts.join(' + ') + extra
})

// One-line service/summary the shop owner scans: itens summary quando existe,
// senão a descrição do lead truncada.
const summaryLine = computed(() => itemsSummary.value || (props.lead.description || '').trim())

// Format R$ 1.240,00
const brl = (n?: number) =>
  n == null
    ? null
    : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)

const totalDisplay = computed(() => brl(props.lead.totalEstimatedValue))
const profitDisplay = computed(() => brl(props.lead.totalEstimatedProfit))

// Qtd total de produtos (soma das quantidades dos itens)
const productCount = computed(() =>
  (props.lead.items || []).reduce((s, i) => s + (i.quantity || 1), 0)
)

// Lead quente (sinal de compra ou alto valor) + próxima ação sugerida
const hot = computed(() => isHotLead(props.lead))
const nextAction = computed(() => getNextAction(parseLeadData(props.lead.data)?.signals))

// V2_31: pagamento sinalizado sem comprovante — destaque "Pagou — confirmar"
const awaitingReceipt = computed(() => isPaymentAwaitingReceipt(props.lead))

// Valor negociado na conversa (signals.negotiated) — null em leads antigos
const negotiated = computed(() => negotiatedInfo(props.lead))
const negotiatedDisplay = computed(() => brl(negotiated.value?.value))
</script>

<template>
  <div
    :class="[
      'lead-item group relative cursor-pointer transition-all duration-200',
      'border-b border-border hover:bg-accent/50 active:bg-accent',
      selected ? 'bg-accent' : '',
      isUnread ? 'bg-info/5' : '',
      priorityClass
    ]"
    @click="emit('select')"
  >
    <div class="flex items-start gap-2 md:gap-3 p-3 md:p-3">
      <!-- Checkbox — touch target ≥44px no mobile -->
      <div class="flex items-center justify-center -m-2 p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 md:m-0 md:p-0 md:pt-1">
        <Checkbox
          :model-value="checked"
          @update:model-value="emit('toggle')"
          @click.stop
        />
      </div>

      <!-- Avatar - Hidden on very small screens -->
      <Avatar :name="lead.name" class="mt-0.5 md:mt-1 hidden xs:block h-9 w-9 md:h-10 md:w-10 shrink-0" />

      <!-- Main content -->
      <div class="flex-1 min-w-0 space-y-1">
        <!-- Linha 1: nome + tier + unread dot -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-1.5 min-w-0">
            <span
              v-if="isUnread"
              class="flex h-2 w-2 shrink-0 rounded-full bg-info"
            />
            <h4 :class="['truncate text-sm md:text-sm', isUnread ? 'font-bold' : 'font-semibold']">
              {{ lead.name }}
            </h4>
            <span v-if="hot" class="shrink-0" title="Lead quente — sinal de compra ou alto valor">🔥</span>
            <span
              v-if="awaitingReceipt"
              class="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-success/15 text-success"
              title="Cliente afirmou pagamento — confirmar comprovante"
            >💰 Pagou — confirmar</span>
          </div>

          <!-- Tier badge proeminente à direita -->
          <span
            v-if="lead.tier"
            :class="['inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs shrink-0', tierClass]"
            :title="totalDisplay ? `Valor estimado: ${totalDisplay}` : undefined"
          >
            {{ lead.tier }}
          </span>
        </div>

        <!-- Linha 2: resumo do serviço em 1 linha (o que o dono escaneia) -->
        <p v-if="summaryLine" class="text-xs md:text-sm text-foreground/80 truncate">
          {{ summaryLine }}
        </p>

        <!-- Próxima ação sugerida (dos sinais da conversa) -->
        <p v-if="nextAction" class="flex items-center gap-1 text-[11px] md:text-xs text-warning font-medium truncate">
          <span aria-hidden="true">→</span>
          <span class="truncate">{{ nextAction }}</span>
        </p>

        <!-- Linha 3: valor + lucro + qtd + status + bairro + tempo -->
        <div class="flex items-center flex-wrap gap-x-2 gap-y-1 text-[11px] md:text-xs">
          <template v-if="negotiatedDisplay">
            <span
              :class="['font-bold', negotiated?.divergent ? 'text-warning' : 'text-foreground']"
              :title="negotiated?.divergent ? 'Valor negociado diverge mais de 30% do estimado' : 'Valor negociado na conversa'"
            >
              <span v-if="negotiated?.divergent" aria-hidden="true">⚠️ </span>Negociado {{ negotiatedDisplay }}
            </span>
            <span v-if="totalDisplay" class="text-muted-foreground">
              · Estimado {{ totalDisplay }}
            </span>
          </template>
          <span v-else-if="totalDisplay" class="font-bold text-foreground">
            {{ totalDisplay }}
          </span>
          <span v-if="profitDisplay" class="text-success font-medium">
            lucro {{ profitDisplay }}
          </span>
          <span v-if="productCount" class="text-muted-foreground">
            · {{ productCount }} {{ productCount === 1 ? 'produto' : 'produtos' }}
          </span>
          <Badge :variant="statusConfig.variant" class="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5">
            {{ statusConfig.label }}
          </Badge>
          <span v-if="lead.neighborhood" class="flex items-center gap-0.5 text-muted-foreground truncate min-w-0">
            <MapPin class="w-3 h-3 shrink-0" />
            <span class="truncate">{{ lead.neighborhood }}</span>
          </span>
          <span class="text-muted-foreground whitespace-nowrap ml-auto">
            {{ timeAgo }}
          </span>
        </div>
      </div>

      <!-- Quick actions (visible on hover) - Hidden on mobile -->
      <div
        class="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border p-1 rounded-md shadow-lg"
      >
        <button
          v-if="isUnread"
          class="p-1.5 hover:bg-accent rounded-md transition-colors"
          title="Marcar como lido"
          @click.stop="emit('quickAction', 'mark-read')"
        >
          <CheckCircle class="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          class="p-1.5 hover:bg-accent rounded-md transition-colors"
          title="Ligar"
          @click.stop="emit('quickAction', 'call')"
        >
          <Phone class="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          class="p-1.5 hover:bg-accent rounded-md transition-colors"
          title="Conferir extração"
          @click.stop="emit('quickAction', 'review-extraction')"
        >
          <ClipboardCheck class="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  </div>
</template>
