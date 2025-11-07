<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold">Lançamentos Contábeis</h1>
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

    <!-- Tabela de Lançamentos -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-6 text-center">
        <p>Carregando...</p>
      </div>
      <div v-else-if="ledgers.length === 0" class="p-6 text-center">
        <p>Nenhum lançamento encontrado</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado por</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="ledger in ledgers" :key="ledger.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{{ ledger.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(ledger.entryDate) }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ ledger.description }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ ledger.documentType }}
                <span v-if="ledger.documentNumber" class="text-gray-400">{{ ledger.documentNumber }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                R$ {{ formatCurrency(ledger.totalAmount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(ledger.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ formatStatus(ledger.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ ledger.orderId ? `#${ledger.orderId}` : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ ledger.createdBy }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ledgerService from '../services/ledger'
import type { LedgerResponseDTO } from '../services/ledger'

const ledgers = ref<LedgerResponseDTO[]>([])
const loading = ref(true)

const filters = ref({
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0]
})

async function loadLedgers() {
  loading.value = true
  try {
    if (filters.value.startDate && filters.value.endDate) {
      ledgers.value = await ledgerService.getByDateRange(filters.value.startDate, filters.value.endDate)
    } else {
      ledgers.value = await ledgerService.getAll()
    }
  } catch (error) {
    console.error('Erro ao carregar lançamentos:', error)
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  loadLedgers()
}

function formatDate(dateString: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

function getStatusClass(status: string): string {
  const classes = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'POSTED': 'bg-green-100 text-green-800',
    'REVERSED': 'bg-red-100 text-red-800',
    'CANCELLED': 'bg-gray-100 text-gray-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

function formatStatus(status: string): string {
  const statusMap = {
    'PENDING': 'Pendente',
    'POSTED': 'Postado',
    'REVERSED': 'Estornado',
    'CANCELLED': 'Cancelado'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

onMounted(() => {
  loadLedgers()
})
</script>
