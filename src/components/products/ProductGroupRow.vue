<template>
  <button
    type="button"
    @click="emit('toggle')"
    class="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-accent/50 transition-colors"
  >
    <!-- Identidade do grupo -->
    <div class="flex items-center gap-2 md:gap-3 min-w-0 flex-wrap">
      <span
        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
        :class="typeBadgeClass(group.type)"
      >
        {{ group.type || '—' }}
      </span>
      <span
        v-if="group.standard !== undefined"
        class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap"
        :class="standardBadgeClass(group.standard)"
      >
        {{ group.standard ? 'Padrão' : 'Não-padrão' }}
      </span>
      <span class="text-xs text-muted-foreground whitespace-nowrap">
        {{ group.sheets ?? '—' }} {{ group.sheets === 1 ? 'folha' : 'folhas' }}
      </span>
      <span class="text-sm text-foreground whitespace-nowrap">
        {{ group.width ? group.width + 'cm' : '—' }} × {{ group.height ? group.height + 'cm' : '—' }}
        <span v-if="group.measure" class="text-muted-foreground">({{ group.measure.toFixed(2) }}m²)</span>
      </span>
      <span class="text-xs text-muted-foreground whitespace-nowrap">
        · {{ group.colorCount }} {{ group.colorCount > 1 ? 'cores' : 'cor' }}
      </span>
    </div>

    <!-- Preço + chevron -->
    <div class="flex items-center gap-3 shrink-0">
      <div class="text-right">
        <p class="text-[10px] text-muted-foreground uppercase tracking-wide leading-none">À vista</p>
        <p class="text-sm font-bold text-green-600 leading-tight whitespace-nowrap">{{ priceRange }}</p>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-muted-foreground transition-transform shrink-0"
        :class="{ 'rotate-90': expanded }"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { typeBadgeClass, standardBadgeClass, type ProductGroup } from '../../lib/productDisplay'
import { useCurrency } from '../../composables/useCurrency'

const props = defineProps<{
  group: ProductGroup
  expanded: boolean
}>()

const emit = defineEmits<{ (e: 'toggle'): void }>()

const { formatCurrency } = useCurrency()

const priceRange = computed(() => {
  const { priceMin, priceMax } = props.group
  if (!priceMin && !priceMax) return '—'
  if (priceMin === priceMax) return formatCurrency(priceMax)
  return `${formatCurrency(priceMin)} – ${formatCurrency(priceMax)}`
})
</script>
