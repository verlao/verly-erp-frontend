<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      <!-- Gerenciamento de Custos -->
      <div class="mb-6">
        <CostsAccordion />
      </div>

      <!-- Tabela de Produtos -->
      <div class="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div class="px-4 sm:px-6 py-4 border-b border-border space-y-4">
          <!-- Header com título e custos de vidro -->
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <!-- Título -->
            <div>
              <h2 class="text-lg font-medium text-foreground">Lista de Produtos</h2>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path
                      fill-rule="evenodd"
                      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Criar Orçamento
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="flex items-center space-x-3">
            <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-muted-foreground font-medium">Carregando produtos...</span>
          </div>
        </div>

        <div v-else-if="filteredProducts.length === 0" class="text-center py-16">
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
      <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-muted">
              <tr class="border-b border-border">
                <th class="px-3 py-2 text-center text-[10px] sm:text-xs w-12">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                    class="w-4 h-4 text-blue-600 bg-background border-border rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    :disabled="products.length === 0"
                  />
                </th>
                <th class="px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo</th>
                <th class="px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Folhas</th>
                <th class="px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Dimensões</th>
                <th class="px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Cor</th>
                <th class="px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Kit</th>
                <th class="px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Mão de Obra</th>
                <th class="px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Ganho %</th>
                <th class="px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Custo</th>
                <th class="px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Preço à Vista</th>
                <th class="px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Preço Parcelado</th>
                <th class="px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Lucro</th>
                <th class="px-3 py-2 text-center text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="bg-card divide-y divide-border">
              <tr v-for="product in filteredProducts" :key="product.id || product.key" :data-product-id="product.id" :data-product-key="product.key" class="hover:bg-accent/50">
              <td class="px-3 py-3 text-center">
                <input
                  type="checkbox"
                  :checked="!!(product.id && selectedProductIds.has(product.id))"
                  @change="toggleProduct(product.id)"
                  class="w-4 h-4 text-blue-600 bg-background border-border rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
              </td>
              <td class="px-3 py-3 font-medium text-foreground text-xs sm:text-sm">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap" :class="{
                  'bg-blue-100 text-blue-800': product.type === 'PORTA',
                  'bg-green-100 text-green-800': product.type === 'JANELA',
                  'bg-purple-100 text-purple-800': product.type === 'SACADA',
                  'bg-orange-100 text-orange-800': product.type === 'BASCULANTE',
                  'bg-cyan-100 text-cyan-800': product.type === 'BOX',
                  'bg-gray-100 text-gray-800': product.type === 'FIXO',
                  'bg-gray-100 text-gray-500': !product.type
                }">
                  {{ product.type || '-' }}
                </span>
              </td>
              <td class="px-3 py-3 text-foreground text-xs sm:text-sm">{{ product.sheets || '-' }}</td>
              <td class="px-3 py-3 text-foreground text-xs">
                <div class="whitespace-nowrap">
                  <div>{{ product.width ? product.width + 'cm' : '-' }} × {{ product.height ? product.height + 'cm' : '-' }}</div>
                  <div class="text-muted-foreground">{{ product.measure ? product.measure.toFixed(2) + 'm²' : '-' }}</div>
                </div>
              </td>
              <td class="px-3 py-3 text-foreground text-xs sm:text-sm">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap" :class="{
                  'bg-indigo-100 text-indigo-800': product.color === 'INCOLOR',
                  'bg-emerald-100 text-emerald-800': product.color === 'VERDE',
                  'bg-slate-100 text-slate-800': product.color === 'FUME',
                  'bg-yellow-100 text-yellow-800': product.color === 'BRONZE',
                  'bg-gray-100 text-gray-500': !product.color
                }">
                  {{ product.color || '-' }}
                </span>
              </td>
              <td class="px-3 py-3 text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                <EditableValue
                  :model-value="product.accessory ?? product.kit ?? 0"
                  type="currency"
                  @save="(value) => handleKitSave(product, value)"
                  compact
                />
              </td>
              <td class="px-3 py-3 text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                <EditableValue
                  :model-value="product.laborValue ?? 0"
                  type="currency"
                  @save="(value) => handleLaborSave(product, value)"
                  compact
                />
              </td>
              <td class="px-3 py-3 text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                <EditableValue
                  :model-value="product.gainValue ?? 0"
                  type="number"
                  @save="(value) => handleGainSave(product, value)"
                  compact
                  suffix="%"
                />
              </td>
              <td class="px-3 py-3 font-mono font-semibold text-foreground text-xs sm:text-sm whitespace-nowrap">{{ product.cost ? 'R$ ' + product.cost.toFixed(2) : '-' }}</td>
              <td class="px-3 py-3 font-mono font-semibold text-green-600 text-xs sm:text-sm whitespace-nowrap">{{ product.price ? 'R$ ' + product.price.toFixed(2) : '-' }}</td>
              <td class="px-3 py-3 text-xs sm:text-sm">
                <div v-if="product.priceOptions" class="space-y-0.5">
                  <div v-if="product.priceOptions.installments4x" class="whitespace-nowrap text-[10px] sm:text-xs text-muted-foreground">
                    4x de R$ {{ (product.priceOptions.installments4x / 4).toFixed(2) }}
                  </div>
                  <div v-if="product.priceOptions.installments6x" class="whitespace-nowrap text-[10px] sm:text-xs text-muted-foreground">
                    6x de R$ {{ (product.priceOptions.installments6x / 6).toFixed(2) }}
                  </div>
                  <div v-if="product.priceOptions.installments10x" class="whitespace-nowrap text-[10px] sm:text-xs text-muted-foreground">
                    10x de R$ {{ (product.priceOptions.installments10x / 10).toFixed(2) }}
                  </div>
                  <div v-if="product.priceOptions.installments12x" class="whitespace-nowrap text-[10px] sm:text-xs text-muted-foreground">
                    12x de R$ {{ (product.priceOptions.installments12x / 12).toFixed(2) }}
                  </div>
                </div>
                <span v-else class="text-muted-foreground">-</span>
              </td>
              <td class="px-3 py-3 font-mono text-purple-600 font-semibold text-xs sm:text-sm whitespace-nowrap">{{ calculateProfit(product) }}</td>
              <td class="px-3 py-3 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                  <div class="flex justify-end space-x-1 sm:space-x-2">
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
import type { PaginatedResponse } from '../services/order'
import laborCostService from '../services/labor-cost'
import accessoryCostService from '../services/accessory-cost'
import gainService from '../services/gain'
import FilterBar from '../components/FilterBar.vue'
import PageSizeSelector from '../components/PageSizeSelector.vue'
import ProductModal from '../components/ProductModal.vue'
import DeleteConfirmDialog from '../components/DeleteConfirmDialog.vue'
import GlassCostQuickView from '../components/GlassCostQuickView.vue'
import EditableValue from '../components/EditableValue.vue'
import CostsAccordion from '../components/CostsAccordion.vue'
import QuoteModal from '../components/QuoteModal.vue'
import { useNotification } from '../composables/useNotification'
import { useCurrency } from '../composables/useCurrency'

