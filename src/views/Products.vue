<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Produtos</h1>
          <p class="text-gray-600 mt-1">Gerencie seus produtos de vidro temperado</p>
        </div>
        <button
          @click="openModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-label="Criar novo produto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <span>Novo Produto</span>
        </button>
      </div>

      <!-- Custos do Vidro Temperado -->
      <div v-if="productCosts" class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h2 class="text-base font-medium text-gray-900 mb-3">Custos do Vidro Temperado</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="border border-gray-200 rounded-lg p-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Incolor</label>
            <EditableCell 
              :cost="productCosts" 
              field="incolor" 
              :is-money="true"
              @update="handleGlassInlineEdit"
            />
          </div>
          <div class="border border-gray-200 rounded-lg p-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Verde</label>
            <EditableCell 
              :cost="productCosts" 
              field="verde" 
              :is-money="true"
              @update="handleGlassInlineEdit"
            />
          </div>
          <div class="border border-gray-200 rounded-lg p-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Fumê</label>
            <EditableCell 
              :cost="productCosts" 
              field="fume" 
              :is-money="true"
              @update="handleGlassInlineEdit"
            />
          </div>
        </div>
      </div>

      <!-- Filter Bar -->
      <FilterBar
        v-model:search="searchQuery"
        v-model:type="selectedType"
        v-model:color="selectedColor"
      />

      <!-- Tabela de Produtos -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Lista de Produtos</h2>
          <p class="text-sm text-gray-600 mt-1">{{ totalItems }} produtos encontrados</p>
        </div>
        
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="flex items-center space-x-3">
            <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-600 font-medium">Carregando produtos...</span>
          </div>
        </div>
        
        <div v-else-if="filteredProducts.length === 0" class="text-center py-16">
          <div class="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
          <p class="text-gray-500 mb-6">Comece criando seu primeiro produto ou ajuste sua busca.</p>
          <button
            @click="openModal()"
            class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Criar primeiro produto"
          >
            Criar Primeiro Produto
          </button>
        </div>
      <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr class="border-b border-gray-200">
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folhas</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Dimensões</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cor</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Kit</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Mão de Obra</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Custo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Preço à Vista</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço 12x</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lucro</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="product in filteredProducts" :key="product.id || product.key" :data-product-id="product.id" :data-product-key="product.key" class="hover:bg-gray-50">
              <td class="px-6 py-5 font-medium text-gray-900 text-sm">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="{
                  'bg-blue-100 text-blue-800': product.type === 'PORTA',
                  'bg-green-100 text-green-800': product.type === 'JANELA',
                  'bg-purple-100 text-purple-800': product.type === 'SACADA',
                  'bg-orange-100 text-orange-800': product.type === 'BASCULANTE',
                  'bg-gray-100 text-gray-800': product.type === 'FIXO',
                  'bg-gray-100 text-gray-500': !product.type
                }">
                  {{ product.type || '-' }}
                </span>
              </td>
              <td class="px-6 py-5 text-gray-700 text-sm">{{ product.sheets || '-' }}</td>
              <td class="px-6 py-5 text-gray-700 text-sm">
                <div class="text-xs">
                  <div>{{ product.width ? product.width + 'cm' : '-' }} × {{ product.height ? product.height + 'cm' : '-' }}</div>
                  <div class="text-gray-400">{{ product.measure ? product.measure.toFixed(2) + 'm²' : '-' }}</div>
                </div>
              </td>
              <td class="px-6 py-5 text-gray-700 text-sm">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="{
                  'bg-blue-100 text-blue-800': product.color === 'INCOLOR',
                  'bg-green-100 text-green-800': product.color === 'VERDE',
                  'bg-gray-100 text-gray-800': product.color === 'FUME',
                  'bg-amber-100 text-amber-800': product.color === 'BRONZE',
                  'bg-gray-100 text-gray-500': !product.color
                }">
                  {{ product.color || '-' }}
                </span>
              </td>
              <td class="px-6 py-5 text-gray-700 text-sm">
                <EditableValue
                  :model-value="product.accessory ?? product.kit ?? 0"
                  type="currency"
                  @save="(value) => handleKitSave(product, value)"
                />
              </td>
              <td class="px-6 py-5 font-mono text-blue-600 text-sm">
                <EditableCell 
                  :cost="product" 
                  field="laborValue" 
                  :is-money="true"
                  @update="(field, value) => handleLaborInlineEdit(field, value, product)"
                />
              </td>
              <td class="px-6 py-5 font-mono font-semibold text-gray-900 text-sm">{{ product.cost ? 'R$ ' + product.cost.toFixed(2) : '-' }}</td>
              <td class="px-6 py-5 font-mono font-semibold text-green-600 text-sm">{{ product.price ? 'R$ ' + product.price.toFixed(2) : '-' }}</td>
              <td class="px-6 py-5 text-sm">
                <div v-if="product.price" class="space-y-1">
                  <div class="font-mono font-semibold text-blue-600">R$ {{ (product.price * 1.2).toFixed(2) }}</div>
                  <div class="text-xs text-gray-500">12x de R$ {{ ((product.price * 1.2) / 12).toFixed(2) }}</div>
                </div>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-5 font-mono text-purple-600 font-semibold text-sm">{{ calculateProfit(product) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <button
                      @click="openModal(product)"
                      class="text-blue-600 hover:text-blue-900 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                      title="Editar Produto"
                      aria-label="Editar produto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button
                      @click="confirmDelete(product)"
                      class="text-red-600 hover:text-red-900 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                      title="Excluir Produto"
                      aria-label="Excluir produto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c-1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
            </tr>
          </tbody>
        </table>
      </div>
      
        <!-- Paginação -->
        <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="currentPage > 1 && handlePageChange(currentPage - 1)"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Página anterior"
            >
              Anterior
            </button>
            <button
              @click="currentPage < totalPages && handlePageChange(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Próxima página"
            >
              Próximo
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div class="flex items-center gap-4">
              <p class="text-sm text-gray-700">
                Mostrando
                <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
                até
                <span class="font-medium">{{ Math.min(currentPage * pageSize, totalItems) }}</span>
                de
                <span class="font-medium">{{ totalItems }}</span>
                resultados
              </p>
              <PageSizeSelector
                v-model="pageSize"
                @update:model-value="handlePageSizeChange"
              />
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  @click="currentPage > 1 && handlePageChange(currentPage - 1)"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Página anterior"
                >
                  <span class="sr-only">Anterior</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button
                  v-for="page in getVisiblePages()"
                  :key="page"
                  @click="handlePageChange(page)"
                  :class="[
                    page === currentPage
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
                  ]"
                  :aria-label="`Ir para página ${page}`"
                  :aria-current="page === currentPage ? 'page' : undefined"
                >
                  {{ page }}
                </button>
                <button
                  @click="currentPage < totalPages && handlePageChange(currentPage + 1)"
                  :disabled="currentPage === totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Próxima página"
                >
                  <span class="sr-only">Próximo</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Modal -->
      <ProductModal
        :open="showModal"
        :product="currentProduct"
        @update:open="showModal = $event"
        @save="saveProduct"
      />

      <!-- Delete Confirmation Dialog -->
      <DeleteConfirmDialog
        :open="showDeleteModal"
        :item-name="productToDelete ? `${productToDelete.type} - ${productToDelete.color}` : ''"
        @update:open="showDeleteModal = $event"
        @confirm="deleteProduct"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import productService from '../services/product'
