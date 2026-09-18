<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 class="text-xl md:text-2xl font-semibold text-foreground">Financeiro</h1>
          <p class="text-muted-foreground mt-1 hidden md:block">
            Cada entrada e saída, de quem veio e a que pedido pertence
          </p>
        </div>
        <!-- Mobile: icon buttons -->
        <div class="flex gap-2 md:hidden">
          <button
            class="w-10 h-10 rounded-full bg-success hover:bg-success/90 text-success-foreground flex items-center justify-center transition-colors"
            aria-label="Registrar pagamento"
            @click="showPaymentModal = true"
          >
            <DollarSign class="w-4 h-4" />
          </button>
          <button
            class="w-10 h-10 rounded-full bg-warning hover:bg-warning/90 text-warning-foreground flex items-center justify-center transition-colors"
            aria-label="Registrar despesa"
            @click="showExpenseModal = true"
          >
            <Wallet class="w-4 h-4" />
          </button>
        </div>
        <!-- Desktop: full buttons -->
        <div class="hidden md:flex gap-2">
          <Button class="bg-success hover:bg-success/90 text-success-foreground gap-2" @click="showPaymentModal = true">
            <DollarSign class="w-4 h-4" />
            Registrar Pagamento
          </Button>
          <Button class="bg-warning hover:bg-warning/90 text-warning-foreground gap-2" @click="showExpenseModal = true">
            <Wallet class="w-4 h-4" />
            Registrar Despesa
          </Button>
        </div>
      </div>

      <!-- Período -->
      <PeriodChips :start-date="filters.startDate" :end-date="filters.endDate" @change="onPeriodChange" />

      <!-- Resumo + breakdowns (calculados no backend) -->
      <!-- Falha na mesma leitura do período atual: mantém os últimos números
           válidos visíveis, mas com aviso e carimbo de frescor (nunca silencioso). -->
      <div
        v-if="summaryError && summaryIsCurrentPeriod"
        class="flex items-center justify-between gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 mb-2"
      >
        <div class="flex items-center gap-2 text-sm text-foreground">
          <AlertTriangle class="w-4 h-4 text-warning shrink-0" />
          <span>Não foi possível atualizar o resumo. Os valores abaixo são de {{ formatFreshness(summaryUpdatedAt) }}.</span>
        </div>
        <Button variant="outline" size="sm" @click="loadSummary">Tentar de novo</Button>
      </div>
      <!-- Falha sem nenhum dado confiável para este período: não inventa zero. -->
      <div v-else-if="summaryError" class="rounded-lg border border-border bg-card p-8 text-center mb-4">
        <AlertTriangle class="w-6 h-6 text-destructive mx-auto mb-2" />
        <p class="text-sm text-foreground mb-3">Não foi possível carregar o resumo financeiro.</p>
        <Button variant="outline" size="sm" @click="loadSummary">Tentar de novo</Button>
      </div>
      <FinanceSummary v-if="!summaryError || summaryIsCurrentPeriod" :summary="summary" :loading="loadingSummary" class="mb-4" />

      <!-- Comprovantes PIX detectados no WhatsApp -->
      <WhatsAppPendingSection
        :entries="waPending"
        :action-loading="actionLoading"
        @post="postLedger"
        @cancel="cancelLedger"
        @receipt="openReceiptDialog"
      />


      <!-- Fluxo diário -->
      <DailyFlowChart v-if="dailySeries.length" :series="dailySeries" />

      <!-- Lançamentos -->
      <div class="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div v-if="loading" class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p class="mt-2 text-sm text-muted-foreground">Carregando lançamentos...</p>
        </div>

        <!-- Falha de leitura: nunca mostra a lista antiga (de outro período ou
             carregamento anterior) como se fosse a atual. -->
        <div v-else-if="ledgersError" class="p-8 text-center">
          <AlertTriangle class="w-6 h-6 text-destructive mx-auto mb-2" />
          <p class="text-sm text-foreground mb-3">Não foi possível carregar os lançamentos.</p>
          <Button variant="outline" size="sm" @click="loadLedgers">Tentar de novo</Button>
        </div>

        <div v-else-if="ledgers.length === 0" class="p-12 text-center">
          <div class="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Wallet class="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 class="text-lg font-semibold text-foreground">Nenhum lançamento encontrado</h3>
          <p class="mt-1 text-sm text-muted-foreground">
            Use os botões acima para registrar pagamentos ou despesas.
          </p>
        </div>

        <div v-else class="divide-y divide-border">
          <TransactionRow
            v-for="ledger in ledgers"
            :key="ledger.id"
            :ledger="ledger"
            :expanded="expandedId === ledger.id"
            :action-loading="actionLoading"
            @toggle="expandedId = expandedId === ledger.id ? null : ledger.id"
            @post="postLedger"
            @cancel="cancelLedger"
            @reverse="openReverseDialog"
            @receipt="openReceiptDialog"
          />
        </div>

        <div v-if="totalItems > 0 && !ledgersError" class="border-t border-border px-4 py-2">
          <Pagination
            :current-page="currentPage"
            :total-items="totalItems"
            :page-size="pageSize"
            @page-changed="handlePageChange"
            @page-size-changed="handlePageSizeChange"
          />
        </div>
      </div>
    </div>

    <!-- Dialogs -->
    <RegisterPaymentDialog v-model:open="showPaymentModal" @saved="reloadAll" />
    <RegisterExpenseDialog v-model:open="showExpenseModal" @saved="reloadAll" />
    <ReverseDialog v-model:open="showReverseDialog" :ledger="ledgerToReverse" @reversed="reloadAll" />
    <ReceiptDialog v-model:open="showReceiptDialog" :ledger="ledgerForReceipt" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { AlertTriangle, DollarSign, Wallet } from 'lucide-vue-next'
