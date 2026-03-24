<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-semibold text-foreground">Lançamentos Contábeis</h1>
          <p class="text-muted-foreground mt-1">Registre pagamentos e despesas</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
          <Button @click="openPaymentModal" class="bg-green-600 hover:bg-green-700 text-white gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Registrar Pagamento
          </Button>
          <Button @click="openExpenseModal" class="bg-orange-600 hover:bg-orange-700 text-white gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            Registrar Despesa
          </Button>
        </div>
      </div>

      <!-- Cards de Resumo -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card class="bg-card border-border p-6 hover:shadow-lg transition-shadow duration-200">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-emerald-500/10 text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>
            </div>
            <div class="ml-4">
              <h2 class="text-muted-foreground text-sm font-medium">Receitas</h2>
              <p v-if="!loadingSummary" class="text-2xl font-bold text-emerald-600">{{ currency.formatCurrency(summary.totalRevenue) }}</p>
              <Skeleton v-else class="h-7 w-28" />
            </div>
          </div>
        </Card>

        <Card class="bg-card border-border p-6 hover:shadow-lg transition-shadow duration-200">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-red-500/10 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22,17 13.5,8.5 8.5,13.5 2,7"/><polyline points="16,17 22,17 22,11"/></svg>
            </div>
            <div class="ml-4">
              <h2 class="text-muted-foreground text-sm font-medium">Despesas</h2>
              <p v-if="!loadingSummary" class="text-2xl font-bold text-red-600">{{ currency.formatCurrency(summary.totalExpenses) }}</p>
              <Skeleton v-else class="h-7 w-28" />
            </div>
          </div>
        </Card>

        <Card class="bg-card border-border p-6 hover:shadow-lg transition-shadow duration-200">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-primary/10 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>
            </div>
            <div class="ml-4">
              <h2 class="text-muted-foreground text-sm font-medium">Saldo</h2>
              <p v-if="!loadingSummary" class="text-2xl font-bold" :class="summary.balance >= 0 ? 'text-foreground' : 'text-red-600'">{{ currency.formatCurrency(summary.balance) }}</p>
              <Skeleton v-else class="h-7 w-28" />
            </div>
          </div>
        </Card>
      </div>

      <!-- Filtros de Data -->
      <div class="bg-card rounded-lg shadow-sm border border-border p-4 mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <label for="startDate" class="block text-sm font-medium text-muted-foreground mb-1">Data Inicial</label>
            <input
              id="startDate"
              v-model="filters.startDate"
              type="date"
              class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div class="flex-1">
            <label for="endDate" class="block text-sm font-medium text-muted-foreground mb-1">Data Final</label>
            <input
              id="endDate"
              v-model="filters.endDate"
              type="date"
              class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div class="flex items-end">
            <Button @click="applyFilters" class="w-full sm:w-auto">
              Filtrar
            </Button>
          </div>
        </div>
      </div>

      <!-- Tabela de Lançamentos -->
      <div class="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="flex items-center space-x-3">
            <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-muted-foreground font-medium">Carregando lançamentos...</span>
          </div>
        </div>

        <div v-else-if="ledgers.length === 0" class="text-center py-16">
          <div class="bg-muted rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-foreground mb-2">Nenhum lançamento encontrado</h3>
          <p class="text-muted-foreground">Use os botões acima para registrar pagamentos ou despesas.</p>
        </div>

        <template v-else>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-muted">
                <tr class="border-b border-border">
                  <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Data</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Descrição</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tipo</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Valor</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Pedido</th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Ações</th>
                </tr>
              </thead>
              <tbody class="bg-card divide-y divide-border">
                <tr v-for="ledger in ledgers" :key="ledger.id" class="hover:bg-accent/50">
                  <td class="px-4 py-3 text-sm">{{ formatDate(ledger.entryDate) }}</td>
                  <td class="px-4 py-3 text-sm max-w-[200px] truncate">{{ ledger.description }}</td>
                  <td class="px-4 py-3 text-sm">
                    <span :class="getDocTypeClass(ledger.documentType)" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ formatDocType(ledger.documentType) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm font-semibold" :class="ledger.documentType === 'EXPENSE' ? 'text-red-600' : 'text-green-600'">
                    {{ ledger.documentType === 'EXPENSE' ? '- ' : '+ ' }}{{ currency.formatCurrency(ledger.totalAmount) }}
                  </td>
                  <td class="px-4 py-3">
                    <span :class="getStatusClass(ledger.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ formatStatus(ledger.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm">
                    {{ ledger.orderId ? `#${ledger.orderId}` : '-' }}
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-center gap-1">
                      <button
                        v-if="ledger.status === 'PENDING'"
                        @click="postLedger(ledger)"
                        :disabled="actionLoading === ledger.id"
                        class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Postar lançamento"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </button>
                      <button
                        v-if="ledger.status === 'PENDING'"
                        @click="cancelLedger(ledger)"
                        :disabled="actionLoading === ledger.id"
                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Cancelar lançamento"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                      <button
                        v-if="ledger.status === 'POSTED'"
                        @click="openReverseDialog(ledger)"
                        :disabled="actionLoading === ledger.id"
                        class="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Estornar lançamento"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
                      </button>
                      <span v-if="ledger.status === 'REVERSED' || ledger.status === 'CANCELLED'" class="text-xs text-muted-foreground">-</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Pagination
            v-if="totalItems > 0"
            :current-page="currentPage"
            :total-items="totalItems"
            :page-size="pageSize"
            @page-changed="handlePageChange"
            @page-size-changed="handlePageSizeChange"
          />
        </template>
      </div>
    </div>

    <!-- Modal Registrar Pagamento -->
    <Dialog :open="showPaymentModal" @update:open="showPaymentModal = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="submitPayment" class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg space-y-4">
            <div>
              <label for="paymentOrder" class="block text-sm font-medium text-gray-700 mb-1">Pedido</label>
              <select
                id="paymentOrder"
                v-model="paymentForm.orderId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                @change="onOrderSelected"
              >
                <option value="">Nenhum (opcional)</option>
                <option v-for="order in orders" :key="order.id" :value="order.id">
                  #{{ order.id }} - {{ getCustomerName(order.customerId) }} - R$ {{ (order.price || 0).toFixed(2) }}
                </option>
              </select>
            </div>

            <div>
              <label for="paymentAmount" class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <input
                id="paymentAmount"
                :value="paymentForm.amountDisplay"
                @input="handlePaymentAmountInput"
                type="text"
                inputmode="numeric"
                required
                placeholder="R$ 0,00"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label for="paymentMethod" class="block text-sm font-medium text-gray-700 mb-1">Método de Pagamento</label>
              <select
                id="paymentMethod"
                v-model="paymentForm.paymentMethod"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="" disabled>Selecione</option>
                <option value="PIX">PIX</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                <option value="CARTAO_DEBITO">Cartão de Débito</option>
                <option value="TRANSFERENCIA">Transferência</option>
                <option value="BOLETO">Boleto</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" @click="showPaymentModal = false" :disabled="savingPayment">
              Cancelar
            </Button>
            <Button type="submit" :disabled="savingPayment" class="bg-green-600 hover:bg-green-700 text-white gap-2">
              <svg v-if="savingPayment" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ savingPayment ? 'Registrando...' : 'Registrar Pagamento' }}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Modal Registrar Despesa -->
    <Dialog :open="showExpenseModal" @update:open="showExpenseModal = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Despesa</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="submitExpense" class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg space-y-4">
            <div>
              <label for="expenseDescription" class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input
                id="expenseDescription"
                v-model="expenseForm.description"
                type="text"
                required
                placeholder="Ex: Compra de vidro temperado"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label for="expenseAmount" class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <input
                id="expenseAmount"
                :value="expenseForm.amountDisplay"
                @input="handleExpenseAmountInput"
                type="text"
                inputmode="numeric"
                required
                placeholder="R$ 0,00"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="expenseAccount" class="block text-sm font-medium text-gray-700 mb-1">Tipo de Despesa</label>
                <select
                  id="expenseAccount"
                  v-model="expenseForm.expenseAccount"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="" disabled>Selecione</option>
                  <option value="MATERIAL">Material</option>
                  <option value="SERVICO">Serviço</option>
                  <option value="TRANSPORTE">Transporte</option>
                  <option value="MANUTENCAO">Manutenção</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>

              <div>
                <label for="paymentAccount" class="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                <select
                  id="paymentAccount"
                  v-model="expenseForm.paymentAccount"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="" disabled>Selecione</option>
                  <option value="CAIXA">Caixa</option>
                  <option value="BANCO">Banco</option>
                  <option value="CARTAO">Cartão</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" @click="showExpenseModal = false" :disabled="savingExpense">
              Cancelar
            </Button>
            <Button type="submit" :disabled="savingExpense" class="bg-orange-600 hover:bg-orange-700 text-white gap-2">
              <svg v-if="savingExpense" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ savingExpense ? 'Registrando...' : 'Registrar Despesa' }}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Dialog de Estorno -->
    <Dialog :open="showReverseDialog" @update:open="showReverseDialog = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Estornar Lançamento</DialogTitle>
        </DialogHeader>
        <div class="py-2">
          <p class="text-sm text-muted-foreground mb-4">
            Tem certeza que deseja estornar o lançamento abaixo?
          </p>
          <div v-if="ledgerToReverse" class="bg-muted/30 rounded-lg p-4 space-y-2 mb-4">
            <div class="flex justify-between text-sm">
              <span>Descrição:</span>
              <span class="font-medium">{{ ledgerToReverse.description }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Valor:</span>
              <span class="font-semibold text-green-600">{{ currency.formatCurrency(ledgerToReverse.totalAmount) }}</span>
            </div>
          </div>
          <div>
            <label for="reverseReason" class="block text-sm font-medium text-gray-700 mb-1">Motivo do Estorno</label>
            <textarea
              id="reverseReason"
              v-model="reverseReason"
              required
              rows="3"
              placeholder="Informe o motivo do estorno..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            ></textarea>
          </div>
        </div>
        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="showReverseDialog = false" :disabled="reversing">
            Cancelar
          </Button>
          <Button @click="submitReverse" :disabled="reversing || !reverseReason.trim()" class="bg-orange-600 hover:bg-orange-700 text-white gap-2">
            <svg v-if="reversing" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ reversing ? 'Estornando...' : 'Confirmar Estorno' }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ledgerService from '../services/ledger'
