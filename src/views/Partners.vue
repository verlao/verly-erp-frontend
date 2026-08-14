<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Badge from '../components/ui/Badge.vue'
import Pagination from '../components/ui/Pagination.vue'
import TabsList from '../components/ui/TabsList.vue'
import TabsTrigger from '../components/ui/TabsTrigger.vue'
import partnerService, { partnerTypeLabels } from '../services/partner'
import type { PartnerDTO, PartnerType } from '../services/partner'
import type { PaginatedResponse } from '../services/lead'
import { maskPhone } from '../lib/masks'

// State
const partners = ref<PartnerDTO[]>([])
const loading = ref(true)
const typeFilter = ref<'all' | PartnerType>('all')

// Pagination
const currentPage = ref(1)
const pageSize = ref(20)
const totalItems = ref(0)

// Chips de filtro por tipo (param server-side; refetch a cada troca)
const typeTabs: { value: 'all' | PartnerType; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'SUPPLIER', label: 'Fornecedores' },
  { value: 'SERVICE_PROVIDER', label: 'Mão de obra' },
]

const typeBadgeVariant = (type: PartnerType) =>
  type === 'SUPPLIER' ? 'info' : 'warning'

const formatDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR')
}

const fetchPartners = async () => {
  try {
    loading.value = true
    const response: PaginatedResponse<PartnerDTO> = await partnerService.getAllPaginated({
      page: currentPage.value - 1,
      size: pageSize.value,
      type: typeFilter.value === 'all' ? undefined : typeFilter.value,
    })
    partners.value = response.content
    totalItems.value = response.totalElements
  } catch (error) {
    console.error('Erro ao carregar parceiros:', error)
    partners.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

// Troca de filtro volta pra primeira página e refaz a busca no backend.
watch(typeFilter, () => {
  currentPage.value = 1
  fetchPartners()
})

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchPartners()
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchPartners()
}

onMounted(fetchPartners)
</script>

<template>
  <div>
    <!-- Filtros por tipo -->
    <div class="bg-card rounded-lg shadow-sm border border-border p-2 md:p-3 mb-3">
      <TabsList class="w-full justify-start overflow-x-auto">
        <TabsTrigger
          v-for="tab in typeTabs"
          :key="tab.value"
          :value="tab.value"
          :class="['shrink-0', typeFilter === tab.value ? 'bg-background' : '']"
          @click="typeFilter = tab.value"
        >
          {{ tab.label }}
        </TabsTrigger>
      </TabsList>
    </div>

    <!-- Lista -->
    <div class="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="mt-2 text-sm text-muted-foreground">Carregando parceiros...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="partners.length === 0" class="p-12 text-center">
        <div class="mx-auto h-12 w-12 text-muted-foreground/40 mb-4">
          <svg
            class="w-full h-full"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m11 17 2 2a1 1 0 1 0 3-3" />
            <path
              d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"
            />
            <path d="m21 3 1 11h-2" />
            <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
            <path d="M3 4h8" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-foreground">Nenhum parceiro ainda</h3>
        <p class="mt-1 text-sm text-muted-foreground">
          Classifique contatos pelo WhatsApp.
        </p>
      </div>

      <!-- Rows -->
      <div v-else class="divide-y divide-border">
        <div
          v-for="partner in partners"
          :key="partner.id"
          class="p-4 flex items-center justify-between gap-3"
        >
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-foreground truncate">{{ partner.name }}</span>
              <Badge :variant="typeBadgeVariant(partner.type)" class="shrink-0 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5">
                {{ partnerTypeLabels[partner.type] }}
              </Badge>
            </div>
            <p class="mt-0.5 text-sm text-muted-foreground">
              {{ partner.phone ? maskPhone(partner.phone) : 'Sem telefone' }}
            </p>
          </div>
          <span class="shrink-0 text-xs text-muted-foreground">
            {{ formatDate(partner.createdAt) }}
          </span>
        </div>
      </div>

      <!-- Paginação -->
      <Pagination
        v-if="!loading && totalItems > 0"
        :current-page="currentPage"
        :total-items="totalItems"
        :page-size="pageSize"
        @page-changed="handlePageChange"
        @page-size-changed="handlePageSizeChange"
      />
    </div>
  </div>
</template>
