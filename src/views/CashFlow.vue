<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold">Fluxo de Caixa</h1>
      <button 
        @click="openModal()" 
        class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Nova Transação
      </button>
    </div>

    <!-- Filtros de Data -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div>
          <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
          <input 
            id="startDate" 
            v-model="filters.startDate" 
            type="date" 
            class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
          <input 
            id="endDate" 
            v-model="filters.endDate" 
            type="date" 
            class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        <div class="flex items-end">
          <button 
            @click="applyFilters" 
            class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Filtrar
          </button>
        </div>
      </div>
    </div>

    <!-- Resumo do Fluxo de Caixa -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Entradas</h3>
        <p class="text-2xl font-semibold text-green-600">R$ {{ formatCurrency(summary.income) }}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Saídas</h3>
        <p class="text-2xl font-semibold text-red-600">R$ {{ formatCurrency(summary.expense) }}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Saldo</h3>
        <p :class="`text-2xl font-semibold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`">
          R$ {{ formatCurrency(summary.balance) }}
        </p>
      </div>
    </div>

    <!-- Tabela de Transações -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-6 text-center">
        <p>Carregando...</p>
      </div>
      <div v-else-if="cashFlows.length === 0" class="p-6 text-center">
        <p>Nenhuma transação encontrada</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pessoa</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="cashFlow in cashFlows" :key="cashFlow.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{{ cashFlow.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ cashFlow.description }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getTypeClass(cashFlow.type)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ formatType(cashFlow.type) }}
                </span>
              </td>
              <td :class="`px-6 py-4 whitespace-nowrap text-sm font-medium ${(cashFlow.type === 'INCOME' || cashFlow.type === 'ENTRADA') ? 'text-green-600' : 'text-red-600'}`">
                R$ {{ formatCurrency(cashFlow.cash) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ cashFlow.orderId ? `#${cashFlow.orderId}` : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ cashFlow.person }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(cashFlow.createdDate) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="openModal(cashFlow)" 
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Editar
                </button>
                <button 
                  @click="confirmDelete(cashFlow)" 
                  class="text-red-600 hover:text-red-900"
                >
                  Excluir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Botão Flutuante para Nova Transação -->
    <button 
      @click="openModal()"
      class="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-200 z-40 flex items-center justify-center group"
    >
      <svg class="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
    </button>

    <!-- Modal de Transação -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold text-gray-900">{{ isEditing ? 'Editar Transação' : 'Nova Transação' }}</h3>
            <button 
              @click="showModal = false" 
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <form @submit.prevent="saveCashFlow" class="p-6">
          <div class="space-y-6">
            <!-- Seleção de Tipo com Botões Visuais -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Tipo de Transação</label>
              <div class="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  @click="currentCashFlow.type = 'INCOME'"
                  :class="[
                    'flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200',
                    currentCashFlow.type === 'INCOME' 
                      ? 'border-green-600 bg-green-100 text-green-800 shadow-md' 
                      : 'border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:bg-green-50'
                  ]"
                >
                  <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  <span class="font-medium">Entrada</span>
                  <span class="text-xs opacity-75">Receita</span>
                </button>
                <button 
                  type="button"
                  @click="currentCashFlow.type = 'EXPENSE'"
                  :class="[
                    'flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200',
                    currentCashFlow.type === 'EXPENSE' 
                      ? 'border-red-500 bg-red-50 text-red-700' 
                      : 'border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:bg-red-50'
                  ]"
                >
                  <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                  </svg>
                  <span class="font-medium">Saída</span>
                  <span class="text-xs opacity-75">Despesa</span>
                </button>
              </div>
            </div>

            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <input 
                id="description" 
                v-model="currentCashFlow.description" 
                type="text" 
                required 
                placeholder="Ex: Pagamento de fornecedor, Venda de produto..."
                class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <label for="cash" class="block text-sm font-medium text-gray-700 mb-2">Valor</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">R$</span>
                <input 
                  id="cash" 
                  v-model.number="currentCashFlow.cash" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  required 
                  placeholder="0,00"
                  class="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div>
              <label for="person" class="block text-sm font-medium text-gray-700 mb-2">Pessoa/Empresa</label>
              <input 
                id="person" 
                v-model="currentCashFlow.person" 
                type="text" 
                required 
                placeholder="Ex: João Silva, Empresa XYZ..."
                class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <label for="orderId" class="block text-sm font-medium text-gray-700 mb-2">Pedido <span class="text-gray-400 text-xs">(opcional)</span></label>
              <select 
                id="orderId" 
                v-model="currentCashFlow.orderId" 
                class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option :value="null">Selecione um pedido...</option>
                <option v-for="order in orders" :key="order.id" :value="order.id">
                  #{{ order.id }} - {{ getCustomerName(order.customerId) }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button 
              type="button" 
              @click="showModal = false" 
              class="w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              :disabled="saving"
              :class="[
                'w-full sm:w-auto px-6 py-3 text-sm font-medium text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all',
                currentCashFlow.type === 'INCOME' 
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
                saving ? 'opacity-50 cursor-not-allowed' : ''
              ]"
            >
              <span v-if="saving" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </span>
              <span v-else>
                {{ isEditing ? 'Atualizar Transação' : 'Criar Transação' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Confirmação de Exclusão -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Confirmar Exclusão</h3>
          <p>Tem certeza que deseja excluir esta transação?</p>
          <div class="mt-6 flex justify-end space-x-3">
            <button 
              type="button" 
              @click="showDeleteModal = false" 
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              @click="deleteCashFlow" 
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              :disabled="deleting"
            >
              {{ deleting ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import cashFlowService from '../services/cashflow'
import orderService from '../services/order'
import customerService from '../services/customer'
import type { CashFlowDTO } from '../services/cashflow'
import type { OrderDTO } from '../services/order'
import type { CustomerDTO } from '../services/customer'

const cashFlows = ref<CashFlowDTO[]>([])
const orders = ref<OrderDTO[]>([])
const customers = ref<CustomerDTO[]>([])
const loading = ref(true)
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)

const filters = ref({
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Primeiro dia do mês atual
  endDate: new Date().toISOString().split('T')[0] // Hoje
})

const currentCashFlow = ref<CashFlowDTO>({
  description: '',
  cash: 0,
  type: 'INCOME',
  person: ''
})

const cashFlowToDelete = ref<CashFlowDTO | null>(null)

const summary = computed(() => {
  let income = 0
  let expense = 0
  
  cashFlows.value.forEach(cf => {
    if (cf.type === 'ENTRADA' || cf.type === 'INCOME') {
      income += cf.cash
    } else if (cf.type === 'SAIDA' || cf.type === 'EXPENSE') {
      expense += cf.cash
    }
  })
  
  return {
    income,
    expense,
    balance: income - expense
  }
})

onMounted(async () => {
  await Promise.all([
    loadCashFlows(),
    loadOrders(),
    loadCustomers()
  ])
})

// Watcher para reagir às mudanças nos filtros de data
watch(
  () => [filters.value.startDate, filters.value.endDate],
  async ([newStartDate, newEndDate], [oldStartDate, oldEndDate]) => {
    // Só faz a chamada se as datas realmente mudaram
    if (newStartDate !== oldStartDate || newEndDate !== oldEndDate) {
      await loadCashFlows()
    }
  },
  { deep: true }
)

async function loadCashFlows() {
  try {
    loading.value = true
    
    if (filters.value.startDate && filters.value.endDate) {
      cashFlows.value = await cashFlowService.getByDateRange(
        filters.value.startDate,
        filters.value.endDate
      )
    } else {
      cashFlows.value = await cashFlowService.getAll()
    }
  } catch (error) {
    console.error('Erro ao carregar fluxo de caixa:', error)
  } finally {
    loading.value = false
  }
}

async function loadOrders() {
  try {
    orders.value = await orderService.getAll()
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error)
  }
}

async function loadCustomers() {
  try {
    customers.value = await customerService.getAll()
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
  }
}

function getCustomerName(customerId: number): string {
  const customer = customers.value.find(c => c.id === customerId)
  return customer ? customer.name : `Cliente #${customerId}`
}

function getTypeClass(type: string): string {
  return (type === 'INCOME' || type === 'ENTRADA') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
}

function formatType(type: string): string {
  return (type === 'INCOME' || type === 'ENTRADA') ? 'Entrada' : 'Saída'
}

function formatDate(dateInput?: string | number[]): string {
  if (!dateInput) return '-'
  
  let date: Date
  
  // Se for um array (formato do backend: [year, month, day, hour, minute, second, nanosecond])
  if (Array.isArray(dateInput)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput
    date = new Date(year, month - 1, day, hour, minute, second) // month - 1 porque Date usa 0-11 para meses
  } else {
    // Se for string
    date = new Date(dateInput)
  }
  
  if (isNaN(date.getTime())) return 'Data inválida'
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function formatCurrency(value: number): string {
  return value.toFixed(2)
}

function applyFilters() {
  loadCashFlows()
}

function openModal(cashFlow?: CashFlowDTO) {
  if (cashFlow) {
    currentCashFlow.value = { ...cashFlow }
    isEditing.value = true
  } else {
    currentCashFlow.value = {
      description: '',
      cash: 0,
      type: 'INCOME',
      person: ''
    }
    isEditing.value = false
  }
  showModal.value = true
}

async function saveCashFlow() {
  try {
    saving.value = true
    
    if (isEditing.value && currentCashFlow.value.id) {
      await cashFlowService.update(currentCashFlow.value.id, currentCashFlow.value)
    } else {
      await cashFlowService.create(currentCashFlow.value)
    }
    
    showModal.value = false
    await loadCashFlows()
  } catch (error) {
    console.error('Erro ao salvar transação:', error)
  } finally {
    saving.value = false
  }
}

function confirmDelete(cashFlow: CashFlowDTO) {
  cashFlowToDelete.value = cashFlow
  showDeleteModal.value = true
}

async function deleteCashFlow() {
  if (!cashFlowToDelete.value?.id) return
  
  try {
    deleting.value = true
    await cashFlowService.delete(cashFlowToDelete.value.id)
    showDeleteModal.value = false
    await loadCashFlows()
  } catch (error) {
    console.error('Erro ao excluir transação:', error)
  } finally {
    deleting.value = false
  }
}
</script>