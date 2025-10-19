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
  <div class="space-y-3 p-3 md:p-4 border-b border-border bg-background">
    <!-- Tabs - Scrollable on mobile -->
    <TabsList class="w-full justify-start overflow-x-auto flex-nowrap">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        :class="[
          statusFilter === tab.value ? 'bg-background' : '',
          'whitespace-nowrap text-xs md:text-sm'
        ]"
        @click="handleTabClick(tab.value)"
      >
        <span class="flex items-center gap-1.5">
          <span v-if="tab.dot && tab.count > 0" class="flex h-2 w-2 rounded-full bg-blue-500" />
          <span class="hidden sm:inline">{{ tab.label }}</span>
          <span class="sm:hidden">{{ tab.label.split(' ')[0] }}</span>
          <Badge v-if="tab.count > 0" variant="secondary" class="ml-0.5 text-xs">
            {{ tab.count }}
          </Badge>
        </span>
      </TabsTrigger>
    </TabsList>

    <!-- Search and filters -->
    <div class="flex items-center gap-2">
      <div class="relative flex-1">
        <Search class="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          :model-value="search"
          placeholder="Buscar..."
          class="pl-8 md:pl-9 text-sm h-9 md:h-10"
          @update:model-value="(value) => emit('update:search', value as string)"
        />
      </div>

      <Button
        v-if="hasActiveFilters"
        variant="ghost"
        size="sm"
        class="shrink-0"
        @click="emit('clear')"
      >
        <X class="w-4 h-4 md:mr-1" />
        <span class="hidden md:inline">Limpar</span>
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
