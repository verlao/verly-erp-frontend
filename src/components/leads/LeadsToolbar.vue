<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Search, X, Plus } from 'lucide-vue-next'
import Button from '../ui/Button.vue'
import Input from '../ui/Input.vue'

defineProps<{
  search?: string
  hasActiveFilters?: boolean
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'clear': []
}>()

const router = useRouter()
</script>

<template>
  <div class="flex items-center gap-2 md:gap-3">
    <div class="relative flex-1 max-w-2xl">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        :model-value="search"
        placeholder="Buscar por nome, email ou telefone..."
        class="pl-9 h-10"
        @update:model-value="(value) => emit('update:search', value as string)"
      />
      <Button
        v-if="hasActiveFilters"
        variant="ghost"
        size="sm"
        class="absolute right-1 top-1/2 -translate-y-1/2"
        aria-label="Limpar filtros"
        @click="emit('clear')"
      >
        <X class="w-4 h-4" />
      </Button>
    </div>

    <Button class="h-10 shrink-0" @click="router.push('/new-quote')">
      <Plus class="w-4 h-4 sm:mr-2" />
      <span class="hidden sm:inline">Novo Orçamento</span>
    </Button>
  </div>
</template>