import productCostService from '../services/product-cost'
import type { ProductDTO } from '../services/product'
import type { ProductCostDTO } from '../services/product-cost'
import type { PaginatedResponse } from '../services/order'
import EditableCell from '../components/EditableCell.vue'
import FilterBar from '../components/FilterBar.vue'
import PageSizeSelector from '../components/PageSizeSelector.vue'
import ProductModal from '../components/ProductModal.vue'
import DeleteConfirmDialog from '../components/DeleteConfirmDialog.vue'
import EditableValue from '../components/EditableValue.vue'
import { useNotification } from '../composables/useNotification'
import { useCurrency } from '../composables/useCurrency'

const notification = useNotification()
const { formatCurrency } = useCurrency()

const products = ref<ProductDTO[]>([])
const productCosts = ref<ProductCostDTO | null>(null)
const loading = ref(true)
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const selectedType = ref('')
const selectedColor = ref('')
const searchQuery = ref('')

// Paginação
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const totalPages = ref(0)

const currentProduct = ref<ProductDTO>({
  id: undefined,
  key: '',
  category: '',
  type: '',
  sheets: 0,
  accessory: 0,  // New field name
  kit: 0,        // Backward compatibility alias
  width: 0,
  height: 0,
  weight: 0,
  measure: 0,
  color: '',
  cost: 0,
  price: 0,
  profit: 0,
  laborValue: 0,
  createdDate: '',
  installments: []
})

