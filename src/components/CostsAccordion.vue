<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="mb-2">
      <h2 class="text-xl font-semibold text-foreground">Configuração de Custos</h2>
      <p class="text-sm text-muted-foreground mt-1">Configure os custos, margens e taxas do sistema</p>
    </div>

    <!-- Glass Costs -->
    <AccordionItem 
      value="glass" 
      class="border border-border shadow-sm hover:shadow-md transition-all duration-300"
    >
      <AccordionTrigger class="bg-card hover:bg-accent/50">
        <div class="flex items-center gap-3 flex-1">
          <!-- Icon -->
          <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <line x1="3" x2="21" y1="6" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          
          <div class="flex-1 text-left">
            <h3 class="text-base md:text-lg font-bold text-foreground">Custos de Vidro</h3>
            <p class="text-xs md:text-sm text-muted-foreground">
              {{ glassCosts.length > 0 ? `${glassCosts.length} cores configuradas` : 'Configure os preços por m²' }}
            </p>
          </div>
          
          <Badge variant="outline" class="ml-auto mr-2">{{ glassCosts.length }}</Badge>
        </div>
      </AccordionTrigger>
      
      <AccordionContent class="border-t border-border pt-6">
        <div v-if="loading.glass" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton v-for="i in 4" :key="i" class="h-24 rounded-lg" />
        </div>
        <div v-else-if="glassCosts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          <Card 
            v-for="glass in glassCosts" 
            :key="glass.id" 
            class="group relative border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 p-4 overflow-visible"
          >
            <div class="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
            </div>
            <div class="flex items-center gap-2 justify-between">
              <div class="flex items-center gap-2">
                <label class="text-xs font-bold text-foreground flex items-center gap-2 whitespace-nowrap">
                  <span class="w-1 h-4 bg-primary rounded-full"></span>
                  {{ glass.color }}
                </label>
                <EditableValue
                  :model-value="glass.costPerSquareMeter"
                  type="currency"
                  @save="(value) => handleGlassUpdate(glass.id, glass.color, value)"
                  variant="default"
                  compact
                />
              </div>
              <span class="text-xs font-medium text-muted-foreground">/m²</span>
            </div>
          </Card>
        </div>
        <div v-else class="text-center py-6">
          <p class="text-muted-foreground mb-3">Nenhum custo de vidro cadastrado</p>
          <button
            @click="createDefaultGlassCosts"
            class="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-sm hover:shadow-md"
          >
            Criar Custos Padrão
          </button>
        </div>
      </AccordionContent>
    </AccordionItem>

    <!-- Labor Costs -->
    <AccordionItem 
      value="labor"
      class="border border-border shadow-sm hover:shadow-md transition-all duration-300"
    >
      <AccordionTrigger class="bg-card hover:bg-accent/50">
        <div class="flex items-center gap-3 flex-1">
          <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <div class="flex-1 text-left">
            <h3 class="text-base md:text-lg font-bold text-foreground">Custos de Mão de Obra</h3>
            <p class="text-xs md:text-sm text-muted-foreground">
              {{ laborCosts.length > 0 ? `${laborCosts.length} configurações ativas` : 'Configure valores de instalação' }}
            </p>
          </div>
          <Badge variant="outline" class="ml-auto mr-2">{{ laborCosts.length }}</Badge>
        </div>
      </AccordionTrigger>
      
      <AccordionContent class="border-t border-border pt-6">
        <div v-if="loading.labor" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton v-for="i in 6" :key="i" class="h-24 rounded-lg" />
        </div>
        <div v-else-if="laborCosts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <Card 
            v-for="labor in laborCosts" 
            :key="labor.id" 
            class="group relative border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 p-4 overflow-visible"
          >
            <div class="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-foreground flex items-center gap-2 truncate">
                <span class="w-1 h-4 bg-primary rounded-full flex-shrink-0"></span>
                <span class="truncate">{{ labor.type }} - {{ labor.sheets }} FOLHA{{ labor.sheets > 1 ? 'S' : '' }}</span>
              </label>
              <EditableValue
                :model-value="labor.laborValue"
                type="currency"
                @save="(value) => handleLaborUpdate(labor, value)"
                variant="default"
                compact
              />
            </div>
          </Card>
        </div>
        <div v-else class="text-center py-6">
          <p class="text-muted-foreground mb-3">Nenhum custo de mão de obra cadastrado</p>
          <button
            @click="createDefaultLaborCosts"
            class="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-sm hover:shadow-md"
          >
            Criar Custos Padrão
          </button>
        </div>
      </AccordionContent>
    </AccordionItem>

    <!-- Gain (Margem) -->
    <AccordionItem 
      value="gain"
      class="border border-border shadow-sm hover:shadow-md transition-all duration-300"
    >
      <AccordionTrigger class="bg-card hover:bg-accent/50">
        <div class="flex items-center gap-3 flex-1">
          <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div class="flex-1 text-left">
            <h3 class="text-base md:text-lg font-bold text-foreground">Margem de Ganho</h3>
            <p class="text-xs md:text-sm text-muted-foreground">
              {{ gains.length > 0 ? `${gains.length} margens definidas` : 'Configure percentuais de lucro' }}
            </p>
          </div>
          <Badge variant="outline" class="ml-auto mr-2">{{ gains.length }}</Badge>
        </div>
      </AccordionTrigger>
      
      <AccordionContent class="border-t border-border pt-6">
        <div v-if="loading.gain" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton v-for="i in 6" :key="i" class="h-24 rounded-lg" />
        </div>
        <div v-else-if="gains.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <Card 
            v-for="gain in gains" 
            :key="gain.id" 
            class="group relative border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 p-4 overflow-visible"
          >
            <div class="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-foreground flex items-center gap-2 truncate">
                <span class="w-1 h-4 bg-primary rounded-full flex-shrink-0"></span>
                <span class="truncate">{{ gain.type }} - {{ gain.sheets }} FOLHA{{ gain.sheets > 1 ? 'S' : '' }}</span>
              </label>
              <EditableValue
                :model-value="gain.gainValue"
                type="number"
                @save="(value) => handleGainUpdate(gain, value)"
                variant="default"
                compact
                suffix="%"
              />
            </div>
          </Card>
        </div>
        <div v-else class="text-center py-6">
          <p class="text-muted-foreground mb-3">Nenhuma margem cadastrada</p>
          <button
            @click="createDefaultGains"
            class="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-sm hover:shadow-md"
          >
            Criar Margens Padrão
          </button>
        </div>
      </AccordionContent>
    </AccordionItem>

    <!-- Credit Card Costs -->
    <AccordionItem 
      value="creditCard"
      class="border border-border shadow-sm hover:shadow-md transition-all duration-300"
    >
      <AccordionTrigger class="bg-card hover:bg-accent/50">
        <div class="flex items-center gap-3 flex-1">
          <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground">
              <rect width="20" height="14" x="2" y="5" rx="2"/>
              <line x1="2" x2="22" y1="10" y2="10"/>
            </svg>
          </div>
          <div class="flex-1 text-left">
            <h3 class="text-base md:text-lg font-bold text-foreground">Taxas de Cartão de Crédito</h3>
            <p class="text-xs md:text-sm text-muted-foreground">
              {{ creditCardCost ? `Débito + ${installmentsCount} parcelas configuradas` : 'Configure taxas de processamento' }}
            </p>
          </div>
          <Badge variant="outline" class="ml-auto mr-2">{{ creditCardCost ? installmentsCount + 1 : '0' }}</Badge>
        </div>
      </AccordionTrigger>
      
      <AccordionContent class="border-t border-border">
      <div v-if="loading.creditCard" class="space-y-4">
        <Skeleton class="h-24 rounded-lg" />
        <div class="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Skeleton v-for="i in 6" :key="i" class="h-24 rounded-lg" />
        </div>
      </div>
        <div v-else-if="creditCardCost" class="space-y-6">
          <!-- Débito -->
          <div class="pt-6">
            <h4 class="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <span class="w-1 h-4 bg-primary rounded-full"></span>
              Débito
            </h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <Card class="group relative border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 p-4 overflow-visible">
                <div class="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                </div>
                <EditableValue
                  :model-value="creditCardCost.debit"
                  type="number"
                  @save="(value) => handleCreditCardFieldUpdate('debit', value)"
                  variant="default"
                  compact
                  suffix="%"
                />
              </Card>
            </div>
          </div>

          <!-- Parcelamento -->
          <div>
            <h4 class="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <span class="w-1 h-4 bg-primary rounded-full"></span>
              Parcelamento
            </h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <Card 
                v-for="installment in installments" 
                :key="installment" 
                class="group relative border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 p-4 overflow-visible"
              >
              <div class="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <label class="text-xs font-bold text-foreground flex items-center gap-2 whitespace-nowrap">
                  <span class="w-1 h-4 bg-primary rounded-full flex-shrink-0"></span>
                  {{ installment }}x
                </label>
                <EditableValue
                  :model-value="creditCardCost[`tax${installment}x`] as number"
                  type="number"
                  @save="(value) => handleCreditCardFieldUpdate(`tax${installment}x`, value)"
                  variant="default"
                  compact
                  suffix="%"
                />
              </div>
              </Card>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-6">
          <p class="text-muted-foreground mb-3">Nenhuma taxa cadastrada</p>
          <button
            @click="createDefaultCreditCardCost"
            class="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-sm hover:shadow-md"
          >
            Criar Taxas Padrão
          </button>
        </div>
      </AccordionContent>
    </AccordionItem>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AccordionItem from './ui/AccordionItem.vue'