import Button from '../components/ui/Button.vue'
import Pagination from '../components/ui/Pagination.vue'
import WhatsAppPendingSection from '../components/ledger/WhatsAppPendingSection.vue'
import PeriodChips from '../components/ledger/PeriodChips.vue'
import FinanceSummary from '../components/ledger/FinanceSummary.vue'
import DailyFlowChart from '../components/ledger/DailyFlowChart.vue'
import TransactionRow from '../components/ledger/TransactionRow.vue'
import RegisterPaymentDialog from '../components/ledger/RegisterPaymentDialog.vue'
import RegisterExpenseDialog from '../components/ledger/RegisterExpenseDialog.vue'
import ReverseDialog from '../components/ledger/ReverseDialog.vue'
import ReceiptDialog from '../components/ledger/ReceiptDialog.vue'
import ledgerService from '../services/ledger'
import type { DailyFlowDTO, LedgerResponseDTO, LedgerSummaryDTO } from '../services/ledger'
import { fillMissingDays } from '../lib/dailySeries'
import { useNotification } from '../composables/useNotification'

const notification = useNotification()

// Estado
const ledgers = ref<LedgerResponseDTO[]>([])
const loading = ref(false)
const loadingSummary = ref(false)
const actionLoading = ref<number | null>(null)
const expandedId = ref<number | null>(null)
const summary = ref<LedgerSummaryDTO>({
  totalRevenue: 0,
  totalExpenses: 0,
  balance: 0,
  count: 0,
  pixIn: 0,
  pixOut: 0,
})
// Falha de leitura do resumo não pode virar "zero vendas" silencioso: só
// mostramos summary.value de novo se ele for do MESMO período em que a
// falha ocorreu (senão seria o período anterior disfarçado de atual).
const summaryError = ref(false)
const summaryUpdatedAt = ref<Date | null>(null)
const summaryPeriod = ref<{ startDate: string; endDate: string } | null>(null)
const summaryIsCurrentPeriod = computed(() =>
  summaryPeriod.value !== null &&
  summaryPeriod.value.startDate === filters.value.startDate &&
  summaryPeriod.value.endDate === filters.value.endDate
)
const ledgersError = ref(false)
const dailySeries = ref<DailyFlowDTO[]>([])
const waPending = ref<LedgerResponseDTO[]>([])

