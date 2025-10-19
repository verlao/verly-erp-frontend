<template>
  <div class="flex flex-col h-screen">
    <!-- Header - More compact on mobile -->
    <div class="px-4 md:px-6 py-3 md:py-4 border-b border-border bg-background">
      <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Leads</h1>
      <p class="text-xs md:text-sm text-muted-foreground">Gerencie todos os leads do sistema</p>
    </div>

    <!-- Filters -->
    <LeadFilters
      v-model:search="search"
      v-model:status-filter="statusFilter"
      :counts="counts"
      @clear="clearFilters"
    />

    <!-- Main content - Split view -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Master panel - Lead list -->
      <div
        :class="[
          'border-r border-border bg-background transition-all duration-200',
          isMobile ? (selectedLead ? 'hidden' : 'w-full') : 'w-full md:w-2/5 lg:w-1/3'
        ]"
      >
        <LeadList
          :leads="filteredLeads"
          :selected-id="selectedId"
          :checked-ids="checkedIds"
          :loading="loading"
          @select="handleSelectLead"
          @toggle="toggleCheck"
          @toggle-all="toggleAll"
          @quick-action="handleQuickAction"
        />
      </div>

      <!-- Detail panel - Lead preview -->
      <div
        :class="[
          'bg-muted/20 transition-all duration-200',
          isMobile ? (selectedLead ? 'w-full' : 'hidden') : 'flex-1'
        ]"
      >
        <!-- Mobile back button -->
        <div v-if="isMobile && selectedLead" class="sticky top-0 z-10 p-3 border-b border-border bg-background">
          <button
            class="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            @click="selectedId = undefined"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
        </div>

        <LeadPreview
          :lead="selectedLead"
          @convert="handleConvert"
          @mark-contacted="handleMarkContacted"
          @mark-qualified="handleMarkQualified"
          @mark-lost="handleMarkLost"
          @open-whatsapp="handleOpenWhatsapp"
          @send-email="handleSendEmail"
        />
      </div>
    </div>

    <!-- Pagination - Hidden on mobile when lead is selected -->
    <div
      v-if="totalPages > 1 && !(isMobile && selectedLead)"
      class="p-3 md:p-4 border-t border-border bg-background"
    >
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useNotificationStore } from '../stores/notification'
import LeadList from '../components/leads/LeadList.vue'
import LeadPreview from '../components/leads/LeadPreview.vue'
import LeadFilters from '../components/leads/LeadFilters.vue'
import Pagination from '../components/ui/Pagination.vue'
import leadService from '../services/lead'
import type { LeadDTO, PaginatedResponse, LeadStatus } from '../services/lead'
import { useLeadSelection } from '../composables/useLeadSelection'
import { useLeadKeyboard } from '../composables/useLeadKeyboard'

// Notification store
const notification = useNotificationStore()

// State
const leads = ref<LeadDTO[]>([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref('all')
const counts = ref({
  all: 0,
  new: 0,
  contacted: 0,
  qualified: 0,
  converted: 0,
  lost: 0
})

// Pagination
const currentPage = ref(1)
const pageSize = ref(20)
const totalItems = ref(0)
const totalPages = ref(0)

// Selection
const {
  selectedId,
  selectedLead,
  checkedIds,
  selectLead,
  toggleCheck,
  toggleAll,
  selectNext,
  selectPrevious
} = useLeadSelection(leads)

// Responsive
const { width } = useWindowSize()
const isMobile = computed(() => width.value < 768)

// Filtered leads
const filteredLeads = computed(() => {
  let filtered = leads.value

  // Status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(lead =>
      (lead.status || 'NEW') === statusFilter.value
    )
  }

  // Search filter
  if (search.value) {
    const searchLower = search.value.toLowerCase()
    filtered = filtered.filter(lead =>
      lead.name.toLowerCase().includes(searchLower) ||
      lead.email?.toLowerCase().includes(searchLower) ||
      lead.phone?.toLowerCase().includes(searchLower) ||
      lead.description?.toLowerCase().includes(searchLower)
    )
  }

  return filtered
})

