<script setup lang="ts">
import { computed } from 'vue'
import Badge from '../ui/Badge.vue'
import { useHorizontalOverflow } from '../../composables/useHorizontalOverflow'

const props = defineProps<{
  statusFilter?: string
  tierFilter?: string
  counts?: {
    all: number
    new: number
    contacted: number
    qualified: number
    converted: number
    lost: number
  }
  // Leads com pagamento sinalizado sem comprovante (calculado client-side).
  paidCount?: number
}>()

const emit = defineEmits<{
  'update:statusFilter': [value: string]
  'update:tierFilter': [value: string]
}>()

const chipBase =
  'h-8 px-3 rounded-full text-xs font-medium border transition-colors shrink-0 inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

const chipActive = 'bg-primary text-primary-foreground border-primary'
const chipIdle = 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-accent'

// V2_17: tier filter chips — same row as status
const tierTabs = [
  { value: 'all', label: 'Todos os tiers' },
  { value: '$$$', label: '$$$ Alto', class: 'text-warning' },
  { value: '$$', label: '$$ Médio', class: 'text-info' },
  { value: '$', label: '$ Baixo', class: 'text-muted-foreground' },
]

const tabs = computed(() => [
  { value: 'all', label: 'Todos', count: props.counts?.all || 0 },
  // Fila de pagamentos sinalizados sem comprovante — dinheiro afirmado tem prioridade visual.
  { value: 'PAID', label: '💰 Pagos', count: props.paidCount || 0 },
  { value: 'NEW', label: 'Novos', count: props.counts?.new || 0, dot: true },
  { value: 'CONTACTED', label: 'Contatados', count: props.counts?.contacted || 0 },
  { value: 'QUALIFIED', label: 'Qualificados', count: props.counts?.qualified || 0 },
  { value: 'CONVERTED', label: 'Convertidos', count: props.counts?.converted || 0 },
  { value: 'LOST', label: 'Perdidos', count: props.counts?.lost || 0 },
])

const visibleTabs = computed(() =>
  tabs.value.filter(t => t.count > 0 || t.value === (props.statusFilter || 'all'))
)

const currentStatus = computed(() => props.statusFilter || 'all')
const currentTier = computed(() => props.tierFilter || 'all')

function statusAriaLabel(tab: { label: string; count: number }): string {
  return `Filtrar por status: ${tab.label} (${tab.count})`
}

function tierAriaLabel(tab: { label: string }): string {
  return `Filtrar por tier: ${tab.label}`
}

const { containerRef, maskStyle } = useHorizontalOverflow()
</script>

<template>
  <div class="mb-3 shrink-0">
    <div
      ref="containerRef"
      :style="maskStyle"
      class="flex items-center gap-1.5 pr-6 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="toolbar"
      aria-label="Filtros de leads por status e tier"
    >
      <button
        v-for="tab in visibleTabs"
        :key="tab.value"
        type="button"
        :class="[chipBase, currentStatus === tab.value ? chipActive : chipIdle]"
        :aria-label="statusAriaLabel(tab)"
        :aria-pressed="currentStatus === tab.value"
        @click="emit('update:statusFilter', tab.value)"
      >
        <span
          v-if="tab.dot && tab.count > 0"
          class="flex h-2 w-2 rounded-full"
          :class="currentStatus === tab.value ? 'bg-primary-foreground' : 'bg-info'"
          aria-hidden="true"
        />
        {{ tab.label }}
        <Badge
          v-if="tab.count > 0"
          variant="secondary"
          :class="currentStatus === tab.value ? 'bg-primary-foreground/20 text-primary-foreground' : ''"
        >
          {{ tab.count }}
        </Badge>
      </button>

      <span class="h-4 w-px bg-border shrink-0" aria-hidden="true" />

      <button
        v-for="tab in tierTabs"
        :key="tab.value"
        type="button"
        :class="[
          chipBase,
          currentTier === tab.value ? chipActive : chipIdle,
          currentTier === tab.value ? '' : tab.class || '',
        ]"
        :aria-label="tierAriaLabel(tab)"
        :aria-pressed="currentTier === tab.value"
        @click="emit('update:tierFilter', tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>
