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

      <!-- Configurações (Accordions) -->
      <div class="space-y-3 mb-6">
        
        <!-- Accordion 1: Taxas de Cartão -->
        <div class="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
          <button
            @click="activeAccordion = activeAccordion === 'creditCard' ? null : 'creditCard'"
            class="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 hover:from-blue-100 hover:to-blue-150 dark:hover:from-blue-900/40 dark:hover:to-blue-800/40 transition-colors"
          >
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              <span class="text-sm font-semibold text-foreground">Taxas de Cartão</span>
            </div>
            <svg 
              class="w-4 h-4 text-muted-foreground transition-transform duration-200" 
              :class="{ 'rotate-180': activeAccordion === 'creditCard' }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          <transition name="accordion">
            <div v-show="activeAccordion === 'creditCard'" class="border-t border-border">
              <div v-if="creditCardCost" class="p-4">
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-muted-foreground mb-1">Débito (%)</label>
                    <input
                      v-model.number="creditCardCost.debit"
                      type="number"
                      step="0.01"
                      class="w-full px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                      @change="saveCreditCardCost"
                    />
                  </div>
                  <div v-for="i in 6" :key="`tax${i}x`">
                    <label class="block text-xs font-medium text-muted-foreground mb-1">{{ i }}x (%)</label>
                    <input
                      v-model.number="(creditCardCost as any)[`tax${i}x`]"
                      type="number"
                      step="0.01"
                      class="w-full px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                      @change="saveCreditCardCost"
                    />
                  </div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-3">
                  <div v-for="i in [7,8,9,10,11,12]" :key="`tax${i}x`">
                    <label class="block text-xs font-medium text-muted-foreground mb-1">{{ i }}x (%)</label>
                    <input
                      v-model.number="(creditCardCost as any)[`tax${i}x`]"
                      type="number"
                      step="0.01"
                      class="w-full px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                      @change="saveCreditCardCost"
                    />
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- Accordion 2: Mão de Obra -->
        <div class="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
          <button
            @click="activeAccordion = activeAccordion === 'labor' ? null : 'labor'"
            class="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 hover:from-green-100 hover:to-green-150 dark:hover:from-green-900/40 dark:hover:to-green-800/40 transition-colors"
          >
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <span class="text-sm font-semibold text-foreground">Mão de Obra</span>
            </div>
            <svg 
              class="w-4 h-4 text-muted-foreground transition-transform duration-200" 
              :class="{ 'rotate-180': activeAccordion === 'labor' }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          <transition name="accordion">
            <div v-show="activeAccordion === 'labor'" class="border-t border-border">
              <div class="p-4">
                <!-- Add New -->
                <div class="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg mb-3">
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <select v-model="newLaborCost.type" class="px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-background">
                      <option value="PORTA">PORTA</option>
                      <option value="JANELA">JANELA</option>
                      <option value="BOX">BOX</option>
                      <option value="FIXO">FIXO</option>
                      <option value="BASCULANTE">BASCULANTE</option>
                      <option value="SACADA">SACADA</option>
                    </select>
                    <input v-model.number="newLaborCost.sheets" type="number" min="1" placeholder="Folhas" class="px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-background" />
                    <input v-model.number="newLaborCost.laborValue" type="number" step="0.01" placeholder="Valor (R$)" class="px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-background" />
                    <button @click="addLaborCost" class="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm">Adicionar</button>
                  </div>
                </div>

                <!-- Table -->
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-muted">
                      <tr>
                        <th class="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Tipo</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Folhas</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Valor (R$)</th>
                        <th class="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Ações</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                      <tr v-for="labor in laborCosts" :key="labor.id">
                        <td class="px-3 py-2 text-foreground">{{ labor.type }}</td>
                        <td class="px-3 py-2 text-foreground">{{ labor.sheets }}</td>
                        <td class="px-3 py-2">
                          <input v-model.number="labor.laborValue" type="number" step="0.01" class="w-24 px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-background" @change="updateLaborCost(labor)" />
                        </td>
                        <td class="px-3 py-2 text-right">
                          <button @click="deleteLaborCost(labor.id!)" class="text-red-600 hover:text-red-900 dark:hover:text-red-400 transition-colors text-xs">Excluir</button>
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
        <div class="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
          <button
            @click="activeAccordion = activeAccordion === 'glass' ? null : 'glass'"
            class="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 hover:from-purple-100 hover:to-purple-150 dark:hover:from-purple-900/40 dark:hover:to-purple-800/40 transition-colors"
          >
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              <span class="text-sm font-semibold text-foreground">Valor do Vidro (R$/m²)</span>
            </div>
            <svg 
              class="w-4 h-4 text-muted-foreground transition-transform duration-200" 
              :class="{ 'rotate-180': activeAccordion === 'glass' }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          <transition name="accordion">
            <div v-show="activeAccordion === 'glass'" class="border-t border-border">
              <div class="p-4">
                <!-- Add New -->
                <div class="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg mb-3">
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <select v-model="newGlassCost.color" class="px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 bg-background">
                      <option value="INCOLOR">Incolor</option>
                      <option value="FUME">Fumê</option>
                      <option value="VERDE">Verde</option>
                      <option value="BRONZE">Bronze</option>
                      <option value="AZUL">Azul</option>
                      <option value="CINZA">Cinza</option>
                    </select>
                    <input v-model.number="newGlassCost.cost" type="number" step="0.01" placeholder="Custo (R$/m²)" class="px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 bg-background" />
                    <input v-model="newGlassCost.supplier" type="text" placeholder="Fornecedor (opcional)" class="px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 bg-background" />
                    <button @click="addGlassCost" class="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm">Adicionar</button>
                  </div>
                </div>

                <!-- Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div v-for="glass in glassCosts" :key="glass.id" class="border border-border rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="font-semibold text-foreground text-sm">{{ glass.color }}</h4>
                      <button @click="deleteGlassCost(glass.color)" class="text-red-600 hover:text-red-900 dark:hover:text-red-400 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                    <div class="space-y-2">
                      <div>
                        <label class="block text-xs text-muted-foreground mb-1">Custo (R$/m²)</label>
                        <input v-model.number="glass.cost" type="number" step="0.01" class="w-full px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 bg-background" @change="updateGlassCost(glass)" />
                      </div>
                      <div v-if="glass.supplier">
                        <label class="block text-xs text-muted-foreground mb-1">Fornecedor</label>
                        <input v-model="glass.supplier" type="text" class="w-full px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 bg-background" @change="updateGlassCost(glass)" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- Accordion 4: Ganhos (Margem de Lucro) -->
        <div class="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
          <button
            @click="activeAccordion = activeAccordion === 'gain' ? null : 'gain'"
            class="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 hover:from-orange-100 hover:to-orange-150 dark:hover:from-orange-900/40 dark:hover:to-orange-800/40 transition-colors"
          >
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
              <span class="text-sm font-semibold text-foreground">Ganhos (Margem de Lucro %)</span>
            </div>
            <svg 
              class="w-4 h-4 text-muted-foreground transition-transform duration-200" 
              :class="{ 'rotate-180': activeAccordion === 'gain' }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          <transition name="accordion">
            <div v-show="activeAccordion === 'gain'" class="border-t border-border">
              <div class="p-4">
                <!-- Add New -->
                <div class="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg mb-3">
                  <div class="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <select v-model="newGain.type" class="px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-background">
                      <option value="PORTA">PORTA</option>
                      <option value="JANELA">JANELA</option>
                      <option value="BOX">BOX</option>
                      <option value="FIXO">FIXO</option>
                      <option value="BASCULANTE">BASCULANTE</option>
                      <option value="SACADA">SACADA</option>
                    </select>
                    <input v-model.number="newGain.sheets" type="number" min="1" placeholder="Folhas" class="px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-background" />
                    <input v-model.number="newGain.gainValue" type="number" step="0.01" placeholder="Ganho (%)" class="px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-background" />
                    <input v-model="newGain.description" type="text" placeholder="Descrição (opcional)" class="px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-background" />
                    <button @click="addGain" class="px-3 py-1.5 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm">Adicionar</button>
                  </div>
                </div>

                <!-- Table -->
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-muted">
                      <tr>
                        <th class="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Tipo</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Folhas</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Ganho (%)</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Descrição</th>
                        <th class="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Ativo</th>
                        <th class="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Ações</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                      <tr v-for="gain in gains" :key="gain.id">
                        <td class="px-3 py-2 text-foreground">{{ gain.type }}</td>
                        <td class="px-3 py-2 text-foreground">{{ gain.sheets }}</td>
                        <td class="px-3 py-2">
                          <input v-model.number="gain.gainValue" type="number" step="0.01" class="w-20 px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-background" @change="updateGain(gain)" />
                        </td>
                        <td class="px-3 py-2">
                          <input v-model="gain.description" type="text" class="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-background" @change="updateGain(gain)" />
                        </td>
                        <td class="px-3 py-2 text-center">
                          <input v-model="gain.active" type="checkbox" class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" @change="updateGain(gain)" />
                        </td>
                        <td class="px-3 py-2 text-right">
                          <button @click="deleteGain(gain.id!)" class="text-red-600 hover:text-red-900 dark:hover:text-red-400 transition-colors text-xs">Excluir</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </transition>
        </div>

      </div>

      <!-- Tabela de Produtos -->
      <div class="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div class="px-6 py-4 border-b border-border">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <!-- Título -->
            <div class="flex-shrink-0">
              <h2 class="text-lg font-medium text-foreground">Lista de Produtos</h2>
              <p class="text-sm text-muted-foreground mt-1">{{ totalItems }} produtos encontrados</p>
            </div>
            
            <!-- Filter Bar Inline -->
            <div class="flex-1 max-w-4xl">
              <FilterBar
                v-model:search="searchQuery"
                v-model:type="selectedType"
                v-model:color="selectedColor"
              />
            </div>
          </div>
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
                <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Medida</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Folhas</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Fixo</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Porta</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">M²</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Kit</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Custo</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">À Vista Din</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">À Vista Cart</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Parc 4x</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Parc 6x</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Parc 10x</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Parc 12x</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Lucro</th>
                <th class="px-4 py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="bg-card divide-y divide-border">
              <tr v-for="product in filteredProducts" :key="product.id || product.key" :data-product-id="product.id" :data-product-key="product.key" class="hover:bg-accent/50 text-sm">
              <!-- Medida (tipo + cor) -->
              <td class="px-4 py-3 text-xs">
                <div class="space-y-1">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" :class="{
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400': product.type === 'PORTA',
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': product.type === 'JANELA',
                    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400': product.type === 'SACADA',
                    'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400': product.type === 'BASCULANTE',
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400': product.type === 'FIXO',
                    'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500': !product.type
                  }">
                    {{ product.type || '-' }}
                  </span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" :class="{
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400': product.color === 'INCOLOR',
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': product.color === 'VERDE',
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400': product.color === 'FUME',
                    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400': product.color === 'BRONZE',
                    'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500': !product.color
                  }">
                    {{ product.color || '-' }}
                  </span>
                </div>
              </td>
              <!-- Folhas -->
              <td class="px-4 py-3 text-center text-foreground">{{ product.sheets || '-' }}</td>
              <!-- Fixo (largura) -->
              <td class="px-4 py-3 text-center text-foreground">{{ product.width ? product.width : '-' }}</td>
              <!-- Porta (altura) -->
              <td class="px-4 py-3 text-center text-foreground">{{ product.height ? product.height : '-' }}</td>
              <!-- M² -->
              <td class="px-4 py-3 text-center text-muted-foreground">{{ product.measure ? product.measure.toFixed(2) : '-' }}</td>
              <!-- Kit -->
              <td class="px-4 py-3">
                <EditableValue
                  :model-value="product.accessory ?? product.kit ?? 0"
                  type="currency"
                  @save="(value) => handleKitSave(product, value)"
                />
              </td>
              <!-- Custo -->
              <td class="px-4 py-3 font-mono text-foreground">{{ product.cost ? 'R$ ' + product.cost.toFixed(2) : '-' }}</td>
              <!-- À Vista Dinheiro -->
              <td class="px-4 py-3 font-mono text-green-600 dark:text-green-400">
                {{ product.priceOptions?.cashMoney ? 'R$ ' + product.priceOptions.cashMoney.toFixed(2) : (product.price ? 'R$ ' + product.price.toFixed(2) : '-') }}
              </td>
              <!-- À Vista Cartão -->
              <td class="px-4 py-3 font-mono text-green-700 dark:text-green-500">
                {{ product.priceOptions?.cashCard ? 'R$ ' + product.priceOptions.cashCard.toFixed(2) : '-' }}
              </td>
              <!-- Parc 4x -->
              <td class="px-4 py-3 font-mono text-blue-600 dark:text-blue-400">
                {{ product.priceOptions?.installments4x ? 'R$ ' + product.priceOptions.installments4x.toFixed(2) : '-' }}
              </td>
              <!-- Parc 6x -->
              <td class="px-4 py-3 font-mono text-blue-600 dark:text-blue-400">
                {{ product.priceOptions?.installments6x ? 'R$ ' + product.priceOptions.installments6x.toFixed(2) : '-' }}
              </td>
              <!-- Parc 10x -->
              <td class="px-4 py-3 font-mono text-blue-700 dark:text-blue-500">
                {{ product.priceOptions?.installments10x ? 'R$ ' + product.priceOptions.installments10x.toFixed(2) : '-' }}
              </td>
              <!-- Parc 12x -->
              <td class="px-4 py-3 font-mono text-blue-700 dark:text-blue-500">
                {{ product.priceOptions?.installments12x ? 'R$ ' + product.priceOptions.installments12x.toFixed(2) : '-' }}
              </td>
              <!-- Lucro -->
              <td class="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">{{ calculateProfit(product) }}</td>
              <!-- Ações -->
              <td class="px-4 py-3 whitespace-nowrap text-center">
                  <div class="flex justify-center space-x-1">
                    <button
                      @click="openModal(product)"
                      class="text-blue-600 hover:text-blue-900 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                      title="Editar Produto"
                      aria-label="Editar produto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button
                      @click="confirmDelete(product)"
                      class="text-red-600 hover:text-red-900 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                      title="Excluir Produto"
                      aria-label="Excluir produto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c-1 0 2 1 2 2v2"/></svg>
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
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400'
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import productService from '../services/product'
import productCostService from '../services/product-cost'
import creditCardCostService, { type CreditCardCostDTO } from '../services/credit-card-cost'
import laborCostService, { type LaborCostDTO } from '../services/labor-cost'
import glassCostService, { type GlassCostDTO } from '../services/glass-cost'
import gainService, { type GainDTO } from '../services/gain'
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