import AccordionTrigger from './ui/AccordionTrigger.vue'
import AccordionContent from './ui/AccordionContent.vue'
import Card from './ui/Card.vue'
import Badge from './ui/Badge.vue'
import Skeleton from './ui/Skeleton.vue'
import EditableValue from './EditableValue.vue'
import glassCostService, { type GlassCostDTO } from '../services/glass-cost'
import laborCostService, { type LaborCostDTO } from '../services/labor-cost'
import gainService, { type GainDTO } from '../services/gain'
import creditCardCostService, { type CreditCardCostDTO } from '../services/credit-card-cost'
import { useNotification } from '../composables/useNotification'

const { success: showSuccess, error: showError } = useNotification()

const glassCosts = ref<GlassCostDTO[]>([])
const laborCosts = ref<LaborCostDTO[]>([])
const gains = ref<GainDTO[]>([])
const creditCardCost = ref<CreditCardCostDTO | null>(null)

const loading = ref({
  glass: false,
  labor: false,
  gain: false,
  creditCard: false
})

const loadAllCosts = async () => {
  await Promise.all([
    loadGlassCosts(),
    loadLaborCosts(),
    loadGains(),
    loadCreditCardCosts()
  ])
}

const loadGlassCosts = async () => {
  loading.value.glass = true
  try {
    glassCosts.value = await glassCostService.getAll()
  } catch (error) {
    console.error('Erro ao carregar custos de vidro:', error)
    glassCosts.value = []
    showError('Erro', 'Não foi possível carregar os custos de vidro')
  } finally {
    loading.value.glass = false
  }
}