import orderService from '../services/order'
import customerService from '../services/customer'
import type { LedgerResponseDTO, LedgerSummaryDTO } from '../services/ledger'
import type { OrderDTO } from '../services/order'
import type { CustomerDTO } from '../services/customer'
import Dialog from '../components/ui/Dialog.vue'
import DialogContent from '../components/ui/DialogContent.vue'
import DialogHeader from '../components/ui/DialogHeader.vue'
import DialogTitle from '../components/ui/DialogTitle.vue'
import Button from '../components/ui/Button.vue'
import Card from '../components/ui/Card.vue'
import Skeleton from '../components/ui/Skeleton.vue'
import Pagination from '../components/ui/Pagination.vue'
import { useCurrency } from '../composables/useCurrency'
import { useNotification } from '../composables/useNotification'

const currency = useCurrency()
const notification = useNotification()

// Data
const ledgers = ref<LedgerResponseDTO[]>([])
const orders = ref<OrderDTO[]>([])
const customers = ref<CustomerDTO[]>([])
const loading = ref(true)
const loadingSummary = ref(true)
const actionLoading = ref<number | null>(null)
const summary = ref<LedgerSummaryDTO>({ totalRevenue: 0, totalExpenses: 0, balance: 0, count: 0 })

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)

// Filters
const filters = ref({
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0]
})

