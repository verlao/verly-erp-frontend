<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold">Gerenciar Pedidos</h1>
      <button 
        @click="openModal()" 
        class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Novo Pedido
      </button>
    </div>

    <!-- Tabela de Pedidos -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-6 text-center">
        <p>Carregando...</p>
      </div>
      <div v-else-if="orders && orders.length === 0" class="p-6 text-center">
        <p>Nenhum pedido encontrado</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrega</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="order in (orders || [])" :key="order.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{{ order.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getCustomerName(order.customerId) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(order.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ order.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {{ order.price.toFixed(2) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(order.deliveryDate) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="openModal(order)" 
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Editar
                </button>
                <button 
                  @click="confirmDelete(order)" 
                  class="text-red-600 hover:text-red-900"
                >
                  Excluir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Paginação -->
      <Pagination
        v-if="totalItems > 0"
        :current-page="currentPage"
        :total-items="totalItems"
        :page-size="pageSize"
        @page-changed="handlePageChange"
        @page-size-changed="handlePageSizeChange"
      />
    </div>

    <!-- Modal de Pedido -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold">{{ isEditing ? 'Editar Pedido' : 'Novo Pedido' }}</h3>
        </div>
        <form @submit.prevent="saveOrder" class="p-6">
          <div class="space-y-6">
            <div>
              <label for="customer" class="block text-sm font-medium text-gray-700">Cliente</label>
              <select 
                id="customer" 
                v-model="currentOrder.customerId" 
                required 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="" disabled>Selecione um cliente</option>
                <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                  {{ customer.name }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Produtos</label>
              <div class="border border-gray-300 rounded-md p-4 space-y-4">
                <div v-for="(_quantity, productId) in currentOrder.products" :key="productId" class="flex items-center space-x-4">
                  <select 
                    v-model="selectedProducts[productId]" 
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    @change="updateProductSelection(productId)"
                  >
                    <option value="" disabled>Selecione um produto</option>
                    <option v-for="product in availableProducts" :key="product.id" :value="product.id">
                      {{ product.name || product.key }} - R$ {{ (product.price || 0).toFixed(2) }}
                    </option>
                  </select>
                  <input 
                    type="number" 
                    v-model.number="currentOrder.products[productId]" 
                    min="1" 
                    class="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  />
                  <button 
                    type="button" 
                    @click="removeProduct(productId)" 
                    class="text-red-600 hover:text-red-900"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
                </div>
                <button 
                  type="button" 
                  @click="addProduct" 
                  class="mt-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  Adicionar Produto
                </button>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                <select 
                  id="status" 
                  v-model="currentOrder.status" 
                  required 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="PENDENTE">Pendente</option>
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="CONCLUIDO">Concluído</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
              
              <div>
                <label for="deliveryDate" class="block text-sm font-medium text-gray-700">Data de Entrega</label>
                <input 
                  id="deliveryDate" 
                  v-model="currentOrder.deliveryDate" 
                  type="date" 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label for="cost" class="block text-sm font-medium text-gray-700">Custo Total</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">R$</span>
                  </div>
                  <input 
                    id="cost" 
                    v-model.number="currentOrder.cost" 
                    type="number" 
                    step="0.01" 
                    min="0"
                    required 
                    class="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              
              <div>
                <label for="price" class="block text-sm font-medium text-gray-700">Preço Total</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">R$</span>
                  </div>
                  <input 
                    id="price" 
                    v-model.number="currentOrder.price" 
                    type="number" 
                    step="0.01" 
                    min="0"
                    required 
                    class="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              
              <div>
                <label for="debt" class="block text-sm font-medium text-gray-700">Valor em Aberto</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">R$</span>
                  </div>
                  <input 
                    id="debt" 
                    v-model.number="currentOrder.debt" 
                    type="number" 
                    step="0.01" 
                    min="0"
                    required 
                    class="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div v-if="currentOrder.price && currentOrder.cost">
              <label class="block text-sm font-medium text-gray-700">Lucro</label>
              <div class="mt-1 text-lg font-semibold">
                R$ {{ (currentOrder.price - currentOrder.cost).toFixed(2) }} 
                ({{ calculateMargin(currentOrder.price, currentOrder.cost) }}%)
              </div>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button 
              type="button" 
              @click="showModal = false" 
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              :disabled="saving"
            >
              {{ saving ? 'Salvando...' : 'Salvar' }}
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
          <p>Tem certeza que deseja excluir o pedido <strong>#{{ orderToDelete?.id }}</strong>?</p>
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
              @click="deleteOrder" 
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
import { ref, onMounted, computed } from 'vue'
import orderService from '../services/order'
import customerService from '../services/customer'
import productService from '../services/product'
import Pagination from '../components/ui/Pagination.vue'
import type { OrderDTO, PaginatedResponse } from '../services/order'
import type { CustomerDTO } from '../services/customer'
import type { ProductDTO } from '../services/product'

const orders = ref<OrderDTO[]>([])
const customers = ref<CustomerDTO[]>([])
const products = ref<ProductDTO[]>([])
const loading = ref(true)
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)

