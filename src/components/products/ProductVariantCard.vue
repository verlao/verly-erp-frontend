<template>
  <Card
    :class="[
      'p-3 transition-all duration-200',
      selected ? 'border-blue-400 ring-1 ring-blue-300 bg-blue-50/40' : 'hover:border-primary/40 hover:shadow-md',
    ]"
  >
    <!-- Cabeçalho: cor + ações -->
    <div class="flex items-center justify-between gap-2 mb-2">
      <span
        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
        :class="colorBadgeClass(product.color)"
      >
        {{ product.color || '—' }}
      </span>
      <div class="flex items-center gap-0.5">
        <button
          v-if="product.id"
          type="button"
          @click="emit('toggle-select')"
          :class="[
            'w-8 h-8 flex items-center justify-center rounded-lg transition-colors',
            selected ? 'text-blue-600 bg-blue-100' : 'text-muted-foreground hover:bg-accent',
          ]"
          :aria-label="selected ? 'Desselecionar' : 'Selecionar para orçamento'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path v-if="selected" d="M20 6 9 17l-5-5" />
            <rect v-else x="3" y="3" width="18" height="18" rx="2" />
          </svg>
        </button>
        <button
          type="button"
          @click="emit('edit')"
          class="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          aria-label="Editar produto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          type="button"
          @click="emit('delete')"
          class="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Excluir produto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c0 1 1 2 1 2v2" />
          </svg>
        </button>
      </div>
    </div>

    <!-- À vista + parcelado -->
    <div class="flex items-end justify-between gap-2">
      <div class="min-w-0">
        <p class="text-[10px] text-muted-foreground uppercase tracking-wide">À vista</p>
        <p class="text-xl font-bold text-green-600 leading-tight whitespace-nowrap">
          R$ {{ product.price ? product.price.toFixed(2) : '0,00' }}
        </p>
      </div>
      <div v-if="product.priceOptions" class="text-right text-[11px] space-y-0.5 shrink-0">
        <div v-if="product.priceOptions.installments4x" class="text-muted-foreground">
          4× R$ {{ (product.priceOptions.installments4x / 4).toFixed(2) }}
        </div>
        <div v-if="product.priceOptions.installments10x" class="text-muted-foreground">
          10× R$ {{ (product.priceOptions.installments10x / 10).toFixed(2) }}
        </div>
        <div v-if="product.priceOptions.installments12x" class="text-muted-foreground">
          12× R$ {{ (product.priceOptions.installments12x / 12).toFixed(2) }}
        </div>
      </div>
    </div>

    <!-- Custo / Lucro -->
    <div class="flex items-center justify-between gap-2 text-xs mt-2 pt-2 border-t border-border">
      <span class="text-muted-foreground">
        Custo <span class="font-medium text-foreground font-mono">R$ {{ product.cost ? product.cost.toFixed(2) : '0,00' }}</span>
      </span>
      <span class="text-muted-foreground">
        Lucro <span class="font-medium text-purple-600 font-mono">{{ calculateProfit(product) }}</span>
      </span>
    </div>

    <!-- Editáveis: kit / mão de obra / ganho % -->
    <div class="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-border">
      <div>
        <p class="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Kit</p>
        <EditableValue
          :model-value="product.accessory ?? product.kit ?? 0"
          type="currency"
          compact
          @save="(v) => emit('save-kit', v)"
        />
      </div>
      <div>
        <p class="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Mão de obra</p>
        <EditableValue
          :model-value="product.laborValue ?? 0"
          type="currency"
          compact
          @save="(v) => emit('save-labor', v)"
        />
      </div>
      <div>
        <p class="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Ganho %</p>
        <EditableValue
          :model-value="product.gainValue ?? 0"
          type="number"
          suffix="%"
          compact
          @save="(v) => emit('save-gain', v)"
        />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import Card from '../ui/Card.vue'
import EditableValue from '../EditableValue.vue'
import type { ProductDTO } from '../../services/product'
import { colorBadgeClass, calculateProfit } from '../../lib/productDisplay'

defineProps<{
  product: ProductDTO
  selected: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-select'): void
  (e: 'edit'): void
  (e: 'delete'): void
  (e: 'save-kit', value: number | string): void
  (e: 'save-labor', value: number | string): void
  (e: 'save-gain', value: number | string): void
}>()
</script>