// Payment modal
const showPaymentModal = ref(false)
const savingPayment = ref(false)
const paymentForm = ref({
  orderId: '' as number | string,
  customerId: 0,
  amount: 0,
  amountDisplay: '',
  paymentMethod: ''
})

// Expense modal
const showExpenseModal = ref(false)
const savingExpense = ref(false)
const expenseForm = ref({
  description: '',
  amount: 0,
  amountDisplay: '',
  expenseAccount: '',
  paymentAccount: ''
})

// Reverse dialog
const showReverseDialog = ref(false)
const reversing = ref(false)
const ledgerToReverse = ref<LedgerResponseDTO | null>(null)
const reverseReason = ref('')

function getCurrentUser(): string {
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      return user.name || user.username || 'Sistema'
    }
  } catch { /* ignore */ }
  return 'Sistema'
}

// Load data
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
  } catch (error) {
    console.error('Erro ao carregar lançamentos:', error)
    notification.error('Erro', 'Não foi possível carregar os lançamentos')
  } finally {
    loading.value = false
  }
}

async function loadSummary() {
  loadingSummary.value = true
  try {
    summary.value = await ledgerService.getSummary(filters.value.startDate, filters.value.endDate)
  } catch (error) {
    console.error('Erro ao carregar resumo:', error)
  } finally {
    loadingSummary.value = false
  }
}

async function loadOrders() {
  try {
    const response = await orderService.getAllNonPaginated()
    orders.value = Array.isArray(response) ? response : response.content || []
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error)
  }
}

async function loadCustomers() {
  try {
    customers.value = await customerService.getAllNonPaginated()
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
  }
}

function applyFilters() {
  currentPage.value = 1
  loadLedgers()
  loadSummary()
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

// Helpers
function getCustomerName(customerId: number): string {
  const customer = customers.value.find(c => c.id === customerId)
  return customer?.name || `Cliente #${customerId}`
}

function formatDate(dateString: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'POSTED': 'bg-green-100 text-green-800',
    'REVERSED': 'bg-red-100 text-red-800',
    'CANCELLED': 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'Pendente',
    'POSTED': 'Postado',
    'REVERSED': 'Estornado',
    'CANCELLED': 'Cancelado'
  }
  return statusMap[status] || status
}

