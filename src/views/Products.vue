<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-semibold text-foreground">Produtos</h1>
          <p class="text-muted-foreground mt-1">Gerencie seus produtos de vidro temperado</p>
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

      <!-- Calculadora rápida (colapsada por default) -->
      <div class="mb-4">
        <QuickPriceCalculator />
      </div>

      <!-- Lista de Produtos -->
      <div class="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div class="px-4 sm:px-6 py-4 border-b border-border space-y-4">
          <!-- Header com título e custos de vidro -->
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h2 class="text-lg font-medium text-foreground">Lista de Produtos</h2>
              <p class="text-xs text-muted-foreground mt-0.5">
                Agrupados por tipo, folhas e dimensões — expanda para ver o preço e os custos de cada cor
              </p>
            </div>

            <!-- Custos de Vidro - Quick View -->
            <div class="flex items-center gap-2">
              <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Custos de Vidro:</span>
              <GlassCostQuickView />
            </div>
          </div>

          <!-- Barra de Busca -->
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar produtos..."
              class="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <!-- Banner de Seleção -->
          <Transition name="slide-down">
            <div
              v-if="hasSelection"
              class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm font-medium text-blue-900">
                  {{ selectedProductIds.size }} produto{{ selectedProductIds.size > 1 ? 's' : '' }} selecionado{{ selectedProductIds.size > 1 ? 's' : '' }}
                </span>
              </div>
              <div class="flex gap-2">
                <button
                  @click="clearSelection"
                  class="px-3 py-1.5 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded transition-colors"
                >
                  Limpar Seleção
                </button>
                <button
                  @click="openQuoteModal"
                  class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                  </svg>
                  Criar Orçamento
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="flex items-center space-x-3">
            <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-muted-foreground font-medium">Carregando produtos...</span>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredGroups.length === 0" class="text-center py-16">
          <div class="bg-muted rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
          </div>
          <h3 class="text-xl font-semibold text-foreground mb-2">Nenhum produto encontrado</h3>
          <p class="text-muted-foreground mb-6">Comece criando seu primeiro produto ou ajuste sua busca.</p>
          <button
            @click="openModal()"
            class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Criar primeiro produto"
          >
            Criar Primeiro Produto
          </button>
        </div>

        <!-- Lista: linha-pai expansível → cards por cor (progressive disclosure) -->
        <div v-else>
          <!-- Barra de seleção em massa -->
          <div class="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/40">
            <label class="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
                :disabled="products.length === 0"
                class="w-4 h-4 text-blue-600 bg-background border-border rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              Selecionar todos
            </label>
            <span class="text-xs text-muted-foreground ml-auto">{{ totalItems }} grupo{{ totalItems === 1 ? '' : 's' }}</span>
          </div>

          <div class="divide-y divide-border">
            <div v-for="group in pagedGroups" :key="group.key">
              <ProductGroupRow
                :group="group"
                :expanded="isExpanded(group)"
                @toggle="toggleGroup(group)"
              />
              <div
                v-if="isExpanded(group)"
                class="bg-muted/20 px-3 sm:px-4 pb-4 pt-1 grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
              >
                <ProductVariantCard
                  v-for="product in group.variants"
                  :key="product.id || product.key"
                  :product="product"
                  :selected="!!(product.id && selectedProductIds.has(product.id))"
                  @toggle-select="toggleProduct(product.id)"
                  @edit="openModal(product)"
                  @delete="confirmDelete(product)"
                  @save-kit="(v) => handleKitSave(product, v)"
                  @save-labor="(v) => handleLaborSave(product, v)"
                  @save-gain="(v) => handleGainSave(product, v)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Paginação -->
        <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-3 bg-card border-t border-border">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="currentPage > 1 && handlePageChange(currentPage - 1)"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-foreground bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Página anterior"
            >
              Anterior
            </button>
            <button
              @click="currentPage < totalPages && handlePageChange(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-foreground bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Próxima página"
            >
              Próximo
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div class="flex items-center gap-4">
              <p class="text-sm text-foreground">
                Mostrando
                <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
                até
                <span class="font-medium">{{ Math.min(currentPage * pageSize, totalItems) }}</span>
                de
                <span class="font-medium">{{ totalItems }}</span>
                grupos
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
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-border bg-card text-sm font-medium text-muted-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
                      : 'bg-card border-border text-muted-foreground hover:bg-accent',
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
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-border bg-card text-sm font-medium text-muted-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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

      <!-- Gerenciamento de Custos -->
      <div class="mt-6">
        <CostsAccordion />
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

      <!-- Modal de Quote -->
      <QuoteModal
        :is-open="showQuoteModal"
        :products="selectedProducts"
        @close="showQuoteModal = false"
        @success="handleQuoteSuccess"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import productService from '../services/product'
