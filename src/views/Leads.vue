<template>
  <div class="flex flex-col md:flex-1 md:min-h-0">
    <!-- Ações em lote: só ocupa espaço quando há seleção -->
    <div v-if="checkedIds.length > 0" class="flex items-center justify-end gap-2 mb-3 shrink-0">
      <span class="text-sm text-muted-foreground">{{ checkedIds.length }} selecionado(s)</span>
      <Button variant="outline" size="sm" @click="clearSelection">
        Limpar Seleção
      </Button>
    </div>

    <!-- Toolbar: busca + CTA principal -->
    <LeadsToolbar
      v-model:search="search"
      :has-active-filters="hasActiveFilters"
      class="mb-3 shrink-0"
      @clear="clearFilters"
    />

    <!-- Escopo explícito da busca: roda só sobre os leads já carregados (client-side),
         não sobre o banco inteiro — /leads/paginated não aceita parâmetro de busca.
         Com scroll infinito `leads` é o ACUMULADO das páginas buscadas até agora,
         não "esta página" — por isso o texto fala em "carregados até agora". -->
    <p v-if="search" class="-mt-2 mb-3 shrink-0 text-[11px] text-muted-foreground">
      Busca restrita aos {{ leads.length }} leads carregados até agora — não busca no servidor.
    </p>

    <!-- Degradação: só aparece quando /leads/counts ou /leads/paginated falham.
         Com o backend saudável isto nunca renderiza. -->
    <div
      v-if="countsUnavailable || countsStale || leadsDegraded || loadMoreFailed"
      class="mb-3 shrink-0 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning flex flex-col gap-1"
      role="status"
    >
      <!-- Primeira leitura de /leads/counts falhou: não existe "último valor
           válido", só o zero do estado inicial. O texto não pode prometer um
           valor que nunca chegou, e a stats strip fica fora da tela. -->
      <div v-if="countsUnavailable" class="flex items-center gap-1.5">
        <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
        Contadores indisponíveis — o servidor não respondeu os números. Os totais do funil ficam ocultos até ele responder.
      </div>
      <div v-else-if="countsStale" class="flex items-center gap-1.5">
        <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
        Contadores desatualizados — o servidor não confirmou os números (mostrando o último valor válido).
      </div>
      <div v-if="leadsDegraded" class="flex items-center gap-1.5">
        <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
        Paginação indisponível — a lista pode estar incompleta ou fora da ordem de prioridade.
      </div>
      <!-- Causa distinta da de cima: a paginação funciona, uma página só não
           veio. A lista está incompleta, mas na ordem certa. -->
      <div v-if="loadMoreFailed" class="flex items-center gap-1.5">
        <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
        Uma página de leads não carregou — a lista está incompleta. Use “tentar de novo” no fim da lista.
      </div>
    </div>

    <!-- Stats strip compacta. Escondida quando /leads/counts nunca respondeu:
         todo número dela (Novos, Conv., pipeline) sairia do zero inicial ou da
         página carregada, e zero é um valor de negócio plausível — seria lido
         como verdade. -->
    <LeadStats v-if="!countsUnavailable" :leads="leads" :counts="counts" :loading="loading" class="mb-3 shrink-0" />

    <!-- Filtros inline -->
    <LeadFilters
      v-model:status-filter="statusFilter"
      v-model:tier-filter="tierFilter"
      :counts="counts"
      :paid-count="paidCount"
    />

    <!-- Conteúdo Principal: Card com Split View -->
    <div class="bg-card rounded-lg shadow-sm border border-border overflow-hidden md:flex-1 md:min-h-0 md:flex md:flex-col">
      <!-- Desktop: Split View -->
      <div class="hidden md:flex flex-1 min-h-0">
        <!-- Lista Leads (40%) — este painel é o root do observer do desktop -->
        <div ref="leadListPanel" class="w-2/5 border-r border-border overflow-y-auto">
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

          <!-- Sentinela de scroll infinito (desktop): este painel rola sozinho
               (overflow-y-auto), então a sentinela vive dentro dele, não na página. -->
          <div ref="loadMoreSentinelDesktop" class="h-px"></div>
          <div v-if="loadingMore" class="p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <svg class="animate-spin h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Carregando mais...
          </div>
          <!-- "Carregar mais" falhou: nada foi anexado, a geometria não muda e o
               IntersectionObserver não reentrega o callback. Sem este bloco o
               usuário vê um toast de 5s e depois nada, sem retry. -->
          <div v-else-if="loadMoreFailed" class="p-4 flex flex-col items-center gap-2 text-center">
            <p class="text-xs text-warning">Não foi possível carregar mais leads.</p>
            <Button variant="outline" size="sm" @click="loadMore">Tentar de novo</Button>
          </div>
          <!-- Com filtro ativo o auto-load fica desligado (ver autoLoadMore) —
               então o carregamento precisa ter um caminho manual. -->
          <div v-else-if="hasMore && hasActiveFilters" class="p-4 flex flex-col items-center gap-2 text-center">
            <p class="text-xs text-muted-foreground">Com filtro ativo, as próximas páginas não carregam sozinhas.</p>
            <Button variant="outline" size="sm" @click="loadMore">Carregar mais leads</Button>
          </div>
          <div
            v-else-if="!hasMore && filteredLeads.length > 0"
            class="p-4 text-center text-xs text-muted-foreground"
          >
            Todos os leads carregados
          </div>
        </div>

        <!-- Preview (60%) — command center quando nada selecionado -->
        <div class="flex-1 min-w-0 overflow-hidden bg-muted/30">
          <LeadsOverview
            v-if="!selectedLead"
            :leads="leads"
            :counts="counts"
            @select="handleSelectLead"
          />
          <LeadPreview
            v-else
            :lead="selectedLead"
            :duplicates="selectedLeadDuplicates"
            @select-duplicate="handleSelectLead"
            @convert="handleConvert"
            @mark-contacted="handleMarkContacted"
            @mark-qualified="handleMarkQualified"
            @mark-lost="handleMarkLost"
            @open-whatsapp="handleOpenWhatsapp"
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
        <div v-else-if="loadMoreFailed" class="p-4 flex flex-col items-center gap-2 text-center">
          <p class="text-xs text-warning">Não foi possível carregar mais leads.</p>
          <Button variant="outline" size="sm" @click="loadMore">Tentar de novo</Button>
        </div>
        <div v-else-if="hasMore && hasActiveFilters" class="p-4 flex flex-col items-center gap-2 text-center">
          <p class="text-xs text-muted-foreground">Com filtro ativo, as próximas páginas não carregam sozinhas.</p>
          <Button variant="outline" size="sm" @click="loadMore">Carregar mais leads</Button>
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
                  :duplicates="selectedLeadDuplicates"
                  @select-duplicate="handleSelectLead"
                  @convert="handleConvert"
                  @mark-contacted="handleMarkContacted"
                  @mark-qualified="handleMarkQualified"
                  @mark-lost="handleMarkLost"
                  @open-whatsapp="handleOpenWhatsapp"
                />
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <DeleteConfirmDialog
      :open="showMarkLostModal"
      overlay-z-class="z-[65]"
      title="Marcar lead como perdido"
      message="Tem certeza que deseja marcar este lead como perdido?"
      :item-name="selectedLead?.name ?? ''"
      warning="Esta ação pode ser revertida alterando o status do lead."
      confirm-text="Marcar como Perdido"
      @update:open="showMarkLostModal = $event"
      @confirm="confirmMarkLost"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWindowSize, useIntersectionObserver, useWindowScroll } from '@vueuse/core'