const productToDelete = ref<ProductDTO | null>(null)

// Computed property para produtos filtrados (agora a filtragem é feita no backend)
const filteredProducts = computed(() => {
  return products.value
})

// Watchers para recarregar automaticamente quando os filtros mudarem
watch([selectedType, selectedColor, searchQuery], () => {
  currentPage.value = 1 // Reset para primeira página quando filtros mudarem
  loadProducts()
}, { deep: true })

function handlePageChange(page: number) {
  currentPage.value = page
  loadProducts()
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1 // Reset para primeira página
  loadProducts()
}

function getVisiblePages() {
  const maxVisible = 5
  const totalPagesValue = totalPages.value
  const currentPageValue = currentPage.value
  
  if (totalPagesValue <= maxVisible) {
    return Array.from({ length: totalPagesValue }, (_, i) => i + 1)
  }
  
  const half = Math.floor(maxVisible / 2)
  let start = Math.max(1, currentPageValue - half)
  let end = Math.min(totalPagesValue, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

onMounted(async () => {
  await Promise.all([loadProducts(), loadProductCosts()])
})

async function loadProductCosts() {
  try {
    const costs = await productCostService.getAll()
    if (costs && costs.length > 0) {
      productCosts.value = costs[0]
    }
  } catch (error) {
    console.error('Erro ao carregar custos:', error)
  }
}

async function loadProducts() {
  try {
    loading.value = true
    const params: any = {
      page: currentPage.value - 1, // API usa índice baseado em 0
      size: pageSize.value
    }
    
    // Só adicionar filtros se tiverem valores selecionados
    if (selectedType.value) {
      params.type = selectedType.value
    }
    if (selectedColor.value) {
      params.color = selectedColor.value
    }
    
    let response
    
    // Se há uma query de busca, usar o endpoint de search
    if (searchQuery.value.trim()) {
      params.query = searchQuery.value.trim()
      response = await productService.search(params)
    } else {
      response = await productService.getAll(params)
    }
    
    // Verificar se a resposta é paginada
    if (response && typeof response === 'object' && 'content' in response) {
      const paginatedResponse = response as PaginatedResponse<ProductDTO>
      products.value = paginatedResponse.content
      totalItems.value = paginatedResponse.totalElements
      totalPages.value = paginatedResponse.totalPages
    } else {
      // Fallback para API não paginada
      products.value = Array.isArray(response) ? response : []
      totalItems.value = products.value.length
      totalPages.value = 1
    }
  } catch (error) {
    console.error('Erro ao carregar produtos:', error)
  } finally {
    loading.value = false
  }
}


function calculateProfit(product: ProductDTO): string {
  if (!product.price || !product.cost) return '-'
  const profit = product.price - product.cost
  const margin = ((profit) / product.price) * 100
  return `R$ ${profit.toFixed(2)} (${margin.toFixed(1)}%)`
}

function applyFilters() {
  // Recarregar produtos com os novos filtros
  loadProducts()
}

function openModal(product?: ProductDTO) {
  if (product) {
    currentProduct.value = { ...product }

    // Sync accessory and kit for backward compatibility
    if (product.accessory !== undefined) {
      currentProduct.value.kit = product.accessory
    } else if (product.kit !== undefined) {
      currentProduct.value.accessory = product.kit
    }

    isEditing.value = true
  } else {
    currentProduct.value = {
      id: undefined,
      key: '',
      category: '',
      type: '',
      sheets: 0,
      accessory: 0,
      kit: 0,
      width: 0,
      height: 0,
      weight: 0,
      measure: 0,
      color: '',
      cost: 0,
      price: 0,
      profit: 0,
      laborValue: 0,
      createdDate: '',
      installments: []
    }
    isEditing.value = false
  }
  showModal.value = true
}

async function saveProduct(product: ProductDTO) {
  try {
    saving.value = true

    // Sync accessory with kit value before saving
    if (product.kit !== undefined) {
      product.accessory = product.kit
    } else if (product.accessory !== undefined) {
      product.kit = product.accessory
    }

    // Use id or key for updates
    const identifier = product.id?.toString() || product.key

    if (isEditing.value && identifier) {
      await productService.update(identifier, product)
      notification.success('Sucesso', 'Produto atualizado com sucesso')
    } else {
      const response = await productService.create(product)
      if (response && (response.id || response.key)) {
        product.id = response.id
        product.key = response.key || response.id?.toString()
      }
      notification.success('Sucesso', 'Produto criado com sucesso')
    }

    showModal.value = false
    await loadProducts()
  } catch (error) {
    console.error('Erro ao salvar produto:', error)
    notification.error('Erro', 'Erro ao salvar produto. Tente novamente.')
  } finally {
    saving.value = false
  }
}

function confirmDelete(product: ProductDTO) {
  productToDelete.value = product
  showDeleteModal.value = true
}

async function deleteProduct() {
  const identifier = productToDelete.value?.id?.toString() || productToDelete.value?.key
  if (!identifier) return

  try {
    await productService.delete(identifier)
    notification.success('Sucesso', 'Produto excluído com sucesso')
    showDeleteModal.value = false
    productToDelete.value = null
    await loadProducts()
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    notification.error('Erro', 'Erro ao excluir produto. Tente novamente.')
  }
}

// Handler for kit inline editing
async function handleKitSave(product: ProductDTO, value: number | string) {
  try {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value

    // Update both kit and accessory
    product.accessory = numericValue
    product.kit = numericValue

    // Call the service to update in backend
    const identifier = product.id?.toString() || product.key
    const updatedProduct = await productService.update(identifier!, product)

    // Update the product in local list with data returned from backend
    const productIndex = products.value.findIndex(p =>
      (p.id === product.id) || (p.key === product.key)
    )
    if (productIndex !== -1) {
      products.value[productIndex] = updatedProduct
    }

    notification.success('Sucesso', 'Kit atualizado com sucesso')
  } catch (error) {
    console.error('Erro ao salvar kit:', error)
    notification.error('Erro', 'Erro ao salvar o valor do kit. Tente novamente.')
    // Reload products to revert changes
    await loadProducts()
  }
}

// Função para lidar com edição inline dos valores dos vidros
async function handleGlassInlineEdit(field: string, value: number) {
  if (!productCosts.value) return

  try {
    // Atualizar o valor localmente
    (productCosts.value as any)[field] = value

    // Salvar no backend
    await productCostService.update(productCosts.value)

    notification.success('Sucesso', 'Custo do vidro atualizado com sucesso')

    // Recarregar produtos para refletir os novos custos
    await loadProducts()
  } catch (error) {
    console.error('Erro ao salvar custo do vidro:', error)
    notification.error('Erro', 'Erro ao salvar o valor do vidro. Tente novamente.')

    // Recarregar custos para reverter a mudança local
    await loadProductCosts()
  }
}

// Função para lidar com edição inline do valor da mão de obra
async function handleLaborInlineEdit(field: string, value: number, product: ProductDTO) {
  if (!product || !product.key || !productCosts.value) return

  try {
    // Determinar o campo correto baseado no tipo do produto, seguindo a lógica do backend
    let laborField = ''
    const productType = product.type

    if (productType === 'JANELA') {
      laborField = 'laborWindow'
    } else if (productType === 'SACADA') {
      laborField = 'laborBalcony'
    } else if (productType === 'BASCULANTE') {
      laborField = 'laborTilting'
    } else if (productType === 'FIXO') {
      laborField = 'laborFixed'
    } else if (productType === 'BOX') {
      laborField = 'laborBox'
    } else {
      laborField = 'laborDoor' // Default para PORTA
    }

    // Buscar o custo atual do TemperedGlassCost
    const currentCost = Array.isArray(productCosts.value) ? productCosts.value[0] : productCosts.value

    // Atualizar o campo correto no TemperedGlassCost
    const updatedCost = {
      ...currentCost,
      [laborField]: typeof value === 'string' ? parseFloat(value) : value
    }

    // Salvar via productCostService (endpoint /product-costs)
    await productCostService.update(updatedCost)

    notification.success('Sucesso', 'Mão de obra atualizada com sucesso')

    // Recarregar custos e produtos para refletir as mudanças
    await loadProductCosts()
    await loadProducts()

  } catch (error) {
    console.error('Erro ao atualizar mão de obra:', error)
    notification.error('Erro', 'Erro ao salvar mão de obra. Tente novamente.')
    // Recarregar em caso de erro
    await loadProductCosts()
    await loadProducts()
  }
}
</script>