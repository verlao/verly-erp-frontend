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
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
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

      <!-- Barra de Busca -->
      <div class="mb-4">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <input 
            v-model="searchQuery" 
            @input="handleSearch"
            type="text" 
            placeholder="Buscar produtos..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

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
            class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
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
              <tr v-for="product in filteredProducts" :key="product.key" :data-product-key="product.key" class="hover:bg-gray-50">
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
                <input 
                  v-if="editingKit === product.key"
                  v-model="editKitValue"
                  @blur="saveKitValue()"
                  @keyup.enter="saveKitValue()"
                  @keyup.escape="cancelKitEdit()"
                  class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="R$ 0,00"
                  ref="kitInput"
                  autofocus
                />
                <span 
                  v-else
                  @click="startKitEdit(product)"
                  class="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                >
                  {{ formatCurrency(product.kit) }}
                </span>
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
                      @click="addToCart(product)" 
                      class="text-green-600 hover:text-green-900 p-1"
                      title="Adicionar ao Carrinho"
                      :disabled="!product.price"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L23 6H6"/></svg>
                    </button>
                    <button 
                      @click="openModal(product)" 
                      class="text-blue-600 hover:text-blue-900 p-1"
                      title="Editar Produto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button 
                      @click="confirmDelete(product)" 
                      class="text-red-600 hover:text-red-900 p-1"
                      title="Excluir Produto"
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
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button 
              @click="currentPage < totalPages && handlePageChange(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Mostrando
                <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
                até
                <span class="font-medium">{{ Math.min(currentPage * pageSize, totalItems) }}</span>
                de
                <span class="font-medium">{{ totalItems }}</span>
                resultados
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button 
                  @click="currentPage > 1 && handlePageChange(currentPage - 1)"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                  ]"
                >
                  {{ page }}
                </button>
                <button 
                  @click="currentPage < totalPages && handlePageChange(currentPage + 1)"
                  :disabled="currentPage === totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

      <!-- Modal de Produto -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-lg">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold text-gray-900">{{ isEditing ? 'Editar Produto' : 'Novo Produto' }}</h3>
            <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <form @submit.prevent="saveProduct" class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="type" class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select 
                id="type" 
                v-model="currentProduct.type" 
                required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione o tipo</option>
                <option value="PORTA">Porta</option>
                <option value="JANELA">Janela</option>
                <option value="SACADA">Sacada</option>
                <option value="BASCULANTE">Basculante</option>
                <option value="FIXO">Fixo</option>
              </select>
            </div>
            
            <div>
              <label for="sheets" class="block text-sm font-medium text-gray-700 mb-2">Folhas</label>
              <input 
                id="sheets" 
                v-model.number="currentProduct.sheets" 
                type="number" 
                min="0"
                step="1"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 2"
              />
            </div>
            
            <div>
              <label for="width" class="block text-sm font-medium text-gray-700 mb-2">Largura (cm)</label>
              <input 
                id="width" 
                v-model.number="currentProduct.width" 
                type="number" 
                step="0.01" 
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label for="height" class="block text-sm font-medium text-gray-700 mb-2">Altura (cm)</label>
              <input 
                id="height" 
                v-model.number="currentProduct.height" 
                type="number" 
                step="0.01" 
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label for="color" class="block text-sm font-medium text-gray-700 mb-2">Cor</label>
              <select 
                id="color" 
                v-model="currentProduct.color" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione a cor</option>
                <option value="INCOLOR">Incolor</option>
                <option value="VERDE">Verde</option>
                <option value="FUME">Fumê</option>
                <option value="BRONZE">Bronze</option>
              </select>
            </div>
            
            <div>
              <label for="kit" class="block text-sm font-medium text-gray-700 mb-2">Kit (R$)</label>
              <input 
                id="kit" 
                v-model="kitInputValue" 
                @input="handleKitInput"
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="R$ 0,00"
              />
            </div>
            
            <div>
              <label for="weight" class="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
              <input 
                id="weight" 
                v-model.number="currentProduct.weight" 
                type="number" 
                step="0.01" 
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <!-- Informação sobre cálculo automático -->
          <div class="mt-6 p-4 bg-blue-50 rounded-lg">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
              </svg>
              <p class="text-sm text-blue-700">
                O custo, preço e lucro serão calculados automaticamente com base nas configurações do sistema.
              </p>
            </div>
          </div>

          <!-- Informações de Preço (apenas para edição) -->
          <div v-if="isEditing && currentProduct.price" class="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 class="text-sm font-semibold text-green-800 mb-3 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
              Informações de Preço
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="text-center p-3 bg-white rounded-lg border">
                <div class="text-xs text-gray-500 mb-1">Preço à Vista</div>
                <div class="font-mono text-lg font-semibold text-gray-900">R$ {{ currentProduct.price.toFixed(2) }}</div>
              </div>
              <div class="text-center p-3 bg-white rounded-lg border">
                <div class="text-xs text-gray-500 mb-1">Preço Total 12x</div>
                <div class="font-mono text-lg font-semibold text-orange-600">R$ {{ (currentProduct.price * 1.2).toFixed(2) }}</div>
              </div>
              <div class="text-center p-3 bg-white rounded-lg border">
                <div class="text-xs text-gray-500 mb-1">Valor da Parcela</div>
                <div class="font-mono text-lg font-semibold text-blue-600">12x R$ {{ ((currentProduct.price * 1.2) / 12).toFixed(2) }}</div>
              </div>
            </div>
            <div class="mt-3 text-xs text-gray-600 text-center">
              * Parcelamento com taxa de 20% aplicada sobre o preço à vista
            </div>
          </div>
          
          <div class="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button 
              type="button" 
              @click="showModal = false" 
              class="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              :disabled="saving"
            >
              <span v-if="saving" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </span>
              <span v-else>{{ isEditing ? 'Atualizar' : 'Criar' }} Produto</span>
            </button>
          </div>
        </form>
      </div>
    </div>

      <!-- Modal de Confirmação de Exclusão -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Confirmar Exclusão</h3>
            <p class="text-sm text-gray-600 mb-6">
              Tem certeza que deseja excluir este produto?
              <br>
              <strong class="text-gray-900">{{ productToDelete?.type }} - {{ productToDelete?.color }}</strong>
              <br>
              <span class="text-xs text-gray-500">Esta ação não pode ser desfeita.</span>
            </p>
          </div>
          <div class="flex justify-end space-x-3">
            <button 
              type="button" 
              @click="showDeleteModal = false" 
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              :disabled="deleting"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              @click="deleteProduct" 
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-sm"
              :disabled="deleting"
            >
              <span v-if="deleting" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Excluindo...
              </span>
              <span v-else>Excluir Produto</span>
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import productService from '../services/product'
import productCostService from '../services/product-cost'
import type { ProductDTO } from '../services/product'
import type { ProductCostDTO } from '../services/product-cost'
import type { PaginatedResponse } from '../services/order'
import Pagination from '../components/ui/Pagination.vue'
import EditableCell from '../components/EditableCell.vue'
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore()
const products = ref<ProductDTO[]>([])
const productCosts = ref<ProductCostDTO | null>(null)
const loading = ref(true)
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const selectedType = ref('')
const selectedColor = ref('')
const searchQuery = ref('')

