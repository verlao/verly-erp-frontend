<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">Leads</h1>
      <p class="text-lg text-muted-foreground">Gerencie todos os leads do sistema</p>
    </div>

    <Card class="p-6">
      <div v-if="loading" class="p-6 text-center">
        <p class="text-muted-foreground">Carregando...</p>
      </div>
      <div v-else-if="leads.length === 0" class="p-6 text-center">
        <p class="text-muted-foreground">Nenhum lead encontrado</p>
      </div>
      <div v-else class="space-y-4">
        <div v-for="lead in leads" :key="lead.id" class="bg-white border border-border rounded-lg shadow overflow-hidden">
          <button
            @click.stop="toggleLead(lead.id)"
            class="w-full p-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
          >
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-foreground">{{ lead.name }}</h3>
              <p class="text-sm text-muted-foreground">{{ lead.neighborhood }} • {{ formatDate(lead.createdDate) }}</p>
            </div>
            <svg
              :class="{ 'rotate-180': expandedLeads.includes(lead.id) }"
              class="h-5 w-5 text-muted-foreground transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div v-if="expandedLeads.includes(lead.id)" class="p-4 border-t border-border bg-muted/20">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-semibold text-foreground">Descrição:</span>
                <p class="text-muted-foreground mt-1 leading-relaxed">{{ lead.description }}</p>
              </div>
              <div>
                <span class="font-semibold text-foreground">Telefone:</span>
                <p class="text-muted-foreground mt-1">{{ lead.phone }}</p>
              </div>
              <div>
                <span class="font-semibold text-foreground">Email:</span>
                <p class="text-muted-foreground mt-1">{{ lead.email }}</p>
              </div>
              <div>
                <span class="font-semibold text-foreground">Data de criação:</span>
                <p class="text-muted-foreground mt-1">{{ formatDate(lead.createdDate) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="loading" class="py-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p class="mt-2 text-sm text-muted-foreground">Carregando leads...</p>
        </div>

        <div v-if="!loading && leads.length === 0" class="py-12 text-center">
          <div class="mx-auto h-12 w-12 text-muted-foreground">
            <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="mt-4 text-lg font-semibold text-foreground">Nenhum lead encontrado</h3>
          <p class="mt-1 text-muted-foreground">Não há leads cadastrados no sistema ainda.</p>
        </div>
        
        <!-- Paginação -->
        <div v-if="totalPages > 1" class="mt-6">
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :total-items="totalItems"
            :page-size="pageSize"
            @page-changed="handlePageChange"
            @page-size-changed="handlePageSizeChange"
          />
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Card from '../components/ui/Card.vue'
import Pagination from '../components/ui/Pagination.vue'
import leadService from '../services/lead'
import type { LeadDTO, PaginatedResponse } from '../services/lead'

const leads = ref<LeadDTO[]>([])
const loading = ref(true)
const expandedLeads = ref<number[]>([])

// Paginação
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const totalPages = ref(0)

const toggleLead = (leadId: number) => {
  const index = expandedLeads.value.indexOf(leadId)
  if (index === -1) {
    expandedLeads.value.push(leadId)
  } else {
    expandedLeads.value.splice(index, 1)
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  
  try {
    // Formatar data no formato brasileiro
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Data inválida'
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Data inválida'
  }
}

const fetchLeads = async () => {
  try {
    loading.value = true
    const response: PaginatedResponse<LeadDTO> = await leadService.getAll({
      page: currentPage.value - 1, // Spring Boot usa páginas baseadas em 0
      size: pageSize.value
    })
    
    // Verificar se a resposta é paginada
    if (response && typeof response === 'object' && 'content' in response) {
      leads.value = response.content
      totalItems.value = response.totalElements
      totalPages.value = response.totalPages
    } else {
      // Fallback para API sem paginação
      try {
        const fallbackResponse = await leadService.getAllNonPaginated()
        leads.value = Array.isArray(fallbackResponse) ? fallbackResponse : []
        totalItems.value = leads.value.length
        totalPages.value = 1
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError)
        leads.value = []
      }
    }
  } catch (error) {
    console.error('Erro ao carregar leads:', error)
    // Fallback para API sem paginação
    try {
      const fallbackResponse = await leadService.getAllNonPaginated()
      leads.value = Array.isArray(fallbackResponse) ? fallbackResponse : []
      totalItems.value = leads.value.length
      totalPages.value = 1
    } catch (fallbackError) {
      console.error('Erro no fallback:', fallbackError)
      leads.value = []
    }
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchLeads()
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1 // Reset para primeira página
  fetchLeads()
}

onMounted(() => {
  fetchLeads()
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>