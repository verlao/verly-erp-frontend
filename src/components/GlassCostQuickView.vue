<template>
  <div class="flex items-center gap-2 flex-wrap">
    <div 
      v-for="glass in displayedGlassCosts" 
      :key="glass.id"
      class="group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/50 hover:shadow-sm transition-all duration-200"
    >
      <!-- Indicador visual -->
      <div 
        class="w-1 h-3 rounded-full flex-shrink-0"
        :class="{
          'bg-blue-500': glass.color === 'INCOLOR',
          'bg-green-500': glass.color === 'VERDE',
          'bg-gray-500': glass.color === 'FUME',
          'bg-amber-500': glass.color === 'BRONZE'
        }"
      ></div>
      
      <!-- Cor -->
      <span class="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase">
        {{ glass.color }}
      </span>
      
      <!-- Valor editável -->
      <EditableValue
        :model-value="glass.costPerSquareMeter"
        type="currency"
        @save="(value) => handleUpdate(glass.id!, glass.color, value)"
        variant="default"
        compact
        class="text-xs"
      />
      
      <!-- Unidade -->
      <span class="text-[10px] sm:text-xs text-muted-foreground font-medium">/m²</span>
      
      <!-- Pulse indicator on hover -->
      <div class="absolute -top-0.5 -right-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import glassCostService, { type GlassCostDTO } from '../services/glass-cost'
import EditableValue from './EditableValue.vue'
import { useNotification } from '../composables/useNotification'

const { success: showSuccess, error: showError } = useNotification()

const glassCosts = ref<GlassCostDTO[]>([])

// Mostrar apenas as 3 principais cores (INCOLOR, VERDE, FUME)
const displayedGlassCosts = computed(() => {
  const priorityColors = ['INCOLOR', 'VERDE', 'FUME']
  return glassCosts.value
    .filter(g => priorityColors.includes(g.color))
    .sort((a, b) => priorityColors.indexOf(a.color) - priorityColors.indexOf(b.color))
})

const loadGlassCosts = async () => {
  try {
    glassCosts.value = await glassCostService.getAll()
  } catch (error) {
    console.error('Erro ao carregar custos de vidro:', error)
  }
}

const handleUpdate = async (id: number, color: string, value: string | number) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (numericValue === undefined || numericValue === null || isNaN(numericValue)) {
    showError('Erro', 'Valor inválido')
    return
  }
  
  try {
    await glassCostService.updatePriceByColor(color, numericValue)
    showSuccess('Sucesso', `Custo de ${color} atualizado`)
    await loadGlassCosts()
  } catch (error: any) {
    console.error('Erro ao atualizar custo de vidro:', error)
    showError('Erro', error.response?.data?.message || 'Não foi possível atualizar')
    await loadGlassCosts()
  }
}

onMounted(() => {
  loadGlassCosts()
})
</script>

