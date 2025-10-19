<script setup lang="ts">
import { computed } from 'vue'
import { Search, Filter, X } from 'lucide-vue-next'
import Button from '../ui/Button.vue'
import Input from '../ui/Input.vue'
import TabsList from '../ui/TabsList.vue'
import TabsTrigger from '../ui/TabsTrigger.vue'
import Badge from '../ui/Badge.vue'

const props = defineProps<{
  search?: string
  statusFilter?: string
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
  'clear': []
}>()

const hasActiveFilters = computed(() => {
  return props.search || (props.statusFilter && props.statusFilter !== 'all')
})

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
  <div class="space-y-4 p-4 border-b border-border bg-background">
    <!-- Tabs -->
    <TabsList class="w-full justify-start overflow-x-auto">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        :class="statusFilter === tab.value ? 'bg-background' : ''"
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

    <!-- Search and filters -->
    <div class="flex items-center gap-2">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          :model-value="search"
          placeholder="Buscar por nome, email ou telefone..."
          class="pl-9"
          @update:model-value="(value) => emit('update:search', value as string)"
        />
      </div>

      <Button
        v-if="hasActiveFilters"
        variant="ghost"
        size="sm"
        @click="emit('clear')"
      >
        <X class="w-4 h-4 mr-1" />
        Limpar
      </Button>
    </div>
  </div>
</template>

<style scoped>
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.5);
}
</style>