// Paginação
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const totalPages = ref(0)

const currentProduct = ref<ProductDTO>({
  key: '',
  category: '',
  type: '',
  sheets: 0,
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

// Variáveis para edição inline do kit
const editingKit = ref<string | null>(null)
const editKitValue = ref('')

// Variável para o input do kit no modal
const kitInputValue = ref('')

const productToDelete = ref<ProductDTO | null>(null)

// Computed property para produtos filtrados (agora a filtragem é feita no backend)
const filteredProducts = computed(() => {
  return products.value
})

// Watchers para recarregar automaticamente quando os filtros mudarem
watch([selectedType, selectedColor], () => {
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

// Função para lidar com a busca
let searchTimeout: number
function handleSearch() {
  // Debounce para evitar muitas requisições
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1 // Reset para primeira página
    loadProducts()
  }, 300)
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
    // Debug: Log do produto original
    console.log('openModal - Produto original:', product)
    console.log('openModal - Kit do produto:', product.kit)
    console.log('openModal - currentProduct após cópia:', currentProduct.value)
    console.log('openModal - Kit do currentProduct:', currentProduct.value.kit)
    
    // Sincronizar o valor do kit para o input com máscara
    kitInputValue.value = product.kit ? `R$ ${product.kit.toFixed(2).replace('.', ',')}` : ''
    console.log('openModal - kitInputValue definido como:', kitInputValue.value)
    isEditing.value = true
  } else {
    currentProduct.value = {
      key: '',
    category: '',
    type: '',
    sheets: 0,
    kit: 0,
    width: 0,
    height: 0,
    weight: 0,
    measure: 0,
    color: '',
    cost: 0,
      price: 0,
      profit: 0,
      createdDate: '',
      installments: []
    }
    kitInputValue.value = ''
    isEditing.value = false
  }
  showModal.value = true
}

async function saveProduct() {
  try {
    saving.value = true
    
    // Debug: Log do payload que será enviado
    console.log('Payload sendo enviado:', JSON.stringify(currentProduct.value, null, 2))
    console.log('Kit value:', currentProduct.value.kit)
    console.log('Kit input value:', kitInputValue.value)
    
    if (isEditing.value && currentProduct.value.key) {
      await productService.update(currentProduct.value.key, currentProduct.value)
    } else {
      const response = await productService.create(currentProduct.value)
      if (response && response.key) {
        currentProduct.value.key = response.key
      }
    }
    
    showModal.value = false
    await loadProducts()
  } catch (error) {
    console.error('Erro ao salvar produto:', error)
    alert('Erro ao salvar produto. Tente novamente.')
  } finally {
    saving.value = false
  }
}

function confirmDelete(product: ProductDTO) {
  productToDelete.value = product
  showDeleteModal.value = true
}

async function deleteProduct() {
  if (!productToDelete.value?.key) return
  
  try {
    deleting.value = true
    await productService.delete(productToDelete.value.key)
    showDeleteModal.value = false
    productToDelete.value = null
    await loadProducts()
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    alert('Erro ao excluir produto. Tente novamente.')
  } finally {
    deleting.value = false
  }
}

function addToCart(product: ProductDTO) {
  if (!product.price) {
    alert('Este produto não possui preço definido.')
    return
  }
  
  cartStore.addItem(product, 1)
  alert(`${product.type} - ${product.color} adicionado ao carrinho!`)
}

// Funções para edição inline do kit
function startKitEdit(product: ProductDTO) {
  editingKit.value = product.key || null
  editKitValue.value = product.kit?.toString() || ''
  
  // Garantir que o input receba foco após o DOM ser atualizado
  nextTick(() => {
    const input = document.querySelector(`input[ref="kitInput"]`) as HTMLInputElement
    if (input) {
      input.focus()
      input.select()
    }
  })
}

async function saveKitValue() {
  if (!editingKit.value) return
  
  const product = products.value.find(p => p.key === editingKit.value)
  if (!product) return
  
  const oldKitValue = product.kit
  
  try {
    const parsedValue = editKitValue.value.trim() === '' ? null : parseFloat(editKitValue.value)
    
    if (editKitValue.value.trim() !== '' && (isNaN(parsedValue!) || parsedValue! < 0)) {
      alert('Por favor, insira um valor válido para o kit')
      return
    }
    
    // Atualizar o produto localmente primeiro
     product.kit = parsedValue ?? undefined
    
    // Chamar o serviço para atualizar no backend
    const updatedProduct = await productService.update(product.key!, product)
    
    // Atualizar o produto na lista local com os dados retornados do backend
    const productIndex = products.value.findIndex(p => p.key === product.key)
    if (productIndex !== -1) {
      products.value[productIndex] = updatedProduct
    }
    
    // Limpar o estado de edição
    editingKit.value = null
    editKitValue.value = ''
  } catch (error) {
    console.error('Erro ao salvar kit:', error)
    
    // Reverter a mudança local em caso de erro
    product.kit = oldKitValue
    
    alert('Erro ao salvar o valor do kit. Tente novamente.')
  }
}

function cancelKitEdit() {
  editingKit.value = null
  editKitValue.value = ''
}

function formatCurrency(value: string | number | null | undefined): string {
  if (!value) return 'R$ 0,00'
  
  // Se for string, retorna como está
  if (typeof value === 'string') {
    return value.startsWith('R$') ? value : `R$ ${value}`
  }
  
  // Se for número, formata como moeda
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

function calculateInstallmentPrice(price: number | undefined): number {
  if (!price) return 0
  // Aplicar taxa de 20% para parcelamento em 12x
  return price * 1.2
}

// Função para lidar com input do kit no modal
function handleKitInput(event: Event) {
  const target = event.target as HTMLInputElement
  let value = target.value
  
  // Remove tudo que não é dígito
  value = value.replace(/\D/g, '')
  
  if (value === '') {
    kitInputValue.value = ''
    currentProduct.value.kit = 0
    return
  }
  
  // Converte para número e divide por 100 para ter centavos
  const numericValue = parseInt(value) / 100
  
  // Formata como moeda brasileira
  kitInputValue.value = `R$ ${numericValue.toFixed(2).replace('.', ',')}`
  currentProduct.value.kit = numericValue
  
  // Debug: Log para verificar os valores
  console.log('handleKitInput - Raw value:', target.value)
  console.log('handleKitInput - Cleaned value:', value)
  console.log('handleKitInput - Numeric value:', numericValue)
  console.log('handleKitInput - currentProduct.kit:', currentProduct.value.kit)
}

// Função para lidar com edição inline dos valores dos vidros
async function handleGlassInlineEdit(field: string, value: number) {
  if (!productCosts.value) return
  
  try {
    // Atualizar o valor localmente
    (productCosts.value as any)[field] = value
    
    // Salvar no backend
    await productCostService.update(productCosts.value)
    
    // Recarregar produtos para refletir os novos custos
    await loadProducts()
  } catch (error) {
    console.error('Erro ao salvar custo do vidro:', error)
    alert('Erro ao salvar o valor do vidro. Tente novamente.')
    
    // Recarregar custos para reverter a mudança local
    await loadProductCosts()
  }
}

// Função para lidar com edição inline do valor da mão de obra
async function handleLaborInlineEdit(field: string, value: number, product: ProductDTO) {
  if (!product || !product.key || !productCosts.value) return
  
  try {
    console.log('handleLaborInlineEdit chamado:', { product: product.type, value })
    
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
    
    console.log('Campo de mão de obra determinado:', laborField)
    
    // Buscar o custo atual do TemperedGlassCost
    const currentCost = Array.isArray(productCosts.value) ? productCosts.value[0] : productCosts.value
    console.log('Custo atual:', currentCost)
    
    // Atualizar o campo correto no TemperedGlassCost
    const updatedCost = {
      ...currentCost,
      [laborField]: typeof value === 'string' ? parseFloat(value) : value
    }
    
    console.log('Custo atualizado:', updatedCost)
    
    // Salvar via productCostService (endpoint /product-costs)
    console.log('Chamando productCostService.update...')
    await productCostService.update(updatedCost)
    console.log('productCostService.update concluído')
    
    // Recarregar custos e produtos para refletir as mudanças
    await loadProductCosts()
    await loadProducts()
    
  } catch (error) {
    console.error('Erro ao atualizar mão de obra:', error)
    alert('Erro ao salvar mão de obra. Tente novamente.')
    // Recarregar em caso de erro
    await loadProductCosts()
    await loadProducts()
  }
}
</script>