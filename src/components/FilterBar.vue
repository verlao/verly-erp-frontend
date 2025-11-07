<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
    <div class="flex flex-col lg:flex-row gap-4">
      <!-- Search Input -->
      <div class="flex-1">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-gray-400"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <Input
            v-model="localSearch"
            type="text"
            placeholder="Buscar produtos..."
            class="pl-10"
            @input="handleSearchInput"
          />
        </div>
      </div>

      <!-- Type Filter -->
      <div class="w-full lg:w-48">
        <Select
          :model-value="localType"
          @update:model-value="handleTypeChange"
          placeholder="Todos os tipos"
        >
          <template #trigger="{ value }">
            <span :class="value ? '' : 'text-muted-foreground'">
              {{ value || 'Todos os tipos' }}
            </span>
          </template>
          <SelectItem value="">Todos os tipos</SelectItem>
          <SelectItem value="PORTA">Porta</SelectItem>
          <SelectItem value="JANELA">Janela</SelectItem>
          <SelectItem value="SACADA">Sacada</SelectItem>
          <SelectItem value="BASCULANTE">Basculante</SelectItem>
          <SelectItem value="FIXO">Fixo</SelectItem>
        </Select>
      </div>

      <!-- Color Filter -->
      <div class="w-full lg:w-48">
        <Select
          :model-value="localColor"
          @update:model-value="handleColorChange"
          placeholder="Todas as cores"
        >
          <template #trigger="{ value }">
            <span :class="value ? '' : 'text-muted-foreground'">
              {{ value || 'Todas as cores' }}
            </span>
          </template>
          <SelectItem value="">Todas as cores</SelectItem>
          <SelectItem value="INCOLOR">Incolor</SelectItem>
          <SelectItem value="VERDE">Verde</SelectItem>
          <SelectItem value="FUME">Fumê</SelectItem>
          <SelectItem value="BRONZE">Bronze</SelectItem>
        </Select>
      </div>

      <!-- Clear Filters Button -->
      <Button
        v-if="hasActiveFilters"
        variant="outline"
        @click="clearFilters"
        class="whitespace-nowrap"
        aria-label="Limpar filtros"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="mr-2"
        >
          <path d="M3 6h18"/>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        </svg>
        Limpar
      </Button>
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
      <Badge
        v-if="localSearch"
        variant="secondary"
        class="flex items-center gap-1"
      >
        <span class="text-xs">Busca: {{ localSearch }}</span>
        <button
          @click="localSearch = ''; handleSearchInput()"
          class="ml-1 hover:bg-gray-300 rounded-full p-0.5"
          aria-label="Remover filtro de busca"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
          </svg>
        </button>
      </Badge>

      <Badge
        v-if="localType"
        variant="secondary"
        class="flex items-center gap-1"
      >
        <span class="text-xs">Tipo: {{ localType }}</span>
        <button
          @click="handleTypeChange('')"
          class="ml-1 hover:bg-gray-300 rounded-full p-0.5"
          aria-label="Remover filtro de tipo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
          </svg>
        </button>
      </Badge>

      <Badge
        v-if="localColor"
        variant="secondary"
        class="flex items-center gap-1"
      >
        <span class="text-xs">Cor: {{ localColor }}</span>
        <button
          @click="handleColorChange('')"
          class="ml-1 hover:bg-gray-300 rounded-full p-0.5"
          aria-label="Remover filtro de cor"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
          </svg>
        </button>
      </Badge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, watch } from 'vue'
import Input from './ui/Input.vue'
import Select from './ui/Select.vue'
import SelectItem from './ui/SelectItem.vue'
import Button from './ui/Button.vue'
import Badge from './ui/Badge.vue'

const props = defineProps<{
  search?: string
  type?: string
  color?: string
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:type': [value: string]
  'update:color': [value: string]
}>()

const localSearch = ref(props.search || '')
const localType = ref(props.type || '')
const localColor = ref(props.color || '')

// Watch for external changes
watch(() => props.search, (newVal) => localSearch.value = newVal || '')
watch(() => props.type, (newVal) => localType.value = newVal || '')
watch(() => props.color, (newVal) => localColor.value = newVal || '')

// Provide emit and close functions for SelectItem components
provide('select-emit', (event: string, value: string | number) => {
  // This will be handled by individual select change handlers
})

provide('select-close', () => {
  // Close functionality is handled by Select component
})

const hasActiveFilters = computed(() => {
  return !!(localSearch.value || localType.value || localColor.value)
})

let searchTimeout: number | undefined

const handleSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    emit('update:search', localSearch.value)
  }, 300)
}

const handleTypeChange = (value: string | number) => {
  localType.value = String(value)
  emit('update:type', String(value))
}

const handleColorChange = (value: string | number) => {
  localColor.value = String(value)
  emit('update:color', String(value))
}

const clearFilters = () => {
  localSearch.value = ''
  localType.value = ''
  localColor.value = ''
  emit('update:search', '')
  emit('update:type', '')
  emit('update:color', '')
}
</script>