// Fetch leads
const fetchLeads = async () => {
  try {
    loading.value = true
    const response: PaginatedResponse<LeadDTO> = await leadService.getAll({
      page: currentPage.value - 1,
      size: pageSize.value,
      sort: 'createdDate,desc'
    })

    if (response && typeof response === 'object' && 'content' in response) {
      leads.value = response.content
      totalItems.value = response.totalElements
      totalPages.value = response.totalPages
    } else {
      const fallbackResponse = await leadService.getAllNonPaginated()
      leads.value = Array.isArray(fallbackResponse) ? fallbackResponse : []
      totalItems.value = leads.value.length
      totalPages.value = 1
    }
  } catch (error) {
    console.error('Erro ao carregar leads:', error)
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

// Fetch counts
const fetchCounts = async () => {
  try {
    const response = await leadService.getCounts()
    counts.value = response
  } catch (error) {
    // Calcular counts localmente se o endpoint não existir
    const statusCounts = leads.value.reduce((acc, lead) => {
      const status = lead.status || 'NEW'
      acc[status.toLowerCase() as keyof typeof acc] = (acc[status.toLowerCase() as keyof typeof acc] || 0) + 1
      return acc
    }, {
      all: leads.value.length,
      new: 0,
      contacted: 0,
      qualified: 0,
      converted: 0,
      lost: 0
    })
    counts.value = statusCounts
  }
}

// Handlers
const handleSelectLead = (lead: LeadDTO) => {
  selectLead(lead)

  // Marcar como lido automaticamente ao selecionar
  if (!lead.isRead) {
    leadService.markAsRead(lead.id).catch(console.error)
    lead.isRead = true
  }
}

const handleQuickAction = async (leadId: number, action: string) => {
  const lead = leads.value.find(l => l.id === leadId)
  if (!lead) return

  try {
    switch (action) {
      case 'mark-read':
        await leadService.markAsRead(leadId)
        lead.isRead = true
        break
      case 'call':
        if (lead.phone) {
          window.open(`tel:${lead.phone}`, '_blank')
        }
        break
      case 'email':
        if (lead.email) {
          window.open(`mailto:${lead.email}`, '_blank')
        }
        break
    }
  } catch (error) {
    console.error('Erro ao executar ação:', error)
  }
}

const handleConvert = async () => {
  if (!selectedLead.value) return

  try {
    await leadService.convertToCustomer(selectedLead.value.id)
    selectedLead.value.status = 'CONVERTED'
    await fetchCounts()
    notification.success('Lead convertido em cliente com sucesso!')
  } catch (error) {
    console.error('Erro ao converter lead:', error)
    notification.error('Erro ao converter lead. Tente novamente.')
  }
}

const handleMarkContacted = async () => {
  if (!selectedLead.value) return

  try {
    await leadService.updateStatus(selectedLead.value.id, 'CONTACTED')
    selectedLead.value.status = 'CONTACTED'
    await fetchCounts()
    notification.success('Lead marcado como contatado')
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    notification.error('Erro ao atualizar status do lead')
  }
}

const handleMarkQualified = async () => {
  if (!selectedLead.value) return

  try {
    await leadService.updateStatus(selectedLead.value.id, 'QUALIFIED')
    selectedLead.value.status = 'QUALIFIED'
    await fetchCounts()
    notification.success('Lead marcado como qualificado')
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    notification.error('Erro ao atualizar status do lead')
  }
}

const handleMarkLost = async () => {
  if (!selectedLead.value) return

  // Usar notificação de confirmação ao invés de confirm nativo
  const confirmLost = confirm('Tem certeza que deseja marcar este lead como perdido?')
  if (!confirmLost) return

  try {
    await leadService.updateStatus(selectedLead.value.id, 'LOST')
    selectedLead.value.status = 'LOST'
    await fetchCounts()
    notification.warning('Lead marcado como perdido')
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    notification.error('Erro ao atualizar status do lead')
  }
}

const handleOpenWhatsapp = () => {
  if (!selectedLead.value?.phone) return
  const phone = selectedLead.value.phone.replace(/\D/g, '')
  window.open(`https://wa.me/55${phone}`, '_blank')
}

const handleSendEmail = () => {
  if (!selectedLead.value?.email) return
  window.open(`mailto:${selectedLead.value.email}`, '_blank')
}

const clearFilters = () => {
  search.value = ''
  statusFilter.value = 'all'
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchLeads()
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchLeads()
}

// Keyboard shortcuts
useLeadKeyboard({
  onNext: selectNext,
  onPrevious: selectPrevious,
  onMarkRead: () => {
    if (selectedLead.value && !selectedLead.value.isRead) {
      leadService.markAsRead(selectedLead.value.id)
      selectedLead.value.isRead = true
    }
  },
  onConvert: handleConvert,
  onEmail: handleSendEmail,
  onWhatsapp: handleOpenWhatsapp,
  onShowNew: () => statusFilter.value = 'NEW',
  onShowAll: () => statusFilter.value = 'all',
  onShowQualified: () => statusFilter.value = 'QUALIFIED'
})

// Watch for filter changes
watch([search, statusFilter], () => {
  // Reset para primeira página quando filtrar
  if (currentPage.value !== 1) {
    currentPage.value = 1
  }
})

// Init
onMounted(async () => {
  await fetchLeads()
  await fetchCounts()
})
</script>

<style scoped>
/* Animações já estão no Tailwind */
</style>