const loadLaborCosts = async () => {
  loading.value.labor = true
  try {
    laborCosts.value = await laborCostService.getAll()
  } catch (error) {
    console.error('Erro ao carregar custos de mão de obra:', error)
    laborCosts.value = []
    showError('Erro', 'Não foi possível carregar os custos de mão de obra')
  } finally {
    loading.value.labor = false
  }
}

const loadGains = async () => {
  loading.value.gain = true
  try {
    gains.value = await gainService.getAll()
  } catch (error) {
    console.error('Erro ao carregar margens:', error)
    gains.value = []
    showError('Erro', 'Não foi possível carregar as margens')
  } finally {
    loading.value.gain = false
  }
}

const loadCreditCardCosts = async () => {
  loading.value.creditCard = true
  try {
    const data = await creditCardCostService.getAll()
    // Se for array, pega o primeiro item, se for objeto, usa direto
    creditCardCost.value = Array.isArray(data) ? (data[0] || null) : data
  } catch (error) {
    console.error('Erro ao carregar taxas de cartão:', error)
    creditCardCost.value = null
    showError('Erro', 'Não foi possível carregar as taxas de cartão')
  } finally {
    loading.value.creditCard = false
  }
}

const handleGlassUpdate = async (id: number, color: string, value: number) => {
  // Validar que o valor não seja undefined ou null
  if (value === undefined || value === null || isNaN(value)) {
    showError('Erro', 'Valor inválido')
    return
  }
  
  try {
    await glassCostService.updatePriceByColor(color, value)
    showSuccess('Sucesso', 'Custo de vidro atualizado')
    await loadGlassCosts()
  } catch (error: any) {
    console.error('Erro ao atualizar custo de vidro:', error)
    showError('Erro ao atualizar', error.response?.data?.message || error.response?.data || 'Não foi possível atualizar o custo')
    await loadGlassCosts()
  }
}

