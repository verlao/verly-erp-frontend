<template>
  <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5 w-full">
    <div
      v-for="glass in displayedGlassCosts"
      :key="glass.id"
      class="flex flex-col gap-0.5 px-2 py-2 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/50 hover:shadow-sm transition-all duration-200"
    >
      <!-- Linha 1: swatch + cor -->
      <div class="flex items-center gap-1">
        <span
          v-if="glass.color === 'CANELADO'"
          class="w-1.5 h-3 rounded-sm flex-shrink-0"
          :style="caneladoSwatch"
          aria-hidden="true"
        ></span>
        <span
          v-else-if="glass.color === 'ESPELHO'"
          class="w-1.5 h-3 rounded-sm flex-shrink-0"
          :style="espelhoSwatch"
          aria-hidden="true"
        ></span>
        <span
          v-else
          class="w-1 h-3 rounded-full flex-shrink-0"
          :class="{
            'bg-blue-500': glass.color === 'INCOLOR',
            'bg-green-500': glass.color === 'VERDE',
            'bg-gray-500': glass.color === 'FUME',
            'bg-amber-500': glass.color === 'BRONZE',
          }"
          aria-hidden="true"
        ></span>
        <span
          class="text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wide truncate"
        >
          {{ glass.color }}
        </span>
      </div>

      <!-- Linha 2: preço (editable) -->
      <EditableValue
        :model-value="glass.costPerSquareMeter"
        type="currency"
        @save="(value) => handleUpdate(glass.id!, glass.color, value)"
        variant="default"
        compact
        class="text-xs sm:text-sm font-semibold text-foreground"
      />

      <!-- Linha 3: unidade -->
      <span class="text-[9px] text-muted-foreground -mt-0.5">por m²</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import glassCostService, { type GlassCostDTO } from '../services/glass-cost'
import EditableValue from './EditableValue.vue'
import { useNotification } from '../composables/useNotification'

const { success: showSuccess, error: showError } = useNotification()

const glassCosts = ref<GlassCostDTO[]>([])

// Tipos/cores prioritários no display. CANELADO e ESPELHO entram junto pra
// ficarem editáveis mesmo sem produto associado (per user spec).
const priorityColors = ['INCOLOR', 'VERDE', 'FUME', 'CANELADO', 'ESPELHO']

// Swatch textura pra vidro canelado — listra diagonal sugerindo o
// padrão ondulado da peça.
const caneladoSwatch = {
  background:
    'repeating-linear-gradient(45deg, #94a3b8 0 2px, #cbd5e1 2px 4px)',
}

// Swatch pra espelho — gradiente metálico/reflexivo.
const espelhoSwatch = {
  background:
    'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 45%, #f8fafc 55%, #64748b 100%)',
}

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
    showSuccess('Sucesso', `Custo de ${color} atualizado`)
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

onMounted(() => {
  loadGlassCosts()
})
</script>
