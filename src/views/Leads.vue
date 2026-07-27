<template>
  <div>
    <!-- Ações em lote: só ocupa espaço quando há seleção -->
    <div v-if="checkedIds.length > 0" class="flex items-center justify-end gap-2 mb-3">
      <span class="text-sm text-muted-foreground">{{ checkedIds.length }} selecionado(s)</span>
      <Button variant="outline" size="sm" @click="clearSelection">
        Limpar Seleção
      </Button>
    </div>

    <!-- Toolbar: busca + CTA principal -->
    <LeadsToolbar
      v-model:search="search"
      :has-active-filters="hasActiveFilters"
      class="mb-3"
      @clear="clearFilters"
    />

    <!-- Stats strip compacta -->
    <LeadStats :leads="leads" :counts="counts" :loading="loading" class="mb-3" />

    <!-- Filtros inline -->
    <LeadFilters
      v-model:status-filter="statusFilter"
      v-model:tier-filter="tierFilter"
      :counts="counts"
    />

    <!-- Conteúdo Principal: Card com Split View -->
    <div class="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <!-- Desktop: Split View -->
      <div class="hidden md:flex h-[max(420px,calc(100vh-22rem))]">
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

        <!-- Preview (60%) — command center quando nada selecionado -->
        <div class="flex-1 overflow-y-auto bg-muted/30">
          <LeadsOverview
            v-if="!selectedLead"
            :leads="leads"
            :counts="counts"
            @select="handleSelectLead"
          />
          <LeadPreview
            v-else
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

      <!-- Mobile: Lista Only (scroll infinito com a página) -->
      <div class="md:hidden">
        <LeadList
          :leads="filteredLeads"
          :selected-id="selectedId"
          :checked-ids="checkedIds"
          :loading="loading"
          @select="openMobilePreview"
          @toggle="toggleCheck"
          @toggle-all="toggleAll"
        />

        <!-- Sentinela de scroll infinito (mobile) -->
        <div ref="loadMoreSentinel" class="h-px"></div>
        <div v-if="loadingMore" class="p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <svg class="animate-spin h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Carregando mais...
        </div>
        <div
          v-else-if="!hasMore && filteredLeads.length > 0"
          class="p-4 text-center text-xs text-muted-foreground"
        >
          Todos os leads carregados
        </div>
      </div>
    </div>

    <!-- Voltar ao topo (mobile, no scroll infinito) -->
    <Transition name="fade">
      <button
        v-if="showBackToTop"
        @click="scrollToTop"
        class="fixed right-4 z-30 h-12 w-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
        style="bottom: calc(5rem + env(safe-area-inset-bottom))"
        aria-label="Voltar ao topo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
    </Transition>

    <!-- Mobile: Bottom Sheet Preview -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showMobilePreview"
          class="fixed inset-0 z-[60] bg-black/50 flex items-end md:hidden"
          @click="showMobilePreview = false"
        >
          <Transition
            enter-active-class="transition-transform duration-300 ease-out"
            enter-from-class="translate-y-full"
            enter-to-class="translate-y-0"
            leave-active-class="transition-transform duration-200 ease-in"
            leave-from-class="translate-y-0"
            leave-to-class="translate-y-full"
          >
            <div
              v-if="showMobilePreview"
              class="w-full bg-card rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
              @click.stop
            >
              <!-- Handle + close -->
              <div class="relative shrink-0 pt-2">
                <div class="mx-auto h-1.5 w-10 rounded-full bg-muted-foreground/30"></div>
                <button
                  type="button"
                  class="absolute right-2 top-1 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label="Fechar"
                  @click="showMobilePreview = false"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="flex-1 min-h-0 overflow-hidden">
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
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWindowSize, useIntersectionObserver, useWindowScroll } from '@vueuse/core'
import { useNotificationStore } from '../stores/notification'
import LeadList from '../components/leads/LeadList.vue'
import LeadPreview from '../components/leads/LeadPreview.vue'
import LeadsOverview from '../components/leads/LeadsOverview.vue'
import LeadFilters from '../components/leads/LeadFilters.vue'
import LeadsToolbar from '../components/leads/LeadsToolbar.vue'
import LeadStats from '../components/leads/LeadStats.vue'
import Button from '../components/ui/Button.vue'
import leadService from '../services/lead'
import type { LeadDTO, PaginatedResponse } from '../services/lead'
import { buildWhatsAppUrl } from '../lib/whatsapp'
import { useLeadSelection } from '../composables/useLeadSelection'
import { useLeadKeyboard } from '../composables/useLeadKeyboard'
import { useCelebration } from '../composables/useCelebration'

