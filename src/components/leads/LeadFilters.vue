<script setup lang="ts">
import { computed } from 'vue'
import Button from '../ui/Button.vue'
import TabsList from '../ui/TabsList.vue'
import TabsTrigger from '../ui/TabsTrigger.vue'
import Badge from '../ui/Badge.vue'

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

// V2_17: tier filter tabs — 4 buckets on top of status tabs
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
  { value: 'CONVERTED', label: 'Convertidos', count: props.counts?.converted || 0 }
])

const handleTabClick = (value: string) => {
  emit('update:statusFilter', value)
}
</script>

<template>
  <div class="bg-card rounded-lg shadow-sm border border-border p-2 md:p-3 mb-3">
    <!-- Tabs de Status -->
    <TabsList class="w-full justify-start overflow-x-auto">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        :class="['shrink-0', statusFilter === tab.value ? 'bg-background' : '']"
        @click="handleTabClick(tab.value)"
      >
        <span class="flex items-center gap-2">
          <span v-if="tab.dot && tab.count > 0" class="flex h-2 w-2 rounded-full bg-info" />
          {{ tab.label }}
          <Badge v-if="tab.count > 0" variant="secondary" class="ml-1">
            {{ tab.count }}
          </Badge>
        </span>
      </TabsTrigger>
    </TabsList>

    <!-- V2_17: tier filter row -->
    <div class="mt-2 flex flex-wrap gap-1.5">
      <Button
        v-for="tab in tierTabs"
        :key="tab.value"
        variant="ghost"
        size="sm"
        :class="[
          'text-xs h-7 px-2.5',
          (tierFilter || 'all') === tab.value ? 'bg-accent font-semibold' : '',
          tab.class || '',
        ]"
        @click="emit('update:tierFilter', tab.value)"
      >
        {{ tab.label }}
      </Button>
    </div>
  </div>
</template>