function getDocTypeClass(docType: string): string {
  const classes: Record<string, string> = {
    'PAYMENT': 'bg-green-100 text-green-800',
    'EXPENSE': 'bg-red-100 text-red-800',
    'REVERSAL': 'bg-orange-100 text-orange-800'
  }
  return classes[docType] || 'bg-gray-100 text-gray-800'
}

function formatDocType(docType: string): string {
  const map: Record<string, string> = {
    'PAYMENT': 'Pagamento',
    'EXPENSE': 'Despesa',
    'REVERSAL': 'Estorno'
  }
  return map[docType] || docType
}

// Payment modal
function openPaymentModal() {
  paymentForm.value = { orderId: '', customerId: 0, amount: 0, amountDisplay: '', paymentMethod: '' }
  showPaymentModal.value = true
}

function onOrderSelected() {
  const order = orders.value.find(o => o.id === Number(paymentForm.value.orderId))
  if (order) {
    paymentForm.value.customerId = order.customerId
    if (order.debt > 0) {
      paymentForm.value.amount = order.debt
      paymentForm.value.amountDisplay = currency.formatCurrency(order.debt)
    }
  }
}

function handlePaymentAmountInput(event: Event) {
  const result = currency.handleCurrencyInput(event)
  paymentForm.value.amount = result.value
  paymentForm.value.amountDisplay = result.display
  const target = event.target as HTMLInputElement
  target.value = result.display
}

async function submitPayment() {
  if (!paymentForm.value.amount || !paymentForm.value.paymentMethod) return
  savingPayment.value = true
  try {
    await ledgerService.recordPayment(
      paymentForm.value.orderId ? Number(paymentForm.value.orderId) : null,
      paymentForm.value.customerId || null,
      paymentForm.value.amount,
      paymentForm.value.paymentMethod,
      getCurrentUser()
    )
    notification.success('Sucesso', 'Pagamento registrado com sucesso')
    showPaymentModal.value = false
    loadLedgers()
    loadSummary()
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Não foi possível registrar o pagamento'
    notification.error('Erro', msg)
  } finally {
    savingPayment.value = false
  }
}

// Expense modal
function openExpenseModal() {
  expenseForm.value = { description: '', amount: 0, amountDisplay: '', expenseAccount: '', paymentAccount: '' }
  showExpenseModal.value = true
}

function handleExpenseAmountInput(event: Event) {
  const result = currency.handleCurrencyInput(event)
  expenseForm.value.amount = result.value
  expenseForm.value.amountDisplay = result.display
  const target = event.target as HTMLInputElement
  target.value = result.display
}

async function submitExpense() {
  if (!expenseForm.value.description || !expenseForm.value.amount || !expenseForm.value.expenseAccount || !expenseForm.value.paymentAccount) return
  savingExpense.value = true
  try {
    await ledgerService.recordExpense(
      expenseForm.value.description,
      expenseForm.value.amount,
      expenseForm.value.expenseAccount,
      expenseForm.value.paymentAccount,
      getCurrentUser()
    )
    notification.success('Sucesso', 'Despesa registrada com sucesso')
    showExpenseModal.value = false
    loadLedgers()
    loadSummary()
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Não foi possível registrar a despesa'
    notification.error('Erro', msg)
  } finally {
    savingExpense.value = false
  }
}

// Table actions
async function postLedger(ledger: LedgerResponseDTO) {
  actionLoading.value = ledger.id
  try {
    await ledgerService.post(ledger.id)
    notification.success('Sucesso', `Lançamento postado`)
    loadLedgers()
    loadSummary()
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
    notification.success('Sucesso', `Lançamento cancelado`)
    loadLedgers()
    loadSummary()
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Não foi possível cancelar o lançamento'
    notification.error('Erro', msg)
  } finally {
    actionLoading.value = null
  }
}

function openReverseDialog(ledger: LedgerResponseDTO) {
  ledgerToReverse.value = ledger
  reverseReason.value = ''
  showReverseDialog.value = true
}

async function submitReverse() {
  if (!ledgerToReverse.value || !reverseReason.value.trim()) return
  reversing.value = true
  try {
    await ledgerService.reverse(ledgerToReverse.value.id, {
      reason: reverseReason.value.trim(),
      createdBy: getCurrentUser()
    })
    notification.success('Sucesso', `Lançamento estornado`)
    showReverseDialog.value = false
    ledgerToReverse.value = null
    loadLedgers()
    loadSummary()
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Não foi possível estornar o lançamento'
    notification.error('Erro', msg)
  } finally {
    reversing.value = false
  }
}

onMounted(() => {
  loadLedgers()
  loadSummary()
  loadOrders()
  loadCustomers()
})
</script>