// Paginação
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const totalPages = ref(0)

const currentOrder = ref<OrderDTO>({
  customerId: 0,
  products: {},
  status: 'PENDENTE',
  cost: 0,
  price: 0,
  debt: 0,
  profit: 0
})

const selectedProducts = ref<Record<number, number>>({})
const orderToDelete = ref<OrderDTO | null>(null)

const availableProducts = computed(() => {
  return products.value.filter(product => {
    // Filtrar produtos que já estão selecionados
    const selectedIds = Object.values(selectedProducts.value)
    return product.id && !selectedIds.includes(product.id as number)
  })
})

onMounted(async () => {
  await Promise.all([
    loadOrders(),
    loadCustomers(),
    loadProducts()
  ])
})

async function loadOrders() {
  try {
    loading.value = true
    const response: PaginatedResponse<OrderDTO> = await orderService.getAll({
      page: currentPage.value - 1, // Spring Boot usa páginas baseadas em 0
      size: pageSize.value,
      sort: 'createdDate,desc'
    })
    
    orders.value = response.content
    totalItems.value = response.totalElements
    totalPages.value = response.totalPages
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error)
    // Fallback para API sem paginação
    try {
      orders.value = await orderService.getAllNonPaginated()
      totalItems.value = orders.value.length
      totalPages.value = 1
    } catch (fallbackError) {
      console.error('Erro no fallback:', fallbackError)
    }
  } finally {
    loading.value = false
  }
}

async function loadCustomers() {
  try {
    customers.value = await customerService.getAll()
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
  }
}

async function loadProducts() {
  try {
    const response = await productService.getAll()
    // Handle both paginated and non-paginated responses
    if (response && typeof response === 'object' && 'content' in response) {
      products.value = response.content
    } else {
      products.value = response as ProductDTO[]
    }
  } catch (error) {
    console.error('Erro ao carregar produtos:', error)
  }
}

function getCustomerName(customerId: number): string {
  const customer = customers.value.find(c => c.id === customerId)
  return customer ? customer.name : `Cliente #${customerId}`
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'PENDENTE':
      return 'bg-yellow-100 text-yellow-800'
    case 'EM_ANDAMENTO':
      return 'bg-blue-100 text-blue-800'
    case 'CONCLUIDO':
      return 'bg-green-100 text-green-800'
    case 'CANCELADO':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Data inválida'
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

function calculateMargin(price: number, cost: number): string {
  if (!price || !cost) return '0.00'
  const margin = ((price - cost) / price) * 100
  return margin.toFixed(2)
}

function openModal(order?: OrderDTO) {
  if (order) {
    currentOrder.value = { ...order }
    isEditing.value = true
    
    // Preencher os produtos selecionados
    selectedProducts.value = {}
    Object.keys(order.products).forEach(productId => {
      selectedProducts.value[parseInt(productId)] = parseInt(productId)
    })
  } else {
    currentOrder.value = {
      customerId: 0,
      products: {},
      status: 'PENDENTE',
      cost: 0,
      price: 0,
      debt: 0,
      profit: 0
    }
    selectedProducts.value = {}
    isEditing.value = false
  }
  showModal.value = true
}

function addProduct() {
  const newProductId = Date.now() // Usar timestamp como ID temporário
  currentOrder.value.products[newProductId] = 1
  selectedProducts.value[newProductId] = 0 // Inicialmente nenhum produto selecionado
}

function removeProduct(productId: number) {
  delete currentOrder.value.products[productId]
  delete selectedProducts.value[productId]
}

function updateProductSelection(oldProductId: number) {
  const newProductId = selectedProducts.value[oldProductId]
  
  if (newProductId !== oldProductId) {
    // Transferir a quantidade para o novo ID
    const quantity = currentOrder.value.products[oldProductId]
    delete currentOrder.value.products[oldProductId]
    currentOrder.value.products[newProductId] = quantity
    
    // Atualizar o mapeamento
    delete selectedProducts.value[oldProductId]
    selectedProducts.value[newProductId] = newProductId
  }
}

async function saveOrder() {
  try {
    saving.value = true
    
    // Calcular o lucro antes de salvar
    currentOrder.value.profit = currentOrder.value.price - currentOrder.value.cost
    
    if (isEditing.value && currentOrder.value.id) {
      await orderService.update(currentOrder.value.id, currentOrder.value)
    } else {
      await orderService.create(currentOrder.value)
    }
    
    showModal.value = false
    await loadOrders()
  } catch (error) {
    console.error('Erro ao salvar pedido:', error)
  } finally {
    saving.value = false
  }
}

function confirmDelete(order: OrderDTO) {
  orderToDelete.value = order
  showDeleteModal.value = true
}

async function deleteOrder() {
  if (!orderToDelete.value?.id) return
  
  try {
    deleting.value = true
    await orderService.delete(orderToDelete.value.id)
    showDeleteModal.value = false
    await loadOrders()
  } catch (error) {
    console.error('Erro ao excluir pedido:', error)
  } finally {
    deleting.value = false
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
  loadOrders()
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1 // Reset para primeira página
  loadOrders()
}
</script>