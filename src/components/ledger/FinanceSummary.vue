<script setup lang="ts">
import { computed } from 'vue'
import Card from '../ui/Card.vue'
import Skeleton from '../ui/Skeleton.vue'
import type { LedgerSummaryDTO } from '../../services/ledger'
import { useCurrency } from '../../composables/useCurrency'

const props = defineProps<{
  summary: LedgerSummaryDTO
  loading: boolean
}>()

const currency = useCurrency()

const METHOD_LABELS: Record<string, string> = {
  PIX: 'PIX',
  DINHEIRO: 'Dinheiro',
  CARTAO_CREDITO: 'Crédito',
  CARTAO_DEBITO: 'Débito',
  TRANSFERENCIA: 'Transferência',
  BOLETO: 'Boleto',
  OUTRO: 'Outro',
}

const COUNTERPARTY_LABELS: Record<string, string> = {
  CUSTOMER: 'Clientes',
  SUPPLIER: 'Fornecedores',
  SERVICE_PROVIDER: 'Prestadores',
  EMPLOYEE: 'Funcionários',
  OTHER: 'Outros',
  UNKNOWN: 'Não classificado',
}

const methodsSorted = computed(() => {
  const list = [...(props.summary.byMethod ?? [])]
  list.sort((a, b) => {
    if (a.paymentMethod === 'PIX') return -1
    if (b.paymentMethod === 'PIX') return 1
    return b.in + b.out - (a.in + a.out)
  })
  return list
})

const counterparties = computed(() =>
  (props.summary.byCounterparty ?? []).filter(c => c.in + c.out > 0)
)

const fmt = (v?: number) => currency.formatCurrency(v ?? 0)
</script>

<template>
  <div>
    <!-- Cards principais -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-3">
      <Card class="p-3 md:p-4">
        <p class="text-xs md:text-sm text-muted-foreground font-medium">Entradas</p>
        <p v-if="!loading" class="text-base md:text-2xl font-bold text-success truncate">
          {{ fmt(summary.totalRevenue) }}
        </p>
        <Skeleton v-else class="h-5 md:h-7 w-20 mt-1" />
      </Card>
      <Card class="p-3 md:p-4">
        <p class="text-xs md:text-sm text-muted-foreground font-medium">Saídas</p>
        <p v-if="!loading" class="text-base md:text-2xl font-bold text-destructive truncate">
          {{ fmt(summary.totalExpenses) }}
        </p>
        <Skeleton v-else class="h-5 md:h-7 w-20 mt-1" />
      </Card>
      <Card class="p-3 md:p-4">
        <p class="text-xs md:text-sm text-muted-foreground font-medium">Saldo</p>
        <p
          v-if="!loading"
          class="text-base md:text-2xl font-bold truncate"
          :class="summary.balance >= 0 ? 'text-foreground' : 'text-destructive'"
        >
          {{ fmt(summary.balance) }}
        </p>
        <Skeleton v-else class="h-5 md:h-7 w-20 mt-1" />
      </Card>
      <Card class="p-3 md:p-4">
        <p class="text-xs md:text-sm text-muted-foreground font-medium">Pendentes no período</p>
        <template v-if="!loading">
          <p class="text-base md:text-2xl font-bold text-warning truncate">
            {{ fmt(summary.pendingAmount) }}
          </p>
          <p class="text-[10px] md:text-xs text-muted-foreground">
            {{ summary.pendingCount ?? 0 }} lançamento(s)
          </p>
        </template>
        <Skeleton v-else class="h-5 md:h-7 w-20 mt-1" />
      </Card>
    </div>

    <!-- Breakdown por método -->
    <div
      v-if="methodsSorted.length"
      class="flex gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none] mb-2"
    >
      <div
        v-for="m in methodsSorted"
        :key="m.paymentMethod"
        class="inline-flex items-center gap-1.5 shrink-0 rounded-full border px-2.5 py-1 text-xs"
        :class="m.paymentMethod === 'PIX' ? 'border-success/40 bg-success/10' : 'border-border bg-card'"
      >
        <span class="font-semibold text-foreground">{{ METHOD_LABELS[m.paymentMethod] || m.paymentMethod }}</span>
        <span v-if="m.in > 0" class="font-medium text-success">+{{ fmt(m.in) }}</span>
        <span v-if="m.out > 0" class="font-medium text-destructive">-{{ fmt(m.out) }}</span>
      </div>
    </div>

    <!-- Breakdown por contraparte -->
    <div
      v-if="counterparties.length"
      class="flex gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none] mb-2"
    >
      <div
        v-for="c in counterparties"
        :key="c.counterpartyType"
        class="inline-flex items-center gap-1.5 shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-xs"
      >
        <span class="font-semibold text-foreground">
          {{ COUNTERPARTY_LABELS[c.counterpartyType] || c.counterpartyType }}
        </span>
        <span v-if="c.in > 0" class="font-medium text-success">+{{ fmt(c.in) }}</span>
        <span v-if="c.out > 0" class="font-medium text-destructive">-{{ fmt(c.out) }}</span>
      </div>
    </div>
  </div>
</template>
