<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Configurações de Preços</h1>
      <p class="mt-2 text-sm text-gray-600">
        Gerencie as configurações que afetam o cálculo de preços dos produtos
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Erro ao carregar configurações</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Accordions -->
    <div v-else class="space-y-4">
      
      <!-- Accordion 1: Taxas de Cartão -->
      <div class="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <button
          @click="toggleAccordion('creditCard')"
          class="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 transition-colors"
        >
          <div class="flex items-center space-x-3">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
            <div class="text-left">
              <h2 class="text-lg font-semibold text-gray-900">Taxas de Cartão de Crédito</h2>
              <p class="text-sm text-gray-600">Configure as taxas para débito e parcelamentos</p>
            </div>
          </div>
          <svg 
            class="w-5 h-5 text-gray-500 transition-transform duration-200" 
            :class="{ 'rotate-180': activeAccordion === 'creditCard' }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-screen opacity-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="max-h-screen opacity-100"
          leave-to-class="max-h-0 opacity-0"
        >
          <div v-show="activeAccordion === 'creditCard'" class="border-t border-gray-200">
            <div class="p-6">
              <div v-if="creditCardCost" class="space-y-6">
                <!-- Débito -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Taxa de Débito
                  </h3>
                  <div class="grid grid-cols-1 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Débito (%)</label>
                      <input
                        v-model.number="creditCardCost.debit"
                        type="number"
                        step="0.01"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @change="saveCreditCardCost"
                      />
                    </div>
                  </div>
                </div>

                <!-- Parcelamentos -->
                <div class="bg-blue-50 p-4 rounded-lg">
                  <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Taxas de Parcelamento (%)
                  </h3>
                  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div v-for="i in 18" :key="`tax${i}x`">
                      <label class="block text-sm font-medium text-gray-700 mb-1">{{ i }}x</label>
                      <input
                        v-model.number="creditCardCost[`tax${i}x`]"
                        type="number"
                        step="0.01"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        @change="saveCreditCardCost"
                      />
                    </div>
                  </div>
                </div>

                <!-- Save Button -->
                <div class="flex justify-end pt-4">
                  <button
                    @click="saveCreditCardCost"
                    :disabled="savingCreditCard"
                    class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span v-if="savingCreditCard">Salvando...</span>
                    <span v-else>Salvar Taxas</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Accordion 2: Mão de Obra -->
      <div class="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <button
          @click="toggleAccordion('labor')"
          class="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-150 transition-colors"
        >
          <div class="flex items-center space-x-3">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <div class="text-left">
              <h2 class="text-lg font-semibold text-gray-900">Custo de Mão de Obra</h2>
              <p class="text-sm text-gray-600">Configure os valores por tipo e quantidade de folhas</p>
            </div>
          </div>
          <svg 
            class="w-5 h-5 text-gray-500 transition-transform duration-200" 
            :class="{ 'rotate-180': activeAccordion === 'labor' }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-screen opacity-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="max-h-screen opacity-100"
          leave-to-class="max-h-0 opacity-0"
        >
          <div v-show="activeAccordion === 'labor'" class="border-t border-gray-200">
            <div class="p-6">
              <!-- Add New Labor Cost -->
              <div class="bg-green-50 p-4 rounded-lg mb-6">
                <h3 class="text-sm font-semibold text-gray-700 mb-3">Adicionar Novo</h3>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      v-model="newLaborCost.type"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="PORTA">PORTA</option>
                      <option value="JANELA">JANELA</option>
                      <option value="BOX">BOX</option>
                      <option value="FIXO">FIXO</option>
                      <option value="BASCULANTE">BASCULANTE</option>
                      <option value="SACADA">SACADA</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Folhas</label>
                    <input
                      v-model.number="newLaborCost.sheets"
                      type="number"
                      min="1"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                    <input
                      v-model.number="newLaborCost.laborValue"
                      type="number"
                      step="0.01"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div class="flex items-end">
                    <button
                      @click="addLaborCost"
                      class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>

              <!-- Labor Costs Table -->
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folhas</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor (R$)</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="labor in laborCosts" :key="labor.id" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ labor.type }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ labor.sheets }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          v-model.number="labor.laborValue"
                          type="number"
                          step="0.01"
                          class="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          @change="updateLaborCost(labor)"
                        />
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          @click="deleteLaborCost(labor.id!)"
                          class="text-red-600 hover:text-red-900 transition-colors"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Accordion 3: Valor do Vidro -->
      <div class="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <button
          @click="toggleAccordion('glass')"
          class="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-150 transition-colors"
        >
          <div class="flex items-center space-x-3">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <div class="text-left">
              <h2 class="text-lg font-semibold text-gray-900">Custo do Vidro (R$/m²)</h2>
              <p class="text-sm text-gray-600">Configure o preço por metro quadrado de cada cor</p>
            </div>
          </div>
          <svg 
            class="w-5 h-5 text-gray-500 transition-transform duration-200" 
            :class="{ 'rotate-180': activeAccordion === 'glass' }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-screen opacity-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="max-h-screen opacity-100"
          leave-to-class="max-h-0 opacity-0"
        >
          <div v-show="activeAccordion === 'glass'" class="border-t border-gray-200">
            <div class="p-6">
              <!-- Add New Glass Cost -->
              <div class="bg-purple-50 p-4 rounded-lg mb-6">
                <h3 class="text-sm font-semibold text-gray-700 mb-3">Adicionar Nova Cor</h3>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                    <select
                      v-model="newGlassCost.color"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="INCOLOR">Incolor</option>
                      <option value="FUME">Fumê</option>
                      <option value="VERDE">Verde</option>
                      <option value="BRONZE">Bronze</option>
                      <option value="AZUL">Azul</option>
                      <option value="CINZA">Cinza</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Custo (R$/m²)</label>
                    <input
                      v-model.number="newGlassCost.cost"
                      type="number"
                      step="0.01"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fornecedor (opcional)</label>
                    <input
                      v-model="newGlassCost.supplier"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div class="flex items-end">
                    <button
                      @click="addGlassCost"
                      class="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>

              <!-- Glass Costs Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="glass in glassCosts"
                  :key="glass.id"
                  class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="text-lg font-semibold text-gray-900">{{ glass.color }}</h4>
                    <button
                      @click="deleteGlassCost(glass.color)"
                      class="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                  <div class="space-y-2">
                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-1">Custo (R$/m²)</label>
                      <input
                        v-model.number="glass.cost"
                        type="number"
                        step="0.01"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        @change="updateGlassCost(glass)"
                      />
                    </div>
                    <div v-if="glass.supplier">
                      <label class="block text-xs font-medium text-gray-500 mb-1">Fornecedor</label>
                      <input
                        v-model="glass.supplier"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        @change="updateGlassCost(glass)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

    </div>

    <!-- Success Toast -->
    <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="showSuccessToast"
        class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span>{{ successMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import creditCardCostService, { type CreditCardCostDTO } from '@/services/credit-card-cost'
import laborCostService, { type LaborCostDTO } from '@/services/labor-cost'
import glassCostService, { type GlassCostDTO } from '@/services/glass-cost'

// State
const activeAccordion = ref<'creditCard' | 'labor' | 'glass' | null>('creditCard')
const loading = ref(true)
const error = ref<string | null>(null)
const showSuccessToast = ref(false)
const successMessage = ref('')

// Credit Card
const creditCardCost = ref<CreditCardCostDTO | null>(null)
const savingCreditCard = ref(false)

// Labor Costs
const laborCosts = ref<LaborCostDTO[]>([])
const newLaborCost = ref<Omit<LaborCostDTO, 'id'>>({
  type: 'PORTA',
  sheets: 1,
  laborValue: 0
})

// Glass Costs
const glassCosts = ref<GlassCostDTO[]>([])
const newGlassCost = ref<Omit<GlassCostDTO, 'id'>>({
  color: 'INCOLOR',
  cost: 0,
  supplier: ''
})

// Methods
const toggleAccordion = (accordion: 'creditCard' | 'labor' | 'glass') => {
  activeAccordion.value = activeAccordion.value === accordion ? null : accordion
}

const showSuccess = (message: string) => {
  successMessage.value = message
  showSuccessToast.value = true
  setTimeout(() => {
    showSuccessToast.value = false
  }, 3000)
}

// Credit Card Methods
const loadCreditCardCost = async () => {
  try {
    const costs = await creditCardCostService.getAll()
    if (costs && costs.length > 0) {
      creditCardCost.value = costs[0]
    }
  } catch (err) {
    console.error('Erro ao carregar taxas de cartão:', err)
    throw err
  }
}

const saveCreditCardCost = async () => {
  if (!creditCardCost.value) return
  
  try {
    savingCreditCard.value = true
    await creditCardCostService.update(creditCardCost.value)
    showSuccess('Taxas de cartão salvas com sucesso!')
  } catch (err) {
    console.error('Erro ao salvar taxas de cartão:', err)
    error.value = 'Erro ao salvar taxas de cartão'
  } finally {
    savingCreditCard.value = false
  }
}

// Labor Methods
const loadLaborCosts = async () => {
  try {
    laborCosts.value = await laborCostService.getAll()
  } catch (err) {
    console.error('Erro ao carregar custos de mão de obra:', err)
    throw err
  }
}

const addLaborCost = async () => {
  try {
    const created = await laborCostService.create(newLaborCost.value)
    laborCosts.value.push(created)
    newLaborCost.value = { type: 'PORTA', sheets: 1, laborValue: 0 }
    showSuccess('Custo de mão de obra adicionado!')
  } catch (err) {
    console.error('Erro ao adicionar custo de mão de obra:', err)
    error.value = 'Erro ao adicionar custo de mão de obra'
  }
}

const updateLaborCost = async (labor: LaborCostDTO) => {
  try {
    await laborCostService.update(labor.id!, labor)
    showSuccess('Custo de mão de obra atualizado!')
  } catch (err) {
    console.error('Erro ao atualizar custo de mão de obra:', err)
    error.value = 'Erro ao atualizar custo de mão de obra'
  }
}

const deleteLaborCost = async (id: number) => {
  if (!confirm('Tem certeza que deseja excluir este custo de mão de obra?')) return
  
  try {
    await laborCostService.delete(id)
    laborCosts.value = laborCosts.value.filter(l => l.id !== id)
    showSuccess('Custo de mão de obra excluído!')
  } catch (err) {
    console.error('Erro ao excluir custo de mão de obra:', err)
    error.value = 'Erro ao excluir custo de mão de obra'
  }
}

// Glass Methods
const loadGlassCosts = async () => {
  try {
    glassCosts.value = await glassCostService.getAll()
  } catch (err) {
    console.error('Erro ao carregar custos de vidro:', err)
    throw err
  }
}

const addGlassCost = async () => {
  try {
    const created = await glassCostService.create(newGlassCost.value)
    glassCosts.value.push(created)
    newGlassCost.value = { color: 'INCOLOR', cost: 0, supplier: '' }
    showSuccess('Custo de vidro adicionado!')
  } catch (err) {
    console.error('Erro ao adicionar custo de vidro:', err)
    error.value = 'Erro ao adicionar custo de vidro'
  }
}

const updateGlassCost = async (glass: GlassCostDTO) => {
  try {
    await glassCostService.update(glass.id!, glass)
    showSuccess('Custo de vidro atualizado!')
  } catch (err) {
    console.error('Erro ao atualizar custo de vidro:', err)
    error.value = 'Erro ao atualizar custo de vidro'
  }
}

const deleteGlassCost = async (color: string) => {
  if (!confirm(`Tem certeza que deseja excluir o custo do vidro ${color}?`)) return
  
  try {
    await glassCostService.delete(color)
    glassCosts.value = glassCosts.value.filter(g => g.color !== color)
    showSuccess('Custo de vidro excluído!')
  } catch (err) {
    console.error('Erro ao excluir custo de vidro:', err)
    error.value = 'Erro ao excluir custo de vidro'
  }
}

// Load all data on mount
onMounted(async () => {
  try {
    loading.value = true
    await Promise.all([
      loadCreditCardCost(),
      loadLaborCosts(),
      loadGlassCosts()
    ])
  } catch (err) {
    error.value = 'Erro ao carregar configurações'
  } finally {
    loading.value = false
  }
})
</script>
