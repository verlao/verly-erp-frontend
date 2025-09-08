<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-foreground">Gerenciar Custos</h1>
    </div>



    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg shadow p-6 text-center">
      <p class="text-muted-foreground">Carregando...</p>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="!productsCost || productsCost.length === 0" class="bg-white rounded-lg shadow p-6 text-center">
      <p class="text-muted-foreground">Nenhum custo encontrado</p>
    </div>
    
    <!-- Costs Sections -->
    <div v-else class="space-y-6">
      
      <!-- 1. CUSTOS DE VIDRO -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="bg-blue-50 px-6 py-4 border-b border-blue-200">
          <h2 class="text-lg font-semibold text-blue-900 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            Custos de Vidro (R$/m²)
          </h2>
          <p class="text-sm text-blue-700 mt-1">Preços por metro quadrado para cada tipo de vidro</p>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Incolor</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <EditableCell 
                  v-if="productsCost[0]" 
                  :cost="productsCost[0]" 
                  field="incolor" 
                  :is-money="true"
                  @update="handleInlineEdit"
                  class="pl-8"
                />
              </div>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Fumê</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <EditableCell 
                  v-if="productsCost[0]" 
                  :cost="productsCost[0]" 
                  field="fume" 
                  :is-money="true"
                  @update="handleInlineEdit"
                  class="pl-8"
                />
              </div>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Verde</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <EditableCell 
                  v-if="productsCost[0]" 
                  :cost="productsCost[0]" 
                  field="verde" 
                  :is-money="true"
                  @update="handleInlineEdit"
                  class="pl-8"
                />
              </div>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Bronze</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <EditableCell 
                  v-if="productsCost[0]" 
                  :cost="productsCost[0]" 
                  field="bronze" 
                  :is-money="true"
                  @update="handleInlineEdit"
                  class="pl-8"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 2. GANHOS (MARGENS) -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="bg-green-50 px-6 py-4 border-b border-green-200">
          <h2 class="text-lg font-semibold text-green-900 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
            Ganhos por Tipo de Produto (%)
          </h2>
          <p class="text-sm text-green-700 mt-1">Percentual de margem aplicado sobre o custo para cada tipo</p>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Porta</label>
              <div class="relative">
                <EditableCell 
                  v-if="productsCost[0]" 
                  :cost="productsCost[0]" 
                  field="gainDoor" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
                <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Janela</label>
              <div class="relative">
                <EditableCell 
                  v-if="productsCost[0]" 
                  :cost="productsCost[0]" 
                  field="gainWindow" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
                <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Box</label>
              <div class="relative">
                <EditableCell 
                  v-if="productsCost[0]" 
                  :cost="productsCost[0]" 
                  field="gainBox" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
                <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 3. MÃO DE OBRA -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="bg-orange-50 px-6 py-4 border-b border-orange-200">
          <h2 class="text-lg font-semibold text-orange-900 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
            Mão de Obra por Tipo (R$)
          </h2>
          <p class="text-sm text-orange-700 mt-1">Custo fixo de mão de obra para cada tipo de produto</p>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Porta</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <EditableCell 
                  v-if="productsCost[0]" 
                  :cost="productsCost[0]" 
                  field="laborDoor" 
                  :is-money="true"
                  @update="handleInlineEdit"
                  class="pl-8"
                />
              </div>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Janela</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <EditableCell 
                  v-if="productsCost[0]" 
                  :cost="productsCost[0]" 
                  field="laborWindow" 
                  :is-money="true"
                  @update="handleInlineEdit"
                  class="pl-8"
                />
              </div>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Box</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <EditableCell 
                  v-if="productsCost[0]" 
                  :cost="productsCost[0]" 
                  field="laborBox" 
                  :is-money="true"
                  @update="handleInlineEdit"
                  class="pl-8"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 4. ESTRUTURA ANTIGA (DETALHADA) -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Estrutura Antiga (Detalhada)
          </h2>
          <p class="text-sm text-gray-700 mt-1">Configurações granulares por número de folhas - mantida para compatibilidade</p>
        </div>
        
        <!-- Collapsible Content -->
        <div class="border-b border-gray-200">
          <button 
            @click="showOldStructure = !showOldStructure"
            class="w-full px-6 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-200"
          >
            <div class="flex items-center justify-between">
              <span>{{ showOldStructure ? 'Ocultar' : 'Mostrar' }} Estrutura Detalhada</span>
              <svg 
                :class="{'rotate-180': showOldStructure}"
                class="w-4 h-4 transform transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </button>
        </div>
        
        <div v-show="showOldStructure" class="p-6">
          <div class="space-y-8">
            
            <!-- Mão de Obra Detalhada -->
            <div>
              <h3 class="text-md font-semibold text-gray-800 mb-4 flex items-center">
                <span class="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                Mão de Obra Detalhada (R$)
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <!-- Portas -->
                <div class="space-y-3">
                  <h4 class="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">Portas</h4>
                  <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">1 Folha</label>
                      <div class="relative flex-1">
                        <span class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">R$</span>
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="porta1FolhaMDO" 
                          :is-money="true"
                          @update="handleInlineEdit"
                          class="pl-6 text-xs"
                        />
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">2 Folhas</label>
                      <div class="relative flex-1">
                        <span class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">R$</span>
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="porta2FolhasMDO" 
                          :is-money="true"
                          @update="handleInlineEdit"
                          class="pl-6 text-xs"
                        />
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">3 Folhas</label>
                      <div class="relative flex-1">
                        <span class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">R$</span>
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="porta3FolhasMDO" 
                          :is-money="true"
                          @update="handleInlineEdit"
                          class="pl-6 text-xs"
                        />
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">4 Folhas</label>
                      <div class="relative flex-1">
                        <span class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">R$</span>
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="porta4FolhasMDO" 
                          :is-money="true"
                          @update="handleInlineEdit"
                          class="pl-6 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Janelas -->
                <div class="space-y-3">
                  <h4 class="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">Janelas</h4>
                  <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">1 Folha</label>
                      <div class="relative flex-1">
                        <span class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">R$</span>
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="janela1FolhaMDO" 
                          :is-money="true"
                          @update="handleInlineEdit"
                          class="pl-6 text-xs"
                        />
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">2 Folhas</label>
                      <div class="relative flex-1">
                        <span class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">R$</span>
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="janela2FolhasMDO" 
                          :is-money="true"
                          @update="handleInlineEdit"
                          class="pl-6 text-xs"
                        />
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">3 Folhas</label>
                      <div class="relative flex-1">
                        <span class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">R$</span>
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="janela3FolhasMDO" 
                          :is-money="true"
                          @update="handleInlineEdit"
                          class="pl-6 text-xs"
                        />
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">4 Folhas</label>
                      <div class="relative flex-1">
                        <span class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">R$</span>
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="janela4FolhasMDO" 
                          :is-money="true"
                          @update="handleInlineEdit"
                          class="pl-6 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Boxes -->
                <div class="space-y-3">
                  <h4 class="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">Boxes</h4>
                  <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">1 Folha</label>
                      <div class="relative flex-1">
                        <span class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">R$</span>
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="box1FolhaMDO" 
                          :is-money="true"
                          @update="handleInlineEdit"
                          class="pl-6 text-xs"
                        />
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">2 Folhas</label>
                      <div class="relative flex-1">
                        <span class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">R$</span>
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="box2FolhasMDO" 
                          :is-money="true"
                          @update="handleInlineEdit"
                          class="pl-6 text-xs"
                        />
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">3 Folhas</label>
                      <div class="relative flex-1">
                        <span class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">R$</span>
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="box3FolhasMDO" 
                          :is-money="true"
                          @update="handleInlineEdit"
                          class="pl-6 text-xs"
                        />
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">4 Folhas</label>
                      <div class="relative flex-1">
                        <span class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">R$</span>
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="box4FolhasMDO" 
                          :is-money="true"
                          @update="handleInlineEdit"
                          class="pl-6 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Ganhos Detalhados -->
            <div>
              <h3 class="text-md font-semibold text-gray-800 mb-4 flex items-center">
                <span class="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Ganhos Detalhados (%)
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <!-- Portas -->
                <div class="space-y-3">
                  <h4 class="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">Portas</h4>
                  <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">1 Folha</label>
                      <div class="relative flex-1">
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="ganhoPorta1Folha" 
                          :is-percent="true"
                          @update="handleInlineEdit"
                          class="text-xs"
                        />
                        <span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">2 Folhas</label>
                      <div class="relative flex-1">
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="ganhoPorta2Folhas" 
                          :is-percent="true"
                          @update="handleInlineEdit"
                          class="text-xs"
                        />
                        <span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">3 Folhas</label>
                      <div class="relative flex-1">
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="ganhoPorta3Folhas" 
                          :is-percent="true"
                          @update="handleInlineEdit"
                          class="text-xs"
                        />
                        <span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">4 Folhas</label>
                      <div class="relative flex-1">
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="ganhoPorta4Folhas" 
                          :is-percent="true"
                          @update="handleInlineEdit"
                          class="text-xs"
                        />
                        <span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Janelas -->
                <div class="space-y-3">
                  <h4 class="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">Janelas</h4>
                  <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">1 Folha</label>
                      <div class="relative flex-1">
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="ganhoJanela1Folha" 
                          :is-percent="true"
                          @update="handleInlineEdit"
                          class="text-xs"
                        />
                        <span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">2 Folhas</label>
                      <div class="relative flex-1">
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="ganhoJanela2Folhas" 
                          :is-percent="true"
                          @update="handleInlineEdit"
                          class="text-xs"
                        />
                        <span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">3 Folhas</label>
                      <div class="relative flex-1">
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="ganhoJanela3Folhas" 
                          :is-percent="true"
                          @update="handleInlineEdit"
                          class="text-xs"
                        />
                        <span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">4 Folhas</label>
                      <div class="relative flex-1">
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="ganhoJanela4Folhas" 
                          :is-percent="true"
                          @update="handleInlineEdit"
                          class="text-xs"
                        />
                        <span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Boxes -->
                <div class="space-y-3">
                  <h4 class="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">Boxes</h4>
                  <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">1 Folha</label>
                      <div class="relative flex-1">
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="ganhoBox1Folha" 
                          :is-percent="true"
                          @update="handleInlineEdit"
                          class="text-xs"
                        />
                        <span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">2 Folhas</label>
                      <div class="relative flex-1">
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="ganhoBox2Folhas" 
                          :is-percent="true"
                          @update="handleInlineEdit"
                          class="text-xs"
                        />
                        <span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">3 Folhas</label>
                      <div class="relative flex-1">
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="ganhoBox3Folhas" 
                          :is-percent="true"
                          @update="handleInlineEdit"
                          class="text-xs"
                        />
                        <span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <label class="text-xs text-gray-600 w-16">4 Folhas</label>
                      <div class="relative flex-1">
                        <EditableCell 
                          v-if="productsCost[0]" 
                          :cost="productsCost[0]" 
                          field="ganhoBox4Folhas" 
                          :is-percent="true"
                          @update="handleInlineEdit"
                          class="text-xs"
                        />
                        <span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para Novo/Editar Custo -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-card rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-border">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-foreground">{{ editingCost ? 'Editar' : 'Novo' }} Custo</h2>
          <button @click="closeModal" class="text-muted-foreground hover:text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>
          </button>
        </div>
        
        <form @submit.prevent="handleFormSubmit" class="space-y-6">
          <!-- Custos de Vidro -->
          <div>
            <h3 class="text-lg font-medium text-foreground mb-3">Custos de Vidro</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">Incolor (R$)</label>
                <input 
                  v-model.number="form.incolor" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">Fumê (R$)</label>
                <input 
                  v-model.number="form.fume" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">Verde (R$)</label>
                <input 
                  v-model.number="form.verde" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
          
          <!-- Ganhos - Porta -->
          <div>
            <h3 class="text-lg font-medium text-foreground mb-3">Ganhos - Porta (%)</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">1 Folha</label>
                <input 
                  v-model.number="form.ganhoPorta1Folha" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">2 Folhas</label>
                <input 
                  v-model.number="form.ganhoPorta2Folhas" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">4 Folhas</label>
                <input 
                  v-model.number="form.ganhoPorta4Folhas" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
          
          <!-- Ganhos - Box -->
          <div>
            <h3 class="text-lg font-medium text-foreground mb-3">Ganhos - Box (%)</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">1 Folha</label>
                <input 
                  v-model.number="form.ganhoBox1Folha" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">2 Folhas</label>
                <input 
                  v-model.number="form.ganhoBox2Folhas" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">4 Folhas</label>
                <input 
                  v-model.number="form.ganhoBox4Folhas" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
          
          <!-- Ganhos - Janela -->
          <div>
            <h3 class="text-lg font-medium text-foreground mb-3">Ganhos - Janela (%)</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">1 Folha</label>
                <input 
                  v-model.number="form.ganhoJanela1Folha" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">2 Folhas</label>
                <input 
                  v-model.number="form.ganhoJanela2Folhas" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">4 Folhas</label>
                <input 
                  v-model.number="form.ganhoJanela4Folhas" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
          
          <!-- MDO - Box -->
          <div>
            <h3 class="text-lg font-medium text-foreground mb-3">Mão de Obra - Box (R$)</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">1 Folha</label>
                <input 
                  v-model.number="form.box1FolhaMDO" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">2 Folhas</label>
                <input 
                  v-model.number="form.box2FolhasMDO" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">4 Folhas</label>
                <input 
                  v-model.number="form.box4FolhasMDO" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
          
          <!-- MDO - Janela -->
          <div>
            <h3 class="text-lg font-medium text-foreground mb-3">Mão de Obra - Janela (R$)</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">1 Folha</label>
                <input 
                  v-model.number="form.janela1FolhaMDO" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">2 Folhas</label>
                <input 
                  v-model.number="form.janela2FolhasMDO" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">4 Folhas</label>
                <input 
                  v-model.number="form.janela4FolhasMDO" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
          
          <!-- MDO - Porta -->
          <div>
            <h3 class="text-lg font-medium text-foreground mb-3">Mão de Obra - Porta (R$)</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">1 Folha</label>
                <input 
                  v-model.number="form.porta1FolhaMDO" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">2 Folhas</label>
                <input 
                  v-model.number="form.porta2FolhasMDO" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">4 Folhas</label>
                <input 
                  v-model.number="form.porta4FolhasMDO" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4 border-t border-border">
            <button 
              type="button" 
              @click="closeModal" 
              class="px-4 py-2 border border-input text-foreground rounded-md hover:bg-muted"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              :disabled="loading"
            >
              {{ loading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'
import productService from '../services/product'
import productCostService, { type ProductCostDTO } from '../services/product-cost'
import EditableCell from '../components/EditableCell.vue'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const products = ref<any[]>([])
const productsCost = ref<ProductCostDTO[]>([])
const loading = ref(false)
const showModal = ref(false)
const showOldStructure = ref(false)
const editingCost = ref<ProductCostDTO | null>(null)

const productType = ref('BOX')
const productColor = ref('INCOLOR')

const productTypeOptions = [
  { value: 'BOX', label: 'Box' },
  { value: 'JANELA', label: 'Janela' },
  { value: 'PORTA', label: 'Porta' }
]

const productColorOptions = [
  { value: 'INCOLOR', label: 'Incolor' },
  { value: 'VERDE', label: 'Verde' },
  { value: 'FUME', label: 'Fumê' }
]

const form = ref({
  incolor: 0,
  fume: 0,
  verde: 0,
  bronze: 0,
  // Nova estrutura simplificada
  gainDoor: 0,
  laborDoor: 0,
  gainWindow: 0,
  laborWindow: 0,
  gainBox: 0,
  laborBox: 0,
  gainBalcony: 0,
  laborBalcony: 0,
  gainTilting: 0,
  laborTilting: 0,
  gainFixed: 0,
  laborFixed: 0,
  // Estrutura antiga
  ganhoPorta2Folhas: 0,
  ganhoPorta4Folhas: 0,
  ganhoPorta1Folha: 0,
  ganhoBox2Folhas: 0,
  ganhoBox4Folhas: 0,
  ganhoBox1Folha: 0,
  ganhoJanela2Folhas: 0,
  ganhoJanela4Folhas: 0,
  ganhoJanela1Folha: 0,
  box1FolhaMDO: 0,
  box2FolhasMDO: 0,
  box4FolhasMDO: 0,
  janela1FolhaMDO: 0,
  janela2FolhasMDO: 0,
  janela4FolhasMDO: 0,
  porta1FolhaMDO: 0,
  porta2FolhasMDO: 0,
  porta4FolhasMDO: 0
})

const loadData = async () => {
  try {
    loading.value = true
    const [productsData, costsData] = await Promise.all([
      productService.getAll(),
      productCostService.getAll()
    ])
    products.value = productsData.content || []
    productsCost.value = costsData
  } catch (error) {
    notificationStore.error('Erro ao carregar dados')
  } finally {
    loading.value = false
  }
}

const openModal = (cost?: ProductCostDTO) => {
  if (cost) {
    editingCost.value = cost
    form.value = {
      incolor: cost.incolor || 0,
      fume: cost.fume || 0,
      verde: cost.verde || 0,
      bronze: cost.bronze || 0,
      // Nova estrutura simplificada
      gainDoor: cost.gainDoor || 0,
      laborDoor: cost.laborDoor || 0,
      gainWindow: cost.gainWindow || 0,
      laborWindow: cost.laborWindow || 0,
      gainBox: cost.gainBox || 0,
      laborBox: cost.laborBox || 0,
      gainBalcony: cost.gainBalcony || 0,
      laborBalcony: cost.laborBalcony || 0,
      gainTilting: cost.gainTilting || 0,
      laborTilting: cost.laborTilting || 0,
      gainFixed: cost.gainFixed || 0,
      laborFixed: cost.laborFixed || 0,
      // Estrutura antiga
      ganhoPorta2Folhas: cost.ganhoPorta2Folhas || 0,
      ganhoPorta4Folhas: cost.ganhoPorta4Folhas || 0,
      ganhoPorta1Folha: cost.ganhoPorta1Folha || 0,
      ganhoBox2Folhas: cost.ganhoBox2Folhas || 0,
      ganhoBox4Folhas: cost.ganhoBox4Folhas || 0,
      ganhoBox1Folha: cost.ganhoBox1Folha || 0,
      ganhoJanela2Folhas: cost.ganhoJanela2Folhas || 0,
      ganhoJanela4Folhas: cost.ganhoJanela4Folhas || 0,
      ganhoJanela1Folha: cost.ganhoJanela1Folha || 0,
      box1FolhaMDO: cost.box1FolhaMDO || 0,
      box2FolhasMDO: cost.box2FolhasMDO || 0,
      box4FolhasMDO: cost.box4FolhasMDO || 0,
      janela1FolhaMDO: cost.janela1FolhaMDO || 0,
      janela2FolhasMDO: cost.janela2FolhasMDO || 0,
      janela4FolhasMDO: cost.janela4FolhasMDO || 0,
      porta1FolhaMDO: cost.porta1FolhaMDO || 0,
      porta2FolhasMDO: cost.porta2FolhasMDO || 0,
      porta4FolhasMDO: cost.porta4FolhasMDO || 0
    }
  } else {
    editingCost.value = null
    form.value = {
      incolor: 0,
      fume: 0,
      verde: 0,
      bronze: 0,
      // Nova estrutura simplificada
      gainDoor: 0,
      laborDoor: 0,
      gainWindow: 0,
      laborWindow: 0,
      gainBox: 0,
      laborBox: 0,
      gainBalcony: 0,
      laborBalcony: 0,
      gainTilting: 0,
      laborTilting: 0,
      gainFixed: 0,
      laborFixed: 0,
      // Estrutura antiga
      ganhoPorta2Folhas: 0,
      ganhoPorta4Folhas: 0,
      ganhoPorta1Folha: 0,
      ganhoBox2Folhas: 0,
      ganhoBox4Folhas: 0,
      ganhoBox1Folha: 0,
      ganhoJanela2Folhas: 0,
      ganhoJanela4Folhas: 0,
      ganhoJanela1Folha: 0,
      box1FolhaMDO: 0,
      box2FolhasMDO: 0,
      box4FolhasMDO: 0,
      janela1FolhaMDO: 0,
      janela2FolhasMDO: 0,
      janela4FolhasMDO: 0,
      porta1FolhaMDO: 0,
      porta2FolhasMDO: 0,
      porta4FolhasMDO: 0
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingCost.value = null
}

const handleFormSubmit = async () => {
  try {
    loading.value = true
    if (editingCost.value) {
      await productCostService.update({ ...form.value, id: editingCost.value.id })
      notificationStore.success('Custo atualizado com sucesso!')
    } else {
      await productCostService.create(form.value)
      notificationStore.success('Custo criado com sucesso!')
    }
    closeModal()
    await loadData()
  } catch (error) {
    notificationStore.error('Erro ao salvar custo')
  } finally {
    loading.value = false
  }
}

const handleInlineEdit = async (field: string, value: any) => {
  try {
    if (productsCost.value.length > 0) {
      const cost = productsCost.value[0]
      const updatedCost = { ...cost, [field]: Number(value) }
      await productCostService.update(updatedCost)
      productsCost.value[0] = updatedCost
      notificationStore.success('Custo atualizado com sucesso!')
    }
  } catch (error) {
    notificationStore.error('Erro ao atualizar custo')
  }
}

onMounted(() => {
  loadData()
})
</script>