// Accordions state
const activeAccordion = ref<'creditCard' | 'labor' | 'glass' | 'gain' | null>(null)
const creditCardCost = ref<CreditCardCostDTO | null>(null)
const laborCosts = ref<LaborCostDTO[]>([])
const glassCosts = ref<GlassCostDTO[]>([])
const gains = ref<GainDTO[]>([])
const newLaborCost = ref<Omit<LaborCostDTO, 'id'>>({
  type: 'PORTA',
  sheets: 1,
  laborValue: 0
})
const newGlassCost = ref<Omit<GlassCostDTO, 'id'>>({
  color: 'INCOLOR',
  cost: 0,
  supplier: ''
})
const newGain = ref<Omit<GainDTO, 'id'>>({
  type: 'PORTA',
  sheets: 1,
  gainValue: 0,
  active: true,
  description: ''
})

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
  installments: [],
  priceOptions: {
    cashMoney: 0,
    cashCard: 0,
    installments4x: 0,
    installments6x: 0,
    installments10x: 0,
    installments12x: 0
  }
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
  await Promise.all([
    loadProducts(), 
    loadProductCosts(),
    loadCreditCardCost(),
    loadLaborCosts(),
    loadGlassCosts(),
    loadGains()
  ])
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
      installments: [],
      priceOptions: {
        cashMoney: 0,
        cashCard: 0,
        installments4x: 0,
        installments6x: 0,
        installments10x: 0,
        installments12x: 0
      }
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