import { AlertTriangle } from 'lucide-vue-next'
import { useNotificationStore } from '../stores/notification'
import LeadList from '../components/leads/LeadList.vue'
import LeadPreview from '../components/leads/LeadPreview.vue'
import LeadsOverview from '../components/leads/LeadsOverview.vue'
import LeadFilters from '../components/leads/LeadFilters.vue'
import LeadsToolbar from '../components/leads/LeadsToolbar.vue'
import LeadStats from '../components/leads/LeadStats.vue'
import DeleteConfirmDialog from '../components/DeleteConfirmDialog.vue'
import Button from '../components/ui/Button.vue'
import leadService from '../services/lead'
import type { LeadCounts, LeadDTO, LeadStatus, PaginatedResponse } from '../services/lead'
import { isSyntheticEmail } from '../lib/leadContact'
import { reconcileLeadList } from '../lib/leadConfirmation'
import { buildWhatsAppUrl } from '../lib/whatsapp'
import { shouldMarkContactedOnWhatsapp } from '../lib/leadStatus'
import { useLeadSelection } from '../composables/useLeadSelection'
import { activeDuplicatesOf, isPaymentAwaitingReceipt } from '../composables/useLeadSignals'
import { useLeadKeyboard } from '../composables/useLeadKeyboard'
import { useCelebration } from '../composables/useCelebration'