import type { ProductDTO } from '../services/product'
import laborCostService from '../services/labor-cost'
import accessoryCostService from '../services/accessory-cost'
import gainService from '../services/gain'
import PageSizeSelector from '../components/PageSizeSelector.vue'
import ProductModal from '../components/ProductModal.vue'
import DeleteConfirmDialog from '../components/DeleteConfirmDialog.vue'
import GlassCostQuickView from '../components/GlassCostQuickView.vue'
import CostsAccordion from '../components/CostsAccordion.vue'
import QuoteModal from '../components/QuoteModal.vue'
import QuickPriceCalculator from '../components/QuickPriceCalculator.vue'
import ProductGroupRow from '../components/products/ProductGroupRow.vue'
import ProductVariantCard from '../components/products/ProductVariantCard.vue'
import { type ProductGroup } from '../lib/productDisplay'
import { useNotification } from '../composables/useNotification'

const notification = useNotification()

const products = ref<ProductDTO[]>([])
const loading = ref(true)
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const searchQuery = ref('')

// Grupos expandidos (por key). Grupos de 1 cor são sempre exibidos.
const expandedKeys = ref<Set<string>>(new Set())

// Seleção em massa para orçamento
const selectedProductIds = ref<Set<number>>(new Set())
const showQuoteModal = ref(false)

// Paginação client-side (por grupo)
const currentPage = ref(1)
const pageSize = ref(10)

const currentProduct = ref<ProductDTO>({
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
})

const productToDelete = ref<ProductDTO | null>(null)

// Agrupa os produtos por tipo+folhas+dimensões, com as cores como variantes.
const allGroups = computed<ProductGroup[]>(() => {
  const map = new Map<string, ProductGroup>()
  for (const p of products.value) {
    const key = `${p.type}|${p.sheets}|${p.width}|${p.height}`
    let g = map.get(key)
    if (!g) {
      g = {
        key,
        type: p.type,
        sheets: p.sheets,
        width: p.width,
        height: p.height,
        measure: p.measure,
        standard: p.standard,
        variants: [],
        colorCount: 0,
        priceMin: Infinity,
        priceMax: 0
      }
      map.set(key, g)
    }
    g.variants.push(p)
    if (typeof p.price === 'number') {
      g.priceMin = Math.min(g.priceMin, p.price)
      g.priceMax = Math.max(g.priceMax, p.price)
    }
  }
  const groups = Array.from(map.values())
  for (const g of groups) {
    g.variants.sort((a, b) => (a.color || '').localeCompare(b.color || ''))
    g.colorCount = g.variants.length
    if (g.priceMin === Infinity) g.priceMin = 0
  }
  groups.sort(
    (a, b) =>
      (a.type || '').localeCompare(b.type || '') ||
      (a.sheets || 0) - (b.sheets || 0) ||
      (a.width || 0) - (b.width || 0) ||
      (a.height || 0) - (b.height || 0)
  )
  return groups
})

// Busca client-side por tipo, cor ou dimensões.
const filteredGroups = computed<ProductGroup[]>(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return allGroups.value
  return allGroups.value.filter(
    g =>
      (g.type || '').toLowerCase().includes(q) ||
      g.variants.some(v => (v.color || '').toLowerCase().includes(q)) ||
      `${g.width}x${g.height}`.includes(q)
  )
})

const totalItems = computed(() => filteredGroups.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredGroups.value.length / pageSize.value)))
const pagedGroups = computed<ProductGroup[]>(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredGroups.value.slice(start, start + pageSize.value)
})

// Mantém a página válida quando os filtros reduzem o total.
watch([filteredGroups, pageSize], () => {
  if (currentPage.value > totalPages.value) currentPage.value = 1
})

// Computed para seleção em massa
const hasSelection = computed(() => selectedProductIds.value.size > 0)

const selectedProducts = computed(() => {
  return products.value.filter(p => p.id && selectedProductIds.value.has(p.id))
})

const isAllSelected = computed(() => {
  const ids = products.value.filter(p => p.id).map(p => p.id!)
  return ids.length > 0 && ids.every(id => selectedProductIds.value.has(id))
})

function isExpanded(group: ProductGroup): boolean {
  return group.colorCount === 1 || expandedKeys.value.has(group.key)
}

