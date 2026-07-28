<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
    <Card v-for="glass in displayedGlassCosts" :key="glass.id" class="p-3">
      <!-- Linha 1: swatch + cor -->
      <div class="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wide">
        <span
          class="w-2 h-2 rounded-full shrink-0"
          :style="glassSwatchStyle(glass.color)"
          aria-hidden="true"
        ></span>
        <span class="truncate">{{ glass.color }}</span>
      </div>

      <!-- Linha 2: preço PADRÃO (catálogo) -->
      <EditableValue
        :model-value="glass.costPerSquareMeter"
        type="currency"
        @save="(value) => handleUpdate(glass.id!, glass.color, value)"
        variant="default"
        compact
        class="mt-1 text-base md:text-lg font-bold text-foreground"
      />
      <span class="text-[10px] text-muted-foreground">padrão/m²</span>

      <!-- Linha 3: preço NÃO-PADRÃO (fora do catálogo / corte) -->
      <EditableValue
        :model-value="glass.costPerSquareMeterNaoPadrao ?? glass.costPerSquareMeter"
        type="currency"
        @save="(value) => handleUpdateNonStandard(glass.color, value)"
        variant="default"
        compact
        class="mt-1 text-xs font-medium text-muted-foreground"
      />
      <span class="text-[10px] text-muted-foreground">fora do cat./m²</span>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import glassCostService, { type GlassCostDTO } from '../services/glass-cost'
import Card from './ui/Card.vue'
import EditableValue from './EditableValue.vue'
import { glassSwatchStyle } from '../lib/productDisplay'
import { useNotification } from '../composables/useNotification'

const { success: showSuccess, error: showError } = useNotification()

const glassCosts = ref<GlassCostDTO[]>([])

// Tipos/cores prioritários no display. CANELADO e ESPELHO entram junto pra
// ficarem editáveis mesmo sem produto associado (per user spec).
const priorityColors = ['INCOLOR', 'VERDE', 'FUME', 'CANELADO', 'ESPELHO']

const displayedGlassCosts = computed(() => {
  return glassCosts.value
    .filter(g => priorityColors.includes(g.color))
    .sort(
      (a, b) =>
        priorityColors.indexOf(a.color) - priorityColors.indexOf(b.color)
    )
})

const loadGlassCosts = async () => {
  try {
    glassCosts.value = await glassCostService.getAll()
  } catch (error) {
    console.error('Erro ao carregar custos de vidro:', error)
  }
}

const handleUpdate = async (
  id: number,
  color: string,
  value: string | number
) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value

  if (numericValue === undefined || numericValue === null || isNaN(numericValue)) {
    showError('Erro', 'Valor inválido')
    return
  }

  try {
    await glassCostService.updatePriceByColor(color, numericValue)
    showSuccess('Sucesso', `Custo padrão de ${color} atualizado`)
    await loadGlassCosts()
  } catch (error: any) {
    console.error('Erro ao atualizar custo de vidro:', error)
    showError(
      'Erro',
      error.response?.data?.message || 'Não foi possível atualizar'
    )
    await loadGlassCosts()
  }
}

const handleUpdateNonStandard = async (color: string, value: string | number) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value

  if (numericValue === undefined || numericValue === null || isNaN(numericValue)) {
    showError('Erro', 'Valor inválido')
    return
  }

  try {
    await glassCostService.updateNonStandardByColor(color, numericValue)
    showSuccess('Sucesso', `Custo não-padrão de ${color} atualizado`)
    await loadGlassCosts()
  } catch (error: any) {
    console.error('Erro ao atualizar custo não-padrão:', error)
    showError('Erro', error.response?.data?.message || 'Não foi possível atualizar')
    await loadGlassCosts()
  }
}

onMounted(() => {
  loadGlassCosts()
})
</script>
