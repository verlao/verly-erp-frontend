<template>
  <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
    <div class="flex justify-between flex-1 sm:hidden">
      <button
        @click="goToPreviousPage"
        :disabled="currentPage === 1"
        class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Anterior
      </button>
      <button
        @click="goToNextPage"
        :disabled="currentPage === totalPages"
        class="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Próximo
      </button>
    </div>
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700">
          Mostrando
          <span class="font-medium">{{ startItem }}</span>
          até
          <span class="font-medium">{{ endItem }}</span>
          de
          <span class="font-medium">{{ totalItems }}</span>
          resultados
        </p>
      </div>
      <div>
        <nav class="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <!-- Botão Anterior -->
          <button
            @click="goToPreviousPage"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">Anterior</span>
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Primeira página -->
          <button
            v-if="showFirstPage"
            @click="goToPage(1)"
            :class="pageButtonClass(1)"
          >
            1
          </button>

          <!-- Ellipsis inicial -->
          <span v-if="showStartEllipsis" class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
            ...
          </span>

          <!-- Páginas visíveis -->
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="pageButtonClass(page)"
          >
            {{ page }}
          </button>

          <!-- Ellipsis final -->
          <span v-if="showEndEllipsis" class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
            ...
          </span>

          <!-- Última página -->
          <button
            v-if="showLastPage"
            @click="goToPage(totalPages)"
            :class="pageButtonClass(totalPages)"
          >
            {{ totalPages }}
          </button>

          <!-- Botão Próximo -->
          <button
            @click="goToNextPage"
            :disabled="currentPage === totalPages"
            class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">Próximo</span>
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>

    <!-- Seletor de itens por página -->
    <div class="flex items-center space-x-2 ml-4">
      <label for="pageSize" class="text-sm text-gray-700">Itens por página:</label>
      <select
        id="pageSize"
        :value="pageSize"
        @change="changePageSize(($event.target as HTMLSelectElement).value)"
        class="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
      >
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalItems: number
  pageSize: number
  maxVisiblePages?: number
}

interface Emits {
  (e: 'page-changed', page: number): void
  (e: 'page-size-changed', pageSize: number): void
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 5
})

const emit = defineEmits<Emits>()

const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize))

const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (props.currentPage - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  const end = props.currentPage * props.pageSize
  return end > props.totalItems ? props.totalItems : end
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = props.maxVisiblePages
  const total = totalPages.value
  const current = props.currentPage

  if (total <= maxVisible) {
    // Se o total de páginas é menor que o máximo visível, mostrar todas
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Calcular o range de páginas visíveis
    let start = Math.max(1, current - Math.floor(maxVisible / 2))
    let end = Math.min(total, start + maxVisible - 1)

    // Ajustar se estamos no final
    if (end === total) {
      start = Math.max(1, end - maxVisible + 1)
    }

    // Não incluir primeira e última página se já estão sendo mostradas separadamente
    if (start > 1) start = Math.max(2, start)
    if (end < total) end = Math.min(total - 1, end)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }

  return pages
})

const showFirstPage = computed(() => {
  return totalPages.value > props.maxVisiblePages && !visiblePages.value.includes(1)
})

const showLastPage = computed(() => {
  return totalPages.value > props.maxVisiblePages && !visiblePages.value.includes(totalPages.value)
})

const showStartEllipsis = computed(() => {
  return showFirstPage.value && visiblePages.value[0] > 2
})

const showEndEllipsis = computed(() => {
  return showLastPage.value && visiblePages.value[visiblePages.value.length - 1] < totalPages.value - 1
})

function pageButtonClass(page: number): string {
  const baseClass = 'relative inline-flex items-center px-4 py-2 text-sm font-medium border'
  
  if (page === props.currentPage) {
    return `${baseClass} z-10 bg-primary border-primary text-white`
  }
  
  return `${baseClass} bg-white border-gray-300 text-gray-500 hover:bg-gray-50`
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('page-changed', page)
  }
}

function goToPreviousPage() {
  if (props.currentPage > 1) {
    goToPage(props.currentPage - 1)
  }
}

function goToNextPage() {
  if (props.currentPage < totalPages.value) {
    goToPage(props.currentPage + 1)
  }
}

function changePageSize(newSize: string) {
  const size = parseInt(newSize)
  if (size !== props.pageSize) {
    emit('page-size-changed', size)
  }
}
</script>