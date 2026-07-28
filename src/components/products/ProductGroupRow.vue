<template>
  <button
    type="button"
    @click="emit('toggle')"
    class="w-full px-4 py-2.5 md:py-3 flex items-center gap-3 text-left hover:bg-accent/50 transition-colors"
    :class="group.colorCount === 1 && 'cursor-default'"
  >
    <component :is="typeIcon" class="w-4 h-4 shrink-0 text-muted-foreground hidden sm:block" />

    <div class="flex-1 min-w-0">
      <p class="text-sm md:text-base font-medium text-foreground truncate">
        {{ group.width ? group.width + 'cm' : '—' }} × {{ group.height ? group.height + 'cm' : '—' }}
        <span v-if="group.measure" class="text-muted-foreground font-normal">({{ group.measure.toFixed(2) }}m²)</span>
      </p>
      <p class="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
        <Badge :variant="typeBadgeVariant(group.type)" class="text-[10px] px-1.5 py-px">
          {{ group.type || '—' }}
        </Badge>
        <Badge
          v-if="group.standard !== undefined"
          :variant="standardBadgeVariant(group.standard)"
          class="text-[10px] px-1.5 py-px"
        >
          {{ group.standard ? 'Padrão' : 'Não-padrão' }}
        </Badge>
        <span>{{ group.sheets ?? '—' }} {{ group.sheets === 1 ? 'folha' : 'folhas' }}</span>
        <span>· {{ group.colorCount }} {{ group.colorCount > 1 ? 'cores' : 'cor' }}</span>
      </p>
    </div>

    <div class="text-right shrink-0">
      <p class="text-[10px] text-muted-foreground uppercase tracking-wide leading-none">À vista</p>
      <p class="text-sm md:text-base font-semibold text-success leading-tight whitespace-nowrap">{{ priceRange }}</p>
    </div>
    <ChevronDown
      v-if="group.colorCount > 1"
      class="w-4 h-4 text-muted-foreground shrink-0 transition-transform"
      :class="expanded && 'rotate-180'"
    />
    <!-- Grupos de 1 cor ficam sempre expandidos: spacer mantém o preço alinhado. -->
    <span v-else class="w-4 shrink-0" aria-hidden="true" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  AppWindow,
  Building2,
  ChevronDown,
  DoorOpen,
  Package,
  PanelTop,
  RectangleVertical,
  Square,
} from 'lucide-vue-next'
import Badge from '../ui/Badge.vue'
import { typeBadgeVariant, standardBadgeVariant, type ProductGroup } from '../../lib/productDisplay'
import { useCurrency } from '../../composables/useCurrency'

const props = defineProps<{
  group: ProductGroup
  expanded: boolean
}>()

const emit = defineEmits<{ (e: 'toggle'): void }>()

const { formatCurrency } = useCurrency()

const TYPE_ICONS: Record<string, any> = {
  PORTA: DoorOpen,
  JANELA: AppWindow,
  BOX: Square,
  SACADA: Building2,
  BASCULANTE: PanelTop,
  FIXO: RectangleVertical,
}

const typeIcon = computed(() => (props.group.type && TYPE_ICONS[props.group.type]) || Package)

const priceRange = computed(() => {
  const { priceMin, priceMax } = props.group
  if (!priceMin && !priceMax) return '—'
  if (priceMin === priceMax) return formatCurrency(priceMax)
  return `${formatCurrency(priceMin)} – ${formatCurrency(priceMax)}`
})
</script>