const handleLaborUpdate = async (labor: LaborCostDTO, value: number) => {
  // Validar que o valor não seja undefined ou null
  if (value === undefined || value === null || isNaN(value)) {
    showError('Erro', 'Valor inválido')
    return
  }
  
  if (!labor.id) {
    showError('Erro', 'ID do custo de mão de obra não encontrado')
    return
  }
  
  console.log('🔧 handleLaborUpdate chamado:', { labor, newValue: value, type: typeof value })
  
  try {
    // Enviar objeto completo com o valor atualizado
    const payload = {
      ...labor,
      laborValue: value
    }
    console.log('📤 Enviando payload completo:', payload)
    
    await laborCostService.update(labor.id, payload)
    showSuccess('Sucesso', 'Custo de mão de obra atualizado')
    await loadLaborCosts()
  } catch (error: any) {
    console.error('❌ Erro detalhado ao atualizar custo de mão de obra:')
    console.error('Status:', error.response?.status)
    console.error('Status Text:', error.response?.statusText)
    console.error('Response Data:', error.response?.data)
    console.error('Request URL:', error.config?.url)
    console.error('Request Data:', error.config?.data)
    console.error('Full Error:', error)
    
    const errorMessage = error.response?.data?.message || error.response?.data || 'Não foi possível atualizar o custo'
    showError('Erro', errorMessage)
    await loadLaborCosts()
  }
}

const handleGainUpdate = async (gain: GainDTO, value: number) => {
  // Validar que o valor não seja undefined ou null
  if (value === undefined || value === null || isNaN(value)) {
    showError('Erro', 'Valor inválido')
    return
  }
  
  if (!gain.id) {
    showError('Erro', 'ID da margem não encontrado')
    return
  }
  
  try {
    // Enviar objeto completo com o valor atualizado
    const payload = {
      ...gain,
      gainValue: value
    }
    await gainService.update(gain.id, payload)
    showSuccess('Sucesso', 'Margem atualizada')
    await loadGains()
  } catch (error) {
    console.error('Erro ao atualizar margem:', error)
    showError('Erro', 'Não foi possível atualizar a margem')
    await loadGains()
  }
}

