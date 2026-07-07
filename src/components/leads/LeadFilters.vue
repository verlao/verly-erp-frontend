<script setup lang="ts">
import { computed } from 'vue'
import { Search, X } from 'lucide-vue-next'
import Button from '../ui/Button.vue'
import Input from '../ui/Input.vue'
import TabsList from '../ui/TabsList.vue'
import TabsTrigger from '../ui/TabsTrigger.vue'
import Badge from '../ui/Badge.vue'

const props = defineProps<{
  search?: string
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
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:statusFilter': [value: string]
  'update:tierFilter': [value: string]
  'clear': []
}>()

const hasActiveFilters = computed(() => {
  return (
    props.search ||
    (props.statusFilter && props.statusFilter !== 'all') ||
    (props.tierFilter && props.tierFilter !== 'all')
  )
})

// V2_17: tier filter tabs — 4 buckets on top of status tabs
const tierTabs = [
  { value: 'all', label: 'Todos os tiers' },
  { value: '$$$', label: '$$$ Alto', class: 'text-yellow-600' },
  { value: '$$', label: '$$ Médio', class: 'text-blue-600' },
  { value: '$', label: '$ Baixo', class: 'text-gray-600' },
]

const tabs = computed(() => [
  { value: 'all', label: 'Todos', count: props.counts?.all || 0 },
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
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
    <div class="flex flex-col lg:flex-row gap-4">
      <!-- Tabs de Status -->
      <div class="flex-1">
        <TabsList class="w-full justify-start overflow-x-auto">
          <TabsTrigger
            v-for="tab in tabs"
            :key="tab.value"
            :value="tab.value"
            :class="['shrink-0', statusFilter === tab.value ? 'bg-background' : '']"
            @click="handleTabClick(tab.value)"
          >
            <span class="flex items-center gap-2">
              <span v-if="tab.dot && tab.count > 0" class="flex h-2 w-2 rounded-full bg-blue-500" />
              {{ tab.label }}
              <Badge v-if="tab.count > 0" variant="secondary" class="ml-1">
                {{ tab.count }}
              </Badge>
            </span>
          </TabsTrigger>
        </TabsList>
      </div>

      <!-- Busca -->
      <div class="lg:w-80">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            :model-value="search"
            placeholder="Buscar por nome, email ou telefone..."
            class="pl-9"
            @update:model-value="(value) => emit('update:search', value as string)"
          />
          <Button
            v-if="hasActiveFilters"
            variant="ghost"
            size="sm"
            class="absolute right-1 top-1/2 -translate-y-1/2"
            @click="emit('clear')"
          >
            <X class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- V2_17: tier filter row -->
    <div class="mt-3 flex flex-wrap gap-1.5">
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