// ========== ACCORDION FUNCTIONS ==========

// Credit Card Functions
async function loadCreditCardCost() {
  try {
    const costs = await creditCardCostService.getAll()
    if (costs && costs.length > 0) {
      creditCardCost.value = costs[0]
    }
  } catch (error) {
    console.error('Erro ao carregar taxas de cartão:', error)
  }
}

async function saveCreditCardCost() {
  if (!creditCardCost.value) return
  
  try {
    await creditCardCostService.update(creditCardCost.value)
    notification.success('Sucesso', 'Taxas de cartão atualizadas!')
    await loadProducts() // Recarregar produtos para atualizar preços
  } catch (error) {
    console.error('Erro ao salvar taxas de cartão:', error)
    notification.error('Erro', 'Erro ao salvar taxas de cartão')
  }
}

// Labor Cost Functions
async function loadLaborCosts() {
  try {
    laborCosts.value = await laborCostService.getAll()
  } catch (error) {
    console.error('Erro ao carregar custos de mão de obra:', error)
  }
}

async function addLaborCost() {
  try {
    const created = await laborCostService.create(newLaborCost.value)
    laborCosts.value.push(created)
    newLaborCost.value = { type: 'PORTA', sheets: 1, laborValue: 0 }
    notification.success('Sucesso', 'Custo de mão de obra adicionado!')
    await loadProducts()
  } catch (error) {
    console.error('Erro ao adicionar custo de mão de obra:', error)
    notification.error('Erro', 'Erro ao adicionar custo de mão de obra')
  }
}