const { celebrate } = useCelebration()
const router = useRouter()

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
const counts = ref<LeadCounts>({
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

// Degradação: true quando /leads/paginated falha e caímos pro fallback não
// paginado. A lista continua aparecendo, mas pode estar incompleta e fora da
// ordem de prioridade — por isso isso precisa ficar visível, não calado.
const leadsDegraded = ref(false)
// Causa DISTINTA de leadsDegraded: a paginação funciona, uma página só não
// veio. A lista fica incompleta mas na ordem certa, e o retry é por página —
// misturar as duas na mesma flag faz o banner descrever a falha errada.
const loadMoreFailed = ref(false)
// true depois da PRIMEIRA resposta de /leads/counts. Antes disso `counts` é o
// zero do estado inicial: não é um valor velho, é a ausência de valor. Sem
// essa distinção o banner de "último valor válido" afirma algo que não existe.
const countsLoaded = ref(false)
// Degradação: /leads/counts falhou DEPOIS de ter respondido ao menos uma vez.
// Os `counts` ficam congelados no último valor válido (NUNCA recalculados a
// partir de `leads.value`, que é só o acumulado carregado e mentiria pro dono).
const countsStale = ref(false)
// Degradação: /leads/counts nunca respondeu. Não há número nenhum pra mostrar,
// então nenhum número vai pra tela (a stats strip fica oculta).
const countsUnavailable = ref(false)

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

// Fila "💰 Pagos": pagamento sinalizado sem comprovante (calculado client-side).
const paidCount = computed(() => leads.value.filter(isPaymentAwaitingReceipt).length)

// Duplicatas ativas do lead selecionado (mesmo telefone, status não-terminal).
const selectedLeadDuplicates = computed(() => activeDuplicatesOf(leads.value, selectedLead.value))

// Botão "limpar filtros" na toolbar aparece se qualquer filtro estiver ativo.
const hasActiveFilters = computed(() =>
  Boolean(search.value || statusFilter.value !== 'all' || tierFilter.value !== 'all')
)

// Sentinela do scroll infinito (mobile e desktop). Só uma fica no DOM visível
// por vez (as duas seções são `md:hidden` / `hidden md:flex`), então nunca
// disparam as duas juntas.
const loadMoreSentinel = ref<HTMLElement | null>(null)
const loadMoreSentinelDesktop = ref<HTMLElement | null>(null)
// Painel de lista do desktop: é ELE que rola (overflow-y-auto), não a página.
const leadListPanel = ref<HTMLElement | null>(null)

async function loadMore() {
  if (loading.value || loadingMore.value || !hasMore.value) return
  try {
    loadingMore.value = true
    loadMoreFailed.value = false
    currentPage.value++
    await fetchLeads(true)
  } finally {
    loadingMore.value = false
  }
}

// Auto-load só sem filtro ativo. Com filtro, a lista filtrada pode ser curta o
// bastante pra sentinela já estar dentro do root na PRIMEIRA medição (ainda mais
// com rootMargin de 200px): o observer dispararia página após página sem o
// usuário rolar nada, exatamente quando ele está tentando estreitar a lista.
// Nesse caso o carregamento vira manual (botão no fim da lista).
// Também não re-dispara depois de uma falha — quem decide o retry é o usuário.
function autoLoadMore() {
  if (hasActiveFilters.value || loadMoreFailed.value) return
  loadMore()
}

// Dispara o carregamento da próxima página quando a sentinela entra na viewport.
// Aqui o root É a viewport: no mobile quem rola é a página.
useIntersectionObserver(
  loadMoreSentinel,
  ([entry]) => {
    if (entry?.isIntersecting) autoLoadMore()
  },
  { rootMargin: '200px' }
)

// Mesmo gatilho, agora para o painel de lista do desktop (antes preso na página 1).
// `root` precisa ser o painel: sem ele a interseção é medida contra a janela, e
// não contra o container que o usuário rola.
useIntersectionObserver(
  loadMoreSentinelDesktop,
  ([entry]) => {
    if (entry?.isIntersecting) autoLoadMore()
  },
  { root: leadListPanel, rootMargin: '200px' }
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

  // Status filter — 'PAID' é a fila virtual de pagamento sinalizado sem comprovante
  if (statusFilter.value === 'PAID') {
    filtered = filtered.filter(lead => isPaymentAwaitingReceipt(lead))
  } else if (statusFilter.value !== 'all') {
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
      const reconciled = reconcileLeadList(leads.value, response.content)
      leads.value = append ? [...leads.value, ...reconciled] : reconciled
      totalItems.value = response.totalElements
      totalPages.value = response.totalPages
      leadsDegraded.value = false
    } else if (!append) {
      // Resposta sem `content`: backend respondeu, só que num formato não-paginado
      // (compat). Não é o caminho de erro — não sinaliza degradação.
      const fallbackResponse = await leadService.getAllNonPaginated()
      leads.value = Array.isArray(fallbackResponse)
        ? reconcileLeadList(leads.value, fallbackResponse)
        : leads.value
      totalItems.value = leads.value.length
      totalPages.value = 1
    }
  } catch (error) {
    console.error('Erro ao carregar leads:', error)
    if (append) {
      // "Carregar mais" falhou: desfaz o avanço otimista de página (feito em
      // loadMore antes do await) pra não travar hasMore num estado inconsistente,
      // e avisa — em vez de deixar o usuário rolando sem nunca ver mais nada.
      currentPage.value--
      // NÃO é leadsDegraded: a paginação está de pé, só esta página falhou.
      loadMoreFailed.value = true
      notification.error('Não foi possível carregar mais leads. Tente novamente.')
    } else {
      try {
        const fallbackResponse = await leadService.getAllNonPaginated()
        if (Array.isArray(fallbackResponse)) {
          leads.value = reconcileLeadList(leads.value, fallbackResponse)
        }
        totalItems.value = leads.value.length
        totalPages.value = 1
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError)
      }
      // `/leads/paginated` falhou e caímos pro fallback não-paginado: a lista
      // pode estar incompleta (o fallback tem seu próprio limite no backend) e
      // fora da ordem de prioridade. `totalPages = 1` aqui NÃO significa "isso
      // é tudo" — precisa ficar visível que é degradação, não fato.
      leadsDegraded.value = true
      notification.error('Paginação de leads indisponível. Mostrando lista sem paginação — pode estar incompleta.')
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
    countsLoaded.value = true
    countsStale.value = false
    countsUnavailable.value = false
  } catch (error) {
    // NÃO recalcular a partir de `leads.value`: isso é só o acumulado carregado
    // (múltiplos de 20 leads) e produziria um número plausível mas ERRADO — o
    // dono decidiria em cima dele sem saber que está olhando pra página, não pro
    // total.
    console.error('Erro ao carregar contadores:', error)
    if (countsLoaded.value) {
      // Existe um último valor válido: mantém e marca como possivelmente velho.
      countsStale.value = true
      notification.error('Não foi possível atualizar os contadores. Os números exibidos podem estar desatualizados.')
    } else {
      // Primeira leitura: `counts` é o zero do estado inicial. Não há "último
      // valor válido" pra mostrar, e zero é um valor de negócio plausível —
      // seria lido como verdade. Então nenhum contador vai pra tela.
      countsUnavailable.value = true
      notification.error('Não foi possível carregar os contadores. Os totais do funil ficam indisponíveis até o servidor responder.')
    }
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
        if (lead.email && !isSyntheticEmail(lead.email)) {
          window.open(`mailto:${lead.email}`, '_blank')
        }
        break
      case 'review-extraction':
        await router.push(`/leads/${lead.id}/orcamento`)
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

const showMarkLostModal = ref(false)

const handleMarkLost = () => {
  if (!selectedLead.value) return
  showMarkLostModal.value = true
}

const confirmMarkLost = async () => {
  if (!selectedLead.value) return

  try {
    await leadService.updateStatus(selectedLead.value.id, 'LOST')
    selectedLead.value.status = 'LOST'
    await fetchCounts()
    notification.warning('Lead marcado como perdido')
    showMarkLostModal.value = false
    if (isMobile.value) {
      showMobilePreview.value = false
    }
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    notification.error('Erro ao atualizar status do lead')
  }
}

const contactingLeadIds = new Set<number>()

const handleOpenWhatsapp = (suggestedReply?: string) => {
  const lead = selectedLead.value
  if (!lead?.phone) return
  // A próxima pergunta vem pronta do backend e segue sem saudação. O CTA geral
  // continua usando a abertura comercial já existente.
  const message = suggestedReply ?? buildInitialContactMessage(lead)

  // Popup blocker: window.open MUST stay synchronous and BEFORE any await.
  // After an await the call is outside the user-gesture stack and browsers
  // silently block the popup — a worse regression than the funnel staying NEW.
  window.open(buildWhatsAppUrl(lead.phone, message), '_blank', 'noopener,noreferrer')

  if (!shouldMarkContactedOnWhatsapp(lead.status, contactingLeadIds.has(lead.id))) return

  contactingLeadIds.add(lead.id)
  const previousStatus = lead.status
  lead.status = 'CONTACTED'
  void persistContactedStatus(lead, previousStatus)
}

function buildInitialContactMessage(lead: LeadDTO): string {
  const firstName = (lead.name || '').trim().split(' ')[0] || ''
  const greeting = firstName ? `Olá ${firstName}! ` : 'Olá! '
  return (
    `${greeting}Aqui é da Verly Vidraçaria 👋 ` +
    'Recebemos seu contato sobre um orçamento e queremos te ajudar. ' +
    'Podemos falar sobre os detalhes?'
  )
}

async function persistContactedStatus(lead: LeadDTO, previousStatus: LeadStatus | undefined) {
  try {
    await leadService.updateStatusKeepalive(lead.id, 'CONTACTED')
    await fetchCounts()
    notification.success('Lead marcado como contatado')
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    lead.status = previousStatus
    notification.error('Erro ao atualizar status do lead')
  } finally {
    contactingLeadIds.delete(lead.id)
  }
}

const handleSendEmail = () => {
  if (!selectedLead.value?.email || isSyntheticEmail(selectedLead.value.email)) return
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

// Deep-link: /leads?leadId=X seleciona o lead (vindo do Financeiro/kanban).
// Se não está na página carregada, busca direto e insere no topo.
const route = useRoute()

async function applyLeadIdFromQuery() {
  const id = Number(route.query.leadId)
  if (!id) return
  let lead = leads.value.find(l => l.id === id)
  if (!lead) {
    try {
      lead = await leadService.getById(id)
      if (lead) leads.value.unshift(lead)
    } catch {
      return
    }
  }
  if (!lead) return
  selectLead(lead)
  if (isMobile.value) {
    showMobilePreview.value = true
  }
}

watch(() => route.query.leadId, applyLeadIdFromQuery)

// Init
onMounted(async () => {
  await fetchLeads()
  await fetchCounts()
  await applyLeadIdFromQuery()
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