// Extrair QUAIS parcelas existem baseado nos campos do backend
const installments = computed(() => {
  if (!creditCardCost.value) return []
  
  // Extrair os números das parcelas (ex: "tax4x" → 4)
  const taxFields = Object.keys(creditCardCost.value)
    .filter(key => key.startsWith('tax') && key.endsWith('x'))
    .map(key => parseInt(key.replace('tax', '').replace('x', '')))
    .sort((a, b) => a - b)  // Ordenar numericamente
  
  return taxFields
})

// Contar quantas parcelas existem (para o badge)
const installmentsCount = computed(() => installments.value.length)

const handleCreditCardFieldUpdate = async (field: string, value: number) => {
  if (!creditCardCost.value) return
  
  // Validar que o valor não seja undefined ou null
  if (value === undefined || value === null || isNaN(value)) {
    showError('Erro', 'Valor inválido')
    return
  }
  
  try {
    const updated = {
      ...creditCardCost.value,
      [field]: value
    }
    await creditCardCostService.update(updated)
    creditCardCost.value = updated
    showSuccess('Sucesso', 'Taxa de cartão atualizada')
  } catch (error) {
    console.error('Erro ao atualizar taxa de cartão:', error)
    showError('Erro', 'Não foi possível atualizar a taxa')
    await loadCreditCardCosts()
  }
}

const createDefaultGlassCosts = async () => {
  try {
    const colors = [
      { color: 'INCOLOR', cost: 100.00 },
      { color: 'VERDE', cost: 120.00 },
      { color: 'FUME', cost: 130.00 },
      { color: 'BRONZE', cost: 140.00 }
    ]
    
    for (const { color, cost } of colors) {
      await glassCostService.create({
        color,
        costPerSquareMeter: cost,
        effectiveDate: new Date().toISOString(),
        isActive: true
      })
    }
    
    showSuccess('Sucesso', 'Custos de vidro criados')
    await loadGlassCosts()
  } catch (error) {
    console.error('Erro ao criar custos de vidro:', error)
    showError('Erro', 'Não foi possível criar os custos')
  }
}

const createDefaultLaborCosts = async () => {
  try {
    const types = ['PORTA', 'JANELA', 'SACADA', 'BASCULANTE', 'FIXO', 'BOX']
    const sheets = [1, 2, 4]
    
    for (const type of types) {
      for (const sheet of sheets) {
        await laborCostService.create({
          type,
          sheets: sheet,
          laborValue: 150.00,
          active: true
        })
      }
    }
    
    showSuccess('Sucesso', 'Custos de mão de obra criados')
    await loadLaborCosts()
  } catch (error) {
    console.error('Erro ao criar custos de mão de obra:', error)
    showError('Erro', 'Não foi possível criar os custos')
  }
}

const createDefaultGains = async () => {
  try {
    const types = ['PORTA', 'JANELA', 'SACADA', 'BASCULANTE', 'FIXO', 'BOX']
    const sheets = [1, 2, 4]
    
    for (const type of types) {
      for (const sheet of sheets) {
        await gainService.create({
          type,
          sheets: sheet,
          gainValue: 30.00,
          active: true
        })
      }
    }
    
    showSuccess('Sucesso', 'Margens criadas')
    await loadGains()
  } catch (error) {
    console.error('Erro ao criar margens:', error)
    showError('Erro', 'Não foi possível criar as margens')
  }
}

const createDefaultCreditCardCost = async () => {
  try {
    const defaultCost: Omit<CreditCardCostDTO, 'id'> = {
      debit: 1.69,
      tax1x: 3.0,
      tax4x: 6.0,
      tax6x: 8.0,
      tax10x: 12.0,
      tax12x: 14.0
    }
    
    await creditCardCostService.create(defaultCost)
    showSuccess('Sucesso', 'Taxas de cartão criadas')
    await loadCreditCardCosts()
  } catch (error) {
    console.error('Erro ao criar taxas de cartão:', error)
    showError('Erro', 'Não foi possível criar as taxas')
  }
}

onMounted(() => {
  loadAllCosts()
})
</script>