async function updateLaborCost(labor: LaborCostDTO) {
  try {
    await laborCostService.update(labor.id!, labor)
    notification.success('Sucesso', 'Custo de mão de obra atualizado!')
    await loadProducts()
  } catch (error) {
    console.error('Erro ao atualizar custo de mão de obra:', error)
    notification.error('Erro', 'Erro ao atualizar custo de mão de obra')
  }
}

async function deleteLaborCost(id: number) {
  if (!confirm('Tem certeza que deseja excluir este custo de mão de obra?')) return
  
  try {
    await laborCostService.delete(id)
    laborCosts.value = laborCosts.value.filter(l => l.id !== id)
    notification.success('Sucesso', 'Custo de mão de obra excluído!')
    await loadProducts()
  } catch (error) {
    console.error('Erro ao excluir custo de mão de obra:', error)
    notification.error('Erro', 'Erro ao excluir custo de mão de obra')
  }
}

// Glass Cost Functions
async function loadGlassCosts() {
  try {
    glassCosts.value = await glassCostService.getAll()
  } catch (error) {
    console.error('Erro ao carregar custos de vidro:', error)
  }
}

async function addGlassCost() {
  try {
    const created = await glassCostService.create(newGlassCost.value)
    glassCosts.value.push(created)
    newGlassCost.value = { color: 'INCOLOR', cost: 0, supplier: '' }
    notification.success('Sucesso', 'Custo de vidro adicionado!')
    await loadProducts()
  } catch (error) {
    console.error('Erro ao adicionar custo de vidro:', error)
    notification.error('Erro', 'Erro ao adicionar custo de vidro')
  }
}

