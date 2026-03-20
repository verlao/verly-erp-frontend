<template>
  <div>
    <!-- Header inline (padrão do projeto) -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Leads</h1>
        <p class="text-sm text-muted-foreground mt-1">Gerencie leads e converta em clientes</p>
      </div>

      <!-- Ações em lote -->
      <div v-if="checkedIds.length > 0" class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">{{ checkedIds.length }} selecionado(s)</span>
        <Button variant="outline" size="sm" @click="clearSelection">
          Limpar Seleção
        </Button>
      </div>
    </div>

    <!-- Filtros inline -->
    <LeadFilters
      v-model:search="search"
      v-model:status-filter="statusFilter"
      :counts="counts"
      @clear="clearFilters"
    />

    <!-- Conteúdo Principal: Card com Split View -->
    <div class="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <!-- Desktop: Split View -->
      <div class="hidden md:flex" style="height: calc(100vh - 360px)">
        <!-- Lista Leads (40%) -->
        <div class="w-2/5 border-r border-border overflow-y-auto">
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

        <!-- Preview (60%) -->
        <div class="flex-1 overflow-y-auto bg-muted/30">
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

      <!-- Mobile: Lista Only -->
      <div class="md:hidden max-h-[600px] overflow-y-auto">
        <LeadList
          :leads="filteredLeads"
          :selected-id="selectedId"
          :checked-ids="checkedIds"
          :loading="loading"
          @select="openMobilePreview"
          @toggle="toggleCheck"
          @toggle-all="toggleAll"
        />
      </div>
    </div>

    <!-- Paginação -->
    <div v-if="totalPages > 1" class="mt-4 flex justify-center">
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-items="totalItems"
        :page-size="pageSize"
        @page-changed="handlePageChange"
        @page-size-changed="handlePageSizeChange"
      />
    </div>

    <!-- Mobile: Dialog Preview -->
    <Dialog v-model:open="showMobilePreview">
      <DialogHeader class="relative">
        <DialogTitle>{{ selectedLead?.name || 'Detalhes do Lead' }}</DialogTitle>
        <DialogClose @click="showMobilePreview = false" />
      </DialogHeader>
      <DialogContent>
        <LeadPreview
          v-if="selectedLead"
          :lead="selectedLead"
          :is-mobile="true"
          @convert="handleConvert"
          @mark-contacted="handleMarkContacted"
          @mark-qualified="handleMarkQualified"
          @mark-lost="handleMarkLost"
          @open-whatsapp="handleOpenWhatsapp"
          @send-email="handleSendEmail"
        />
      </DialogContent>
    </Dialog>
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
import Button from '../components/ui/Button.vue'
import Dialog from '../components/ui/Dialog.vue'
import DialogHeader from '../components/ui/DialogHeader.vue'
import DialogContent from '../components/ui/DialogContent.vue'
import DialogTitle from '../components/ui/DialogTitle.vue'
import DialogClose from '../components/ui/DialogClose.vue'
import leadService from '../services/lead'
import type { LeadDTO, PaginatedResponse } from '../services/lead'
import { useLeadSelection } from '../composables/useLeadSelection'
import { useLeadKeyboard } from '../composables/useLeadKeyboard'

// Notification store
const notification = useNotificationStore()

// State
const leads = ref<LeadDTO[]>([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref('all')
const showMobilePreview = ref(false)
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
  clearSelection,
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

const openMobilePreview = (lead: LeadDTO) => {
  selectLead(lead)
  showMobilePreview.value = true

  // Marcar como lido
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
    if (isMobile.value) {
      showMobilePreview.value = false
    }
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

  const confirmLost = confirm('Tem certeza que deseja marcar este lead como perdido?')
  if (!confirmLost) return

  try {
    await leadService.updateStatus(selectedLead.value.id, 'LOST')
    selectedLead.value.status = 'LOST'
    await fetchCounts()
    notification.warning('Lead marcado como perdido')
    if (isMobile.value) {
      showMobilePreview.value = false
    }
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
  onOpen: () => {
    if (isMobile.value && selectedLead.value) {
      showMobilePreview.value = true
    }
  },
  onClose: () => {
    if (isMobile.value) {
      showMobilePreview.value = false
    }
  },
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
