<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 class="text-xl md:text-2xl font-semibold text-foreground">Produtos</h1>
          <p class="text-muted-foreground mt-1 hidden md:block">Gerencie seus produtos de vidro temperado</p>
        </div>
        <!-- Mobile: icon button / Desktop: full button -->
        <Button size="icon" class="rounded-full md:hidden" aria-label="Criar novo produto" @click="openModal()">
          <Plus class="w-5 h-5" />
        </Button>
        <Button class="hidden md:flex gap-2" @click="openModal()">
          <Plus class="w-4 h-4" />
          Novo Produto
        </Button>
      </div>

      <!-- Calculadora rápida (colapsada por default) -->
      <div class="mb-4">
        <QuickPriceCalculator />
      </div>

      <!-- Custos de vidro (strip editável, estilo resumo do Financeiro) -->
      <div class="mb-4">
        <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Custos de Vidro</p>
        <GlassCostQuickView />
      </div>

      <!-- Lista de Produtos -->
      <div class="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div class="px-4 sm:px-6 py-4 border-b border-border space-y-4">
          <div>
            <h2 class="text-lg font-medium text-foreground">Lista de Produtos</h2>
            <p class="text-xs text-muted-foreground mt-0.5">
              Agrupados por tipo, folhas e dimensões — expanda para ver o preço e os custos de cada cor
            </p>
          </div>

          <!-- Barra de Busca -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input v-model="searchQuery" type="text" placeholder="Buscar produtos..." class="pl-9" />
          </div>

          <!-- Banner de Seleção -->
          <Transition name="slide-down">
            <div
              v-if="hasSelection"
              class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg"
            >
              <div class="flex items-center gap-2">
                <BadgeCheck class="h-5 w-5 text-primary" />
                <span class="text-sm font-medium text-primary">
                  {{ selectedProductIds.size }} produto{{ selectedProductIds.size > 1 ? 's' : '' }} selecionado{{ selectedProductIds.size > 1 ? 's' : '' }}
                </span>
              </div>
              <div class="flex gap-2">
                <Button variant="outline" size="sm" @click="clearSelection">
                  Limpar Seleção
                </Button>
                <Button size="sm" class="gap-2" @click="openQuoteModal">
                  <FileText class="w-4 h-4" />
                  Criar Orçamento
                </Button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Loading: skeletons no idiom da lista -->
        <div v-if="loading" class="divide-y divide-border">
          <div v-for="i in 6" :key="i" class="flex items-center gap-3 px-4 py-3">
            <Skeleton class="w-4 h-4 rounded" />
            <div class="flex-1 space-y-1.5">
              <Skeleton class="h-4 w-40" />
              <Skeleton class="h-3 w-56" />
            </div>
            <Skeleton class="h-4 w-20" />
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredGroups.length === 0" class="text-center py-16">
          <div class="bg-muted rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Package class="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 class="text-xl font-semibold text-foreground mb-2">Nenhum produto encontrado</h3>
          <p class="text-muted-foreground mb-6">Comece criando seu primeiro produto ou ajuste sua busca.</p>
          <Button size="lg" aria-label="Criar primeiro produto" @click="openModal()">
            Criar Primeiro Produto
          </Button>
        </div>

        <!-- Lista: linha-pai expansível → cards por cor (progressive disclosure) -->
        <div v-else>
          <!-- Barra de seleção em massa -->
          <div class="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/40">
            <label class="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <Checkbox
                :model-value="isAllSelected"
                :disabled="products.length === 0"
                @update:model-value="toggleSelectAll"
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
        <Pagination
          v-if="totalPages > 1"
          :current-page="currentPage"
          :total-items="totalItems"
          :page-size="pageSize"
          @page-changed="handlePageChange"
          @page-size-changed="handlePageSizeChange"
        />
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
import { BadgeCheck, FileText, Package, Plus, Search } from 'lucide-vue-next'
import Button from '../components/ui/Button.vue'
import Input from '../components/ui/Input.vue'
import Checkbox from '../components/ui/Checkbox.vue'
import Skeleton from '../components/ui/Skeleton.vue'
import Pagination from '../components/ui/Pagination.vue'
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