// Paginação
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)

// Período (default: este mês)
function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const today = new Date()
const filters = ref({
  startDate: iso(new Date(today.getFullYear(), today.getMonth(), 1)),
  endDate: iso(today),
})

// Carimbo de frescor ("dados de DD/MM HH:mm") mostrado quando o resumo
// exibido não é da leitura mais recente (última leitura falhou).
function formatFreshness(date: Date | null): string {
  if (!date) return ''
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${dd}/${mm} ${hh}:${min}`
}

// Dialogs
const showPaymentModal = ref(false)
const showExpenseModal = ref(false)
const showReverseDialog = ref(false)
const ledgerToReverse = ref<LedgerResponseDTO | null>(null)
const showReceiptDialog = ref(false)
const ledgerForReceipt = ref<LedgerResponseDTO | null>(null)

// Loads
async function loadLedgers() {
  loading.value = true
  try {
    const response = await ledgerService.getByDateRangePaginated(
      filters.value.startDate,
      filters.value.endDate,
      currentPage.value - 1,
      pageSize.value
    )
    ledgers.value = response.content
    totalItems.value = response.totalElements
    ledgersError.value = false
  } catch (error) {
    console.error('Erro ao carregar lançamentos:', error)
    // Não deixa a lista antiga (de outro período/carregamento) na tela como
    // se fosse atual: o template esconde a tabela e mostra erro + retry.
    ledgersError.value = true
  } finally {
    loading.value = false
  }
}

async function loadSummary() {
  loadingSummary.value = true
  try {
    summary.value = await ledgerService.getSummary(filters.value.startDate, filters.value.endDate)
    summaryError.value = false
    summaryUpdatedAt.value = new Date()
    summaryPeriod.value = { startDate: filters.value.startDate, endDate: filters.value.endDate }
  } catch (error) {
    console.error('Erro ao carregar resumo:', error)
    summaryError.value = true
  } finally {
    loadingSummary.value = false
  }
}

async function loadDaily() {
  try {
    const raw = await ledgerService.getDailySeries(filters.value.startDate, filters.value.endDate)
    dailySeries.value = raw.length
      ? fillMissingDays(raw, filters.value.startDate, filters.value.endDate)
      : []
  } catch (error) {
    console.error('Erro ao carregar série diária:', error)
    dailySeries.value = []
  }
}

async function loadWaPending() {
  try {
    waPending.value = await ledgerService.getPendingBySource('WHATSAPP')
  } catch (error) {
    console.error('Erro ao carregar pendências do WhatsApp:', error)
    waPending.value = []
  }
}

function reloadAll() {
  loadLedgers()
  loadSummary()
  loadDaily()
  loadWaPending()
}

function onPeriodChange(range: { startDate: string; endDate: string }) {
  filters.value = range
  currentPage.value = 1
  loadLedgers()
  loadSummary()
  loadDaily()
}

function handlePageChange(page: number) {
  currentPage.value = page
  loadLedgers()
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  loadLedgers()
}

// Ações
async function postLedger(ledger: LedgerResponseDTO) {
  actionLoading.value = ledger.id
  try {
    await ledgerService.post(ledger.id)
    notification.success('Sucesso', 'Lançamento postado')
    reloadAll()
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Não foi possível postar o lançamento'
    notification.error('Erro', msg)
  } finally {
    actionLoading.value = null
  }
}

async function cancelLedger(ledger: LedgerResponseDTO) {
  actionLoading.value = ledger.id
  try {
    await ledgerService.cancel(ledger.id)
    notification.success('Sucesso', 'Lançamento cancelado')
    reloadAll()
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Não foi possível cancelar o lançamento'
    notification.error('Erro', msg)
  } finally {
    actionLoading.value = null
  }
}

function openReverseDialog(ledger: LedgerResponseDTO) {
  ledgerToReverse.value = ledger
  showReverseDialog.value = true
}

function openReceiptDialog(ledger: LedgerResponseDTO) {
  ledgerForReceipt.value = ledger
  showReceiptDialog.value = true
}

onMounted(reloadAll)
</script>