const notification = useNotification()
const { formatCurrency } = useCurrency()

const products = ref<ProductDTO[]>([])
const loading = ref(true)
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const searchQuery = ref('')

// Seleção em massa para orçamento
const selectedProductIds = ref<Set<number>>(new Set())
const showQuoteModal = ref(false)

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

// Computed para seleção em massa
const hasSelection = computed(() => selectedProductIds.value.size > 0)

const selectedProducts = computed(() => {
  return products.value.filter(p => p.id && selectedProductIds.value.has(p.id))
})

const isAllSelected = computed(() => {
  const currentPageIds = products.value
    .filter(p => p.id)
    .map(p => p.id!)
  return currentPageIds.length > 0 && 
         currentPageIds.every(id => selectedProductIds.value.has(id))
})

// Watcher para recarregar automaticamente quando a busca mudar
watch(searchQuery, () => {
  currentPage.value = 1 // Reset para primeira página quando a busca mudar
  loadProducts()
})

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
  await loadProducts()
})

async function loadProducts() {
  try {
    loading.value = true
    const params: any = {
      page: currentPage.value - 1, // API usa índice baseado em 0
      size: pageSize.value
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
  return `R$ ${profit.toFixed(2)}`
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

// Funções de seleção em massa
function toggleProduct(productId: number | undefined) {
  if (!productId) return
  if (selectedProductIds.value.has(productId)) {
    selectedProductIds.value.delete(productId)
  } else {
    selectedProductIds.value.add(productId)
  }
}

function toggleSelectAll() {
  const allIds = products.value.filter(p => p.id).map(p => p.id!)
  if (isAllSelected.value) {
    allIds.forEach(id => selectedProductIds.value.delete(id))
  } else {
    allIds.forEach(id => selectedProductIds.value.add(id))
  }
}

function clearSelection() {
  selectedProductIds.value.clear()
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

    // Use inline endpoint - updates all products with same type+sheets+width+height
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
    
    // Validar que o valor não seja undefined ou null ou NaN
    if (numericValue === undefined || numericValue === null || isNaN(numericValue)) {
      notification.error('Erro', 'Valor inválido')
      return
    }

    // Validar que o produto tem type e sheets
    if (!product.type || product.sheets === undefined) {
      notification.error('Erro', 'Produto precisa ter tipo e número de folhas definidos')
      return
    }

    // Usar o endpoint inline que atualiza por type e sheets
    await laborCostService.updateInline(product.type, product.sheets, numericValue)

    notification.success('Sucesso', 'Mão de obra atualizada com sucesso')
    
    // Reload products to get all updated values (cost, price, profit, etc)
    await loadProducts()
  } catch (error: any) {
    console.error('Erro ao salvar mão de obra:', error)
    const errorMessage = error.response?.data?.message || 'Erro ao atualizar mão de obra. Tente novamente.'
    notification.error('Erro', errorMessage)
    // Reload products to revert changes
    await loadProducts()
  }
}

async function handleGainSave(product: ProductDTO, value: number | string) {
  try {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value
    
    // Validar que o valor não seja undefined ou null ou NaN
    if (numericValue === undefined || numericValue === null || isNaN(numericValue)) {
      notification.error('Erro', 'Valor inválido')
      return
    }

    // Validar que o produto tem type e sheets
    if (!product.type || product.sheets === undefined) {
      notification.error('Erro', 'Produto precisa ter tipo e número de folhas definidos')
      return
    }

    // Buscar o ganho existente por type e sheets
    const gains = await gainService.getAll()
    const existingGain = gains.find(g => g.type === product.type && g.sheets === product.sheets)
    
    if (!existingGain || !existingGain.id) {
      notification.error('Erro', 'Ganho não encontrado para esse tipo e número de folhas')
      return
    }

    // Atualizar o ganho
    await gainService.update(existingGain.id, {
      ...existingGain,
      gainValue: numericValue
    })

    notification.success('Sucesso', 'Ganho atualizado com sucesso')
    
    // Reload products to get all updated values (cost, price, profit, etc)
    await loadProducts()
  } catch (error: any) {
    console.error('Erro ao salvar ganho:', error)
    const errorMessage = error.response?.data?.message || 'Erro ao atualizar ganho. Tente novamente.'
    notification.error('Erro', errorMessage)
    // Reload products to revert changes
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