function toggleGroup(group: ProductGroup) {
  if (group.colorCount === 1) return
  const next = new Set(expandedKeys.value)
  if (next.has(group.key)) next.delete(group.key)
  else next.add(group.key)
  expandedKeys.value = next
}

function handlePageChange(page: number) {
  currentPage.value = page
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
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
  const end = Math.min(totalPagesValue, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

onMounted(async () => {
  await loadProducts()
})

async function loadProducts() {
  try {
    loading.value = true
    // Catálogo completo (não paginado) para agrupar por produto no cliente.
    const response = await productService.getAllNonPaginated()
    products.value = Array.isArray(response) ? response : response?.content ?? []
  } catch (error) {
    console.error('Erro ao carregar produtos:', error)
    products.value = []
  } finally {
    loading.value = false
  }
}

function openModal(product?: ProductDTO) {
  if (product) {
    currentProduct.value = { ...product }

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

    if (product.kit !== undefined) {
      product.accessory = product.kit
    } else if (product.accessory !== undefined) {
      product.kit = product.accessory
    }

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

// Funções de seleção em massa
function toggleProduct(productId: number | undefined) {
  if (!productId) return
  const next = new Set(selectedProductIds.value)
  if (next.has(productId)) next.delete(productId)
  else next.add(productId)
  selectedProductIds.value = next
}

function toggleSelectAll() {
  const allIds = products.value.filter(p => p.id).map(p => p.id!)
  const next = new Set(selectedProductIds.value)
  if (isAllSelected.value) {
    allIds.forEach(id => next.delete(id))
  } else {
    allIds.forEach(id => next.add(id))
  }
  selectedProductIds.value = next
}

function clearSelection() {
  selectedProductIds.value = new Set()
}

function openQuoteModal() {
  if (selectedProducts.value.length === 0) return
  showQuoteModal.value = true
}

function handleQuoteSuccess() {
  showQuoteModal.value = false
  clearSelection()
  notification.success('Sucesso', 'Orçamento criado com sucesso')
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

    if (numericValue === undefined || numericValue === null || isNaN(numericValue)) {
      notification.error('Erro', 'Valor inválido')
      return
    }

    if (!product.type || product.sheets === undefined || !product.width || !product.height) {
      notification.error('Erro', 'Produto precisa ter tipo, folhas e dimensões definidos')
      return
    }

    await accessoryCostService.updateInline(
      product.type,
      product.sheets,
      product.width,
      product.height,
      numericValue
    )

    notification.success('Sucesso', 'Kit atualizado para todos os produtos com mesmas dimensões')
    await loadProducts()
  } catch (error: any) {
    console.error('Erro ao salvar kit:', error)
    const msg = error.response?.data?.message || 'Erro ao salvar o valor do kit. Tente novamente.'
    notification.error('Erro', msg)
    await loadProducts()
  }
}

// Handler for labor (mão de obra) inline editing
async function handleLaborSave(product: ProductDTO, value: number | string) {
  try {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value

    if (numericValue === undefined || numericValue === null || isNaN(numericValue)) {
      notification.error('Erro', 'Valor inválido')
      return
    }

    if (!product.type || product.sheets === undefined) {
      notification.error('Erro', 'Produto precisa ter tipo e número de folhas definidos')
      return
    }

    await laborCostService.updateInline(product.type, product.sheets, numericValue)

    notification.success('Sucesso', 'Mão de obra atualizada com sucesso')
    await loadProducts()
  } catch (error: any) {
    console.error('Erro ao salvar mão de obra:', error)
    const errorMessage = error.response?.data?.message || 'Erro ao atualizar mão de obra. Tente novamente.'
    notification.error('Erro', errorMessage)
    await loadProducts()
  }
}

async function handleGainSave(product: ProductDTO, value: number | string) {
  try {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value

    if (numericValue === undefined || numericValue === null || isNaN(numericValue)) {
      notification.error('Erro', 'Valor inválido')
      return
    }

    if (!product.type || product.sheets === undefined || !product.color) {
      notification.error('Erro', 'Produto precisa ter tipo, cor e número de folhas definidos')
      return
    }

    await gainService.updateInline(product.type, product.color, product.sheets, numericValue)

    notification.success('Sucesso', 'Ganho atualizado com sucesso')
    await loadProducts()
  } catch (error: any) {
    console.error('Erro ao salvar ganho:', error)
    const errorMessage = error.response?.data?.message || 'Erro ao atualizar ganho. Tente novamente.'
    notification.error('Erro', errorMessage)
    await loadProducts()
  }
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-12px);
  max-height: 0;
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 200px;
}
</style>