const { celebrate } = useCelebration()

// Notification store
const notification = useNotificationStore()

// State
const leads = ref<LeadDTO[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const search = ref('')
const statusFilter = ref('all')
const tierFilter = ref('all')
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

// Scroll infinito (mobile): há mais páginas pra carregar?
const hasMore = computed(() => currentPage.value < totalPages.value)

// Botão "limpar filtros" na toolbar aparece se qualquer filtro estiver ativo.
const hasActiveFilters = computed(() =>
  Boolean(search.value || statusFilter.value !== 'all' || tierFilter.value !== 'all')
)

// Sentinela do scroll infinito (mobile)
const loadMoreSentinel = ref<HTMLElement | null>(null)

async function loadMore() {
  if (loading.value || loadingMore.value || !hasMore.value) return
  try {
    loadingMore.value = true
    currentPage.value++
    await fetchLeads(true)
  } finally {
    loadingMore.value = false
  }
}

// Dispara o carregamento da próxima página quando a sentinela entra na
// viewport. Só relevante no mobile (a sentinela vive dentro do bloco md:hidden).
useIntersectionObserver(
  loadMoreSentinel,
  ([entry]) => {
    if (entry?.isIntersecting) loadMore()
  },
  { rootMargin: '200px' }
)

// Botão "voltar ao topo" (mobile): aparece depois de rolar um pouco
const { y } = useWindowScroll()
const showBackToTop = computed(() => isMobile.value && y.value > 500)
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Filtered leads
const filteredLeads = computed(() => {
  let filtered = leads.value

  // Status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(lead =>
      (lead.status || 'NEW') === statusFilter.value
    )
  }

  // V2_17: Tier filter ($ / $$ / $$$)
  if (tierFilter.value !== 'all') {
    filtered = filtered.filter(lead => lead.tier === tierFilter.value)
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

  // Ordenação de prioridade (tier→tempo) vem do BACKEND (/leads/paginated).
  return filtered
})

// Fetch leads.
// append=true acrescenta a página à lista (scroll infinito);
// append=false substitui (carga inicial e troca de filtros).
const fetchLeads = async (append = false) => {
  try {
    if (!append) loading.value = true
    const response: PaginatedResponse<LeadDTO> = await leadService.getAll({
      page: currentPage.value - 1,
      size: pageSize.value
      // sem sort explícito → backend ordena por prioridade (maior lucro → mais recente)
    })

    if (response && typeof response === 'object' && 'content' in response) {
      leads.value = append ? [...leads.value, ...response.content] : response.content
      totalItems.value = response.totalElements
      totalPages.value = response.totalPages
    } else if (!append) {
      const fallbackResponse = await leadService.getAllNonPaginated()
      leads.value = Array.isArray(fallbackResponse) ? fallbackResponse : []
      totalItems.value = leads.value.length
      totalPages.value = 1
    }
  } catch (error) {
    console.error('Erro ao carregar leads:', error)
    if (!append) {
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
  } finally {
    if (!append) loading.value = false
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
    const value = selectedLead.value.totalEstimatedValue
    selectedLead.value.status = 'CONVERTED'
    celebrate() // 🎉 momento de endorfina ao finalizar o lead
    await fetchCounts()
    notification.success(
      value
        ? `🎉 Lead fechado! +R$ ${value.toFixed(2).replace('.', ',')}`
        : 'Lead convertido em cliente com sucesso!'
    )
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
  const lead = selectedLead.value
  if (!lead?.phone) return
  // Abre a conversa já com uma saudação — 1 toque, sem fricção (platform-aware:
  // wa.me no mobile, web.whatsapp no desktop). Reutiliza lib/whatsapp.
  const firstName = (lead.name || '').trim().split(' ')[0] || ''
  const greeting = firstName ? `Olá ${firstName}! ` : 'Olá! '
  const message =
    `${greeting}Aqui é da Verly Vidraçaria 👋 ` +
    'Recebemos seu contato sobre um orçamento e queremos te ajudar. ' +
    'Podemos falar sobre os detalhes?'
  window.open(buildWhatsAppUrl(lead.phone, message), '_blank', 'noopener,noreferrer')
}

const handleSendEmail = () => {
  if (!selectedLead.value?.email) return
  window.open(`mailto:${selectedLead.value.email}`, '_blank')
}

const clearFilters = () => {
  search.value = ''
  statusFilter.value = 'all'
  tierFilter.value = 'all'
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

// Filtros são aplicados client-side sobre os leads já carregados
// (filteredLeads reage aos refs), então não há refetch nem reset de página aqui.

// Init
onMounted(async () => {
  await fetchLeads()
  await fetchCounts()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