async function updateGlassCost(glass: GlassCostDTO) {
  try {
    await glassCostService.update(glass.id!, glass)
    notification.success('Sucesso', 'Custo de vidro atualizado!')
    await loadProducts()
  } catch (error) {
    console.error('Erro ao atualizar custo de vidro:', error)
    notification.error('Erro', 'Erro ao atualizar custo de vidro')
  }
}

async function deleteGlassCost(color: string) {
  if (!confirm(`Tem certeza que deseja excluir o custo do vidro ${color}?`)) return
  
  try {
    await glassCostService.delete(color)
    glassCosts.value = glassCosts.value.filter(g => g.color !== color)
    notification.success('Sucesso', 'Custo de vidro excluído!')
    await loadProducts()
  } catch (error) {
    console.error('Erro ao excluir custo de vidro:', error)
    notification.error('Erro', 'Erro ao excluir custo de vidro')
  }
}

// Gain Functions
async function loadGains() {
  try {
    gains.value = await gainService.getAll()
  } catch (error) {
    console.error('Erro ao carregar ganhos:', error)
  }
}

async function addGain() {
  try {
    const created = await gainService.create(newGain.value)
    gains.value.push(created)
    newGain.value = { type: 'PORTA', sheets: 1, gainValue: 0, active: true, description: '' }
    notification.success('Sucesso', 'Ganho adicionado!')
    await loadProducts()
  } catch (error) {
    console.error('Erro ao adicionar ganho:', error)
    notification.error('Erro', 'Erro ao adicionar ganho')
  }
}

async function updateGain(gain: GainDTO) {
  try {
    await gainService.update(gain.id!, gain)
    notification.success('Sucesso', 'Ganho atualizado!')
    await loadProducts()
  } catch (error) {
    console.error('Erro ao atualizar ganho:', error)
    notification.error('Erro', 'Erro ao atualizar ganho')
  }
}

async function deleteGain(id: number) {
  if (!confirm('Tem certeza que deseja excluir este ganho?')) return
  
  try {
    await gainService.delete(id)
    gains.value = gains.value.filter(g => g.id !== id)
    notification.success('Sucesso', 'Ganho excluído!')
    await loadProducts()
  } catch (error) {
    console.error('Erro ao excluir ganho:', error)
    notification.error('Erro', 'Erro ao excluir ganho')
  }
}
</script>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

.accordion-enter-to,
.accordion-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>