<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Carrinho de Compras</h1>
        <p class="mt-2 text-gray-600">Revise seus itens e finalize o pedido</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Lista de Itens -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Itens do Carrinho</h2>
              <p class="text-sm text-gray-500 mt-1">{{ cartStore.totalItems }} {{ cartStore.totalItems === 1 ? 'item' : 'itens' }}</p>
            </div>

            <!-- Lista vazia -->
            <div v-if="cartStore.isEmpty" class="p-12 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              <h3 class="mt-4 text-lg font-medium text-gray-900">Carrinho vazio</h3>
              <p class="mt-2 text-gray-500">Adicione produtos ao seu carrinho para continuar</p>
              <router-link 
                to="/products" 
                class="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Ver Produtos
              </router-link>
            </div>

            <!-- Lista de itens -->
            <div v-else class="divide-y divide-gray-200">
              <div v-for="item in cartStore.items" :key="item.product.key" class="p-6">
                <div class="flex items-start space-x-4">
                  <!-- Imagem do produto (placeholder) -->
                  <div class="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                  </div>

                  <div class="flex-1 min-w-0">
                    <!-- Informações do produto -->
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h3 class="text-lg font-medium text-gray-900">{{ item.product.type || 'Produto' }}</h3>
                        <div class="mt-1 text-sm text-gray-500 space-y-1">
                          <p v-if="item.product.sheets">Folhas: {{ item.product.sheets }}</p>
                          <p v-if="item.product.width && item.product.height">
                            Dimensões: {{ item.product.width }}cm × {{ item.product.height }}cm
                          </p>
                          <p v-if="item.product.color">Cor: {{ item.product.color }}</p>
                          <p v-if="item.product.kit">Kit: {{ item.product.kit }}</p>
                        </div>
                      </div>
                      
                      <!-- Botão remover -->
                      <button 
                        @click="removeItem(item.product.key!)" 
                        class="ml-4 text-red-600 hover:text-red-700 p-1"
                        title="Remover item"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>

                    <!-- Controles de quantidade e preço -->
                    <div class="mt-4 flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <label class="text-sm font-medium text-gray-700">Quantidade:</label>
                        <div class="flex items-center border border-gray-300 rounded-md">
                          <button 
                            @click="updateQuantity(item.product.key!, item.quantity - 1)"
                            class="px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            :disabled="item.quantity <= 1"
                          >
                            -
                          </button>
                          <input 
                            :value="item.quantity" 
                            @input="updateQuantity(item.product.key!, parseInt(($event.target as HTMLInputElement).value) || 1)"
                            type="number" 
                            min="1" 
                            class="w-16 px-2 py-1 text-center border-0 focus:ring-0"
                          >
                          <button 
                            @click="updateQuantity(item.product.key!, item.quantity + 1)"
                            class="px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div class="flex items-center space-x-4">
                        <div class="text-right">
                          <label class="block text-sm font-medium text-gray-700">Preço unitário:</label>
                          <div class="flex items-center mt-1">
                            <span class="text-sm text-gray-500 mr-1">R$</span>
                            <input 
                              :value="item.unitPrice.toFixed(2)" 
                              @input="updateUnitPrice(item.product.key!, parseFloat(($event.target as HTMLInputElement).value) || 0)"
                              type="number" 
                              step="0.01" 
                              min="0"
                              class="w-24 px-2 py-1 text-right border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                          </div>
                        </div>
                        
                        <div class="text-right">
                          <p class="text-sm font-medium text-gray-700">Total:</p>
                          <p class="text-lg font-semibold text-gray-900">R$ {{ item.totalPrice.toFixed(2) }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumo e Checkout -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-8">
            <div class="p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Resumo do Pedido</h2>
              
              <!-- Seleção de Cliente -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                <select 
                  v-model="selectedCustomerId" 
                  @change="onCustomerChange"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                    {{ customer.name }}
                  </option>
                </select>
              </div>

              <!-- Data de Entrega -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Data de Entrega</label>
                <input 
                  v-model="cartStore.deliveryDate" 
                  type="date" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
              </div>

              <!-- Observações -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                <textarea 
                  v-model="cartStore.observations" 
                  rows="3" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Observações sobre o pedido..."
                ></textarea>
              </div>

              <!-- Opções de Pagamento -->
              <div class="mb-6">
                <h3 class="text-sm font-medium text-gray-700 mb-3">Opções de Pagamento</h3>
                <div class="space-y-3">
                  <div class="p-3 border border-gray-200 rounded-lg bg-green-50">
                    <div class="flex justify-between items-center">
                      <span class="text-sm font-medium text-green-800">À Vista</span>
                      <span class="text-lg font-semibold text-green-900">R$ {{ cartStore.totalValue.toFixed(2) }}</span>
                    </div>
                    <div class="text-xs text-green-600 mt-1">Melhor preço disponível</div>
                  </div>
                  <div class="p-3 border border-gray-200 rounded-lg bg-blue-50">
                    <div class="flex justify-between items-center">
                      <span class="text-sm font-medium text-blue-800">Parcelado 12x</span>
                      <span class="text-lg font-semibold text-blue-900">R$ {{ (cartStore.totalValue * 1.2).toFixed(2) }}</span>
                    </div>
                    <div class="text-xs text-blue-600 mt-1">12x de R$ {{ ((cartStore.totalValue * 1.2) / 12).toFixed(2) }} sem juros</div>
                  </div>
                </div>
              </div>

              <!-- Totais -->
              <div class="border-t border-gray-200 pt-4 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Subtotal ({{ cartStore.totalItems }} itens):</span>
                  <span class="font-medium">R$ {{ cartStore.totalValue.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Custo total:</span>
                  <span class="font-medium">R$ {{ cartStore.totalCost.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Lucro estimado:</span>
                  <span class="font-medium text-green-600">R$ {{ cartStore.totalProfit.toFixed(2) }}</span>
                </div>
                <div class="border-t border-gray-200 pt-2">
                  <div class="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>R$ {{ cartStore.totalValue.toFixed(2) }}</span>
                  </div>
                </div>
              </div>

              <!-- Botões de ação -->
              <div class="mt-6 space-y-3">
                <button 
                  @click="checkout" 
                  :disabled="cartStore.isEmpty || !selectedCustomerId || loading"
                  class="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <span v-if="loading">Processando...</span>
                  <span v-else>Finalizar Pedido</span>
                </button>
                
                <button 
                  @click="clearCart" 
                  :disabled="cartStore.isEmpty"
                  class="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Limpar Carrinho
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Sucesso -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Pedido Criado com Sucesso!</h3>
          <p class="text-gray-500 mb-6">Seu pedido foi registrado e está sendo processado.</p>
          <div class="flex space-x-3">
            <button 
              @click="goToOrders" 
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Ver Pedidos
            </button>
            <button 
              @click="closeSuccessModal" 
              class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-200 transition-colors"
            >
              Continuar Comprando
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import customerService, { type CustomerDTO } from '@/services/customer'
import orderService from '@/services/order'

const router = useRouter()
const cartStore = useCartStore()

// Estado local
const customers = ref<CustomerDTO[]>([])
const selectedCustomerId = ref<string | number>('')
const loading = ref(false)
const showSuccessModal = ref(false)

// Computed
const selectedCustomer = computed(() => {
  return customers.value.find((c: CustomerDTO) => c.id?.toString() === selectedCustomerId.value.toString()) || null
})

// Lifecycle
onMounted(async () => {
  await loadCustomers()
  cartStore.loadFromStorage()
  cartStore.setupAutoSave()
})

// Methods
async function loadCustomers() {
  try {
    const response = await customerService.getAllNonPaginated()
    customers.value = Array.isArray(response) ? response : response.content || []
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
  }
}

function onCustomerChange() {
  const customer = customers.value.find((c: CustomerDTO) => c.id?.toString() === selectedCustomerId.value.toString())
  cartStore.setCustomer(customer || null)
}

function removeItem(productKey: string) {
  cartStore.removeItem(productKey)
}

function updateQuantity(productKey: string, quantity: number) {
  cartStore.updateQuantity(productKey, quantity)
}

function updateUnitPrice(productKey: string, unitPrice: number) {
  cartStore.updateUnitPrice(productKey, unitPrice)
}

function clearCart() {
  if (confirm('Tem certeza que deseja limpar o carrinho?')) {
    cartStore.clearCart()
    selectedCustomerId.value = ''
  }
}

async function checkout() {
  if (!selectedCustomerId.value) {
    alert('Por favor, selecione um cliente')
    return
  }

  if (cartStore.isEmpty) {
    alert('Carrinho está vazio')
    return
  }

  try {
    loading.value = true
    const orderData = cartStore.getOrderData()
    
    await orderService.create(orderData)
    
    showSuccessModal.value = true
    cartStore.clearCart()
    selectedCustomerId.value = ''
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    alert('Erro ao criar pedido. Tente novamente.')
  } finally {
    loading.value = false
  }
}

function closeSuccessModal() {
  showSuccessModal.value = false
  router.push('/products')
}

function goToOrders() {
  showSuccessModal.value = false
  router.push('/orders')
}
</script>