<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, HelpCircle, X, Search, ChevronDown, Check, ReceiptText, ExternalLink } from 'lucide-vue-next'
import { formatBRL } from '@/lib/money'
import ActionButton from '@/components/verly/ActionButton.vue'
import ChoiceChip from '@/components/verly/ChoiceChip.vue'
import StatusPill from '@/components/verly/StatusPill.vue'
import PieceDrawing from '@/components/verly/PieceDrawing.vue'
import UndoToast from '@/components/verly/UndoToast.vue'
import { usePreviewFinance } from './usePreviewFinance'
import { customers, partners } from './fixtures'

const finance = usePreviewFinance()
const { items, selected, selection, reviewing, query, editing, evidenceOpen, notice, summary, toasts, pendingIds, completed, canConfirm, missingReason, correctionRequired, searchResults } = finance
const dialog = ref<HTMLDialogElement | null>(null)
const previousFocus = ref<HTMLElement | null>(null)
const filter = ref('Todos')
const filters = ['Todos', 'Entradas', 'Saídas', 'Para conferir']
const purposeOptions = computed(() => selection.value.movement === 'in' ? ['Sinal', 'Pedido inteiro', 'Avulso'] : ['Combustível', 'Serviço', 'Materiais'])
const isOpen = computed(() => Boolean(selected.value))
const visibleItems = computed(() => items.value.filter(item => {
  if (pendingIds.value.has(item.id)) return false
  if (filter.value === 'Entradas') return item.movement === 'in'
  if (filter.value === 'Saídas') return item.movement === 'out'
  if (filter.value === 'Para conferir') return !completed.value.some(done => done.id === item.id)
  return true
}))
const monthCount = computed(() => visibleItems.value.filter(item => item.date.includes('2026-10')).length)
const beforeCount = computed(() => visibleItems.value.length - monthCount.value)
const filteredSearchResults = computed(() => searchResults.value.filter(result => selection.value.movement === 'out' ? result.kind === 'partner' : selection.value.movement === 'in' ? result.kind === 'customer' : true))
const drawerTitle = computed(() => selected.value?.movement === 'out' ? 'Conferir despesa' : 'Conferir recebimento')
const selectedCustomer = computed(() => customers.find(customer => customer.id === selection.value.customerId))
const selectedPartner = computed(() => partners.find(partner => partner.id === selection.value.partnerId))
const suggestionName = computed(() => selectedCustomer.value?.name || selectedPartner.value?.name || selected.value?.contact || 'destino escolhido')
const isPixDifference = computed(() => selected.value?.amountCents === 48000 && selection.value.purpose === 'Sinal' && selection.value.orderId === 1048)
const finalDestination = computed(() => {
  if (selection.value.movement === 'own') return 'Entre contas da loja · ainda para conferir'
  if (selection.value.movement === 'reference') return 'Guardado como referência'
  if (selection.value.movement === 'unknown') return 'Movimento classificado para conferência'
  if (selection.value.movement === 'in') return `${suggestionName.value}${selection.value.orderId ? ` · pedido #${selection.value.orderId}` : ''}${selection.value.purpose ? ` · ${selection.value.purpose.toLowerCase()}` : ''}`
  return `${suggestionName.value}${selection.value.purpose ? ` · ${selection.value.purpose.toLowerCase()}` : ''}`
})

watch(isOpen, async (open) => {
  if (open) {
    previousFocus.value = document.activeElement as HTMLElement
    await nextTick()
    if (dialog.value && !dialog.value.open) dialog.value.showModal()
    dialog.value?.querySelector<HTMLElement>('[data-dialog-close]')?.focus()
  } else if (dialog.value?.open) dialog.value.close()
})
function openItem(item: (typeof items.value)[number]) { previousFocus.value = document.activeElement as HTMLElement; finance.open(item) }
function handleClose() { finance.close(); nextTick(() => previousFocus.value?.focus()) }
function handleNativeClose() { if (selected.value) finance.close(); nextTick(() => previousFocus.value?.focus()) }
function accept() { finance.acceptSuggestion() }
function selectMovement(value: 'in' | 'out' | 'own' | 'reference') { finance.setMovement(value) }
function formatDate(value: string) { const [year, month, day] = value.split('-'); return `${Number(day)} ${['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][Number(month) - 1]} ${year}` }
function rowIcon(movement: string) { return movement === 'in' ? ArrowDownLeft : movement === 'out' ? ArrowUpRight : movement === 'own' ? ArrowLeftRight : HelpCircle }
function subtitleFor(item: (typeof items.value)[number]) {
  if (item.movement === 'own') return 'Entre contas da loja · ainda para conferir'
  return item.subtitle
}
function resultSelected(result: (typeof searchResults.value)[number]) {
  if (result.kind === 'customer') finance.selectCustomer(result.id)
  else finance.selectPartner(result.id)
  editing.value = false
  query.value = ''
}
function keyEscape(event: KeyboardEvent) { if (event.key === 'Escape' && selected.value) { event.preventDefault(); handleClose() } }
onBeforeUnmount(() => { if (dialog.value?.open) dialog.value.close() })
</script>

<template>
  <main class="finance-preview verly-surface" @keydown="keyEscape">
    <div class="preview-note"><span class="preview-dot" /> Prévia · dados de exemplo</div>
    <header class="page-heading">
      <div><p class="eyebrow">Controle da loja</p><h1>Financeiro</h1><p class="month-label">Outubro 2026 <ChevronDown :size="18" aria-hidden="true" /></p></div>
    </header>

    <section class="summary-grid" aria-label="Resumo do mês">
      <article class="summary-card"><span>Entrou</span><strong>{{ formatBRL(summary.inCents) }}</strong><small>neste mês</small></article>
      <article class="summary-card"><span>Saiu</span><strong>{{ formatBRL(summary.outCents) }}</strong><small>neste mês</small></article>
      <article class="summary-card summary-balance"><span>Saldo</span><strong>{{ formatBRL(summary.balanceCents) }}</strong><small>neste mês</small></article>
    </section>

    <section class="queue-section" aria-labelledby="queue-title">
      <div class="queue-heading"><div><p class="eyebrow">Movimentos</p><h2 id="queue-title">Para confirmar</h2></div><div class="count-label"><strong>{{ monthCount }}</strong> deste mês<span v-if="beforeCount"> + {{ beforeCount }} antes</span></div></div>
      <div class="filter-row" role="group" aria-label="Filtrar movimentos">
        <button v-for="option in filters" :key="option" type="button" class="filter-chip" :class="{ active: filter === option }" :aria-pressed="filter === option" @click="filter = option">{{ option }}</button>
      </div>
      <div class="movement-list">
        <button v-for="item in visibleItems" :key="item.id" type="button" class="movement-row" @click="openItem(item)" :aria-label="`${item.title}, ${formatBRL(item.amountCents)}. Abrir para conferir.`">
          <span v-if="item.widthCm && item.heightCm" class="row-piece" aria-hidden="true"><PieceDrawing :width-cm="item.widthCm" :height-cm="item.heightCm" :label="item.title"/></span>
          <span v-else class="movement-icon" :class="`movement-${item.movement}`"><component :is="rowIcon(item.movement)" :size="20" :stroke-width="2" aria-hidden="true" /></span>
          <span class="row-main"><span class="row-title">{{ item.title }}</span><span class="row-subtitle">{{ subtitleFor(item) }}</span><span v-if="item.widthCm && item.heightCm" class="row-dimensions">{{ item.widthCm }} × {{ item.heightCm }} cm</span></span>
          <span class="row-meta"><time>{{ formatDate(item.date) }}</time><strong class="amount" :class="{ muted: item.movement === 'unknown' || item.movement === 'own' }">{{ formatBRL(item.amountCents) }}</strong><StatusPill tone="neutral">{{ item.movement === 'unknown' ? 'Conferir' : 'Pendente' }}</StatusPill></span>
          <span class="row-chevron" aria-hidden="true">›</span>
        </button>
        <p v-if="!visibleItems.length" class="empty-state">Nenhum movimento neste filtro.</p>
      </div>
      <section v-if="completed.length" class="completed-list" aria-label="Movimentos conferidos"><h3>Conferidos</h3><div v-for="done in completed" :key="done.id" class="completed-row"><Check :size="17" aria-hidden="true"/><span>{{ done.text }}</span></div></section>
    </section>

    <dialog ref="dialog" class="review-dialog" aria-labelledby="drawer-title" @close="handleNativeClose">
      <div v-if="selected" class="drawer-shell">
        <header class="drawer-header"><div><p class="eyebrow">Conferência do movimento</p><h2 id="drawer-title">{{ drawerTitle }}</h2></div><button data-dialog-close class="icon-button" type="button" aria-label="Fechar conferência" @click="handleClose"><X :size="22" /></button></header>
        <div class="drawer-scroll">
          <div class="amount-panel"><strong class="drawer-amount">{{ formatBRL(selected.amountCents) }}</strong><span>{{ formatDate(selected.date) }} · {{ selected.title }}</span><span v-if="selected.movement === 'unknown'" class="unknown-message">Precisamos conferir o movimento</span></div>

          <div v-if="selected.widthCm && selected.heightCm" class="piece-preview"><PieceDrawing :width-cm="selected.widthCm" :height-cm="selected.heightCm" :label="selected.title" /></div>

          <section v-if="selected.movement === 'unknown'" class="drawer-section"><h3>Como classificar?</h3><div class="chips"><ChoiceChip :selected="selection.movement === 'in'" @update:selected="selectMovement('in')">Entrada</ChoiceChip><ChoiceChip :selected="selection.movement === 'out'" @update:selected="selectMovement('out')">Saída</ChoiceChip></div></section>
          <section v-if="selected.movement === 'own'" class="own-callout"><ArrowLeftRight :size="19"/><div><strong>Entre contas da loja · ainda para conferir</strong><p>Essa transferência não entra como receita nem como despesa.</p></div></section>
          <section v-if="selected.movement === 'reference'" class="drawer-section reference-callout"><ReceiptText :size="19"/><div><strong>Referência</strong><p>Este comprovante não altera o financeiro.</p></div></section>

            <template v-if="selection.movement === 'in' || selection.movement === 'out'">
            <section v-if="selected.movement !== 'unknown' && !editing" class="suggestion-card"><div class="suggestion-top"><span class="suggestion-label">Nossa sugestão</span><StatusPill tone="neutral">Confira antes de salvar</StatusPill></div><p class="suggestion-sentence">{{ selection.movement === 'in' ? 'Cliente do pagamento:' : 'Recebedor da despesa:' }} <strong>{{ suggestionName }}</strong><template v-if="selection.purpose"> · {{ selection.purpose.toLowerCase() }}</template><template v-if="selection.orderId"> · pedido #{{ selection.orderId }}</template></p><p class="suggestion-why">{{ selected.subtitle }}</p><ActionButton variant="secondary" class="accept-button" @click="accept"><Check :size="17"/> Conferir sugestão</ActionButton></section>
            <div v-else-if="editing || (selected.movement === 'unknown' && !selection.customerId && !selection.partnerId)" class="search-panel"><label for="destination-search">{{ selected.movement === 'unknown' ? 'Quem pagou ou recebeu?' : 'Escolher outro destino' }}</label><div class="search-box"><Search :size="18"/><input id="destination-search" v-model="query" type="search" autocomplete="off" placeholder="Nome ou telefone" /></div><p class="search-help">Buscamos clientes e fornecedores pelo nome ou telefone.</p><div v-if="filteredSearchResults.length" class="search-results"><button v-for="result in filteredSearchResults" :key="`${result.kind}-${result.id}`" type="button" @click="resultSelected(result)"><span>{{ result.label }}</span><small>{{ result.detail }} · {{ result.kind === 'customer' ? 'Cliente' : 'Fornecedor' }}</small></button></div><p v-else-if="query" class="search-empty">Nenhum resultado. Você ainda pode escolher uma categoria.</p><ActionButton v-if="editing" variant="secondary" @click="editing = false">Voltar à sugestão</ActionButton></div>

            <section v-if="selection.movement === 'in' || selection.movement === 'out'" class="drawer-section"><h3>{{ selection.movement === 'in' ? 'Categoria do recebimento' : 'Categoria da despesa' }}</h3><div class="chips"><ChoiceChip v-for="purpose in purposeOptions" :key="purpose" :selected="selection.purpose === purpose" @update:selected="finance.setPurpose(purpose)">{{ purpose }}</ChoiceChip></div></section>
            <section v-if="selection.movement === 'in'" class="drawer-section"><label class="field-label" for="order-select">Pedido relacionado</label><select id="order-select" :value="selection.orderId ?? ''" @change="finance.setOrder(($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null)"><option value="">Sem pedido</option><option v-for="customer in customers.filter(customer => !selection.customerId || customer.id === selection.customerId)" :key="customer.id" :value="customer.orderId">Pedido #{{ customer.orderId }} · {{ customer.name }}</option></select><p class="field-hint">A sugestão usa o cliente e o pedido que aparecem no movimento.</p><p v-if="isPixDifference" class="difference-note">O Pix de {{ formatBRL(selected.amountCents) }} é maior que o sinal previsto de R$ 380,00. O valor recebido continua {{ formatBRL(selected.amountCents) }}.</p></section>
            </template>

          <section v-if="selection.movement === 'unknown' || editing || correctionRequired" class="drawer-section"><label class="field-label" for="reason-input">{{ selection.movement === 'unknown' ? 'Motivo da conferência' : 'Por que mudou o destino?' }}</label><textarea id="reason-input" v-model="selection.reason" rows="2" placeholder="Conte em poucas palavras"></textarea><p v-if="missingReason" class="field-hint">{{ missingReason }}</p></section>

          <details class="evidence-details" :open="evidenceOpen" @toggle="evidenceOpen = ($event.target as HTMLDetailsElement).open"><summary><span>Por que sugerimos isso?</span><ChevronDown :size="18" /></summary><div class="evidence-content"><p><strong>Pagador</strong><span>{{ selected.payer || 'Não identificado' }}</span></p><p><strong>Recebedor</strong><span>{{ selected.payee || 'Não identificado' }}</span></p><p><strong>Conversa</strong><span>“{{ selected.evidence.conversation }}”</span></p><p><strong>Comprovante</strong><span>{{ selected.evidence.receipt }}</span></p><p><strong>Dados de apoio</strong><span>{{ selected.evidence.support }}</span></p><p v-if="selected.evidence.warning" class="evidence-warning"><strong>Diferença para conferir</strong><span>{{ selected.evidence.warning }}</span></p></div></details>
        </div>
        <footer class="drawer-footer">
          <template v-if="selection.movement === 'own'"><p class="destination-summary">{{ finalDestination }}</p><ActionButton variant="secondary" @click="finance.defer()">Deixar para depois</ActionButton></template>
          <template v-else-if="selection.movement === 'reference'"><ActionButton variant="secondary" @click="finance.markReference()">Guardar como referência</ActionButton></template>
          <template v-else><p class="destination-summary">{{ finalDestination }}</p><div class="footer-actions"><button v-if="selection.movement !== 'unknown'" class="text-action" type="button" @click="editing = true">Escolher outro</button><ActionButton :disabled="!canConfirm" :disabled-reason="canConfirm ? undefined : missingReason || 'Confira a sugestão para continuar.'" @click="finance.confirm()">Confirmar {{ formatBRL(selected.amountCents) }}</ActionButton></div><p v-if="notice" class="notice-text" role="status">{{ notice }}</p></template>
        </footer>
      </div>
    </dialog>

    <div class="toast-stack" aria-live="polite"><UndoToast v-for="toast in toasts" :key="toast.id" :message="toast.message" :pending="toast.state === 'pending'" :error="toast.error" @undo="finance.undo(toast.id)" @dismiss="finance.dismissError(toast.id)" /></div>
  </main>
</template>

<style scoped>
.finance-preview { min-height: 100%; padding: 20px clamp(18px, 3vw, 38px) 36px; color: var(--color-verly-ink); }
.preview-note { display: inline-flex; align-items: center; gap: 8px; padding: 5px 10px; border: 1px solid #d6ddda; border-radius: 999px; color: #46524f; background: #f7f8f7; font-size: 15px; line-height: 1.25; }
.preview-dot { width: 8px; height: 8px; border-radius: 50%; background: #788581; }
.page-heading { display: flex; align-items: end; justify-content: space-between; margin: 23px 0 20px; }
.eyebrow { margin: 0 0 5px; color: #5c6966; font-size:15px; font-weight: 600; letter-spacing: .08em; line-height: 1.3; }
h1,h2,h3 { margin: 0; font-family: var(--font-verly-display); font-weight: 600; }
h1 { font-size: clamp(30px, 4vw, 38px); line-height: 1.08; }
.month-label { display: flex; align-items: center; gap: 7px; margin: 10px 0 0; color: #47534f; font-size: 17px; }
.summary-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 14px; max-width: 900px; }
.summary-card { display: flex; min-height: 110px; flex-direction: column; align-items: flex-start; justify-content: center; padding: 16px 18px; border: 1px solid #dce2df; border-radius: 14px; background: #fff; }
.summary-card span { color: #52605d; font-size: 15px; }
.summary-card strong { margin: 4px 0 1px; color: #141a1f; font: 600 clamp(20px,2.7vw,26px)/1.2 var(--font-verly-mono); }
.summary-card small { color: #66716e; font-size:15px; }
.queue-section { max-width: 1120px; margin-top: 32px; }
.queue-heading { display: flex; align-items: end; justify-content: space-between; margin-bottom: 15px; }
.queue-heading h2 { font-size: 25px; line-height: 1.15; }
.count-label { color: #586461; font-size: 15px; }.count-label strong { color: var(--color-verly-ink); font: 600 16px var(--font-verly-mono); }
.filter-row { display: flex; gap: 8px; overflow-x: auto; padding: 2px 1px 10px; }
.filter-chip { min-height:44px; padding: 7px 14px; border: 1px solid #cbd4d0; border-radius: 999px; background: #fff; color: #35413e; font: 400 15px var(--font-verly-body); white-space: nowrap; cursor: pointer; }
.filter-chip.active { border-color: #2e7d7a; background: #e4f1ef; color: #174b49; box-shadow: inset 0 0 0 1px #2e7d7a; }
.filter-chip:focus-visible,.movement-row:focus-visible,.text-action:focus-visible,.icon-button:focus-visible { outline: 3px solid #2e7d7a; outline-offset: 2px; }
.movement-list { display: grid; gap: 8px; }
.movement-row { display: grid; grid-template-columns: 50px minmax(130px,1fr) minmax(115px,auto) 18px; align-items: center; gap: 13px; min-height: 80px; padding: 12px 15px; border: 1px solid #dce2df; border-radius: 13px; background: #fff; text-align: left; cursor: pointer; transition: border-color .15s ease, box-shadow .15s ease; }
.movement-row:hover { border-color: #9bb7b2; box-shadow: 0 2px 10px #1825210d; }
.movement-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 12px; background: #edf0ef; color: #46534f; }
.row-piece { display: grid; width: 46px; height: 46px; place-items: center; overflow: hidden; }.row-piece :deep(figure) { width: 46px; }.row-piece :deep(svg) { height: 36px; }.row-piece :deep(figcaption) { display: none; }
.row-dimensions { color: #4f5c58; font: 600 15px/1.2 var(--font-verly-mono); }
.movement-in { background: #e8f2ef; color: #27685c; }.movement-out { background: #f0eeea; color: #60584d; }.movement-own { background: #e9ecef; color: #465363; }.movement-unknown { background: #f0f0ed; color: #5c625c; }
.row-main { display: grid; gap: 4px; min-width: 0; }.row-title { overflow: hidden; color: #1c2522; font-size: 17px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }.row-subtitle { overflow: hidden; color: #5b6764; font-size: 15px; text-overflow: ellipsis; white-space: nowrap; }
.row-meta { display: flex; align-items: flex-end; justify-content: flex-end; gap: 4px 12px; flex-wrap: wrap; color: #65716e; font-size:15px; }.row-meta time { width: 100%; text-align: right; }.amount { color: #1a2421; font: 600 16px var(--font-verly-mono); white-space: nowrap; }.amount.muted { color: #53615f; }.row-meta :deep(.verly-status-pill) { min-height: 25px; padding: 2px 8px; font-size:15px; }
.row-chevron { color: #63716d; font-size: 25px; line-height: 1; }.empty-state { padding: 20px; color: #53615f; text-align: center; }
.completed-list { margin-top: 24px; padding-top: 17px; border-top: 1px solid #dce2df; }.completed-list h3 { margin-bottom: 10px; font-size: 19px; }.completed-row { display: flex; align-items: center; gap: 9px; min-height:44px; color: #53615f; font-size: 15px; }
.review-dialog { position: fixed; inset: 0 0 0 auto; width: min(480px,100vw); max-width: none; height: 100dvh; max-height: none; margin: 0; padding: 0; border: 0; background: #fff; color: #141a1f; box-shadow: -18px 0 50px #111a1826; overflow: hidden; }
.review-dialog::backdrop { background: #121b19a6; backdrop-filter: blur(2px); }.drawer-shell { display: flex; width: 100%; height: 100%; flex-direction: column; background: #fff; }.drawer-header { display: flex; flex: 0 0 auto; align-items: center; justify-content: space-between; padding: 19px 22px 16px; border-bottom: 1px solid #e0e5e2; }.drawer-header h2 { font-size: 23px; }.icon-button { display: grid; width: 44px; height: 44px; place-items: center; border: 1px solid #ccd5d1; border-radius: 50%; background: #fff; color: #28332f; cursor: pointer; }
.drawer-scroll { flex: 1 1 auto; overflow-y: auto; overscroll-behavior: contain; padding: 18px 22px 24px; }.amount-panel { display: grid; gap: 5px; margin: 0 0 18px; color: #596562; font-size: 15px; }.drawer-amount { color: #151d1a; font: 600 29px/1.15 var(--font-verly-mono); }.unknown-message { margin-top: 8px; color: #343e3a; font-size: 17px; font-weight: 600; }.piece-preview { width: 190px; margin: 0 auto 20px; }.piece-preview :deep(figcaption) { font-size:15px; text-align: center; }
.drawer-section { margin: 18px 0; }.drawer-section h3 { margin-bottom: 9px; font-size: 17px; }.chips { display: flex; gap: 8px; flex-wrap: wrap; }.chips :deep(.verly-choice-chip) { min-height:44px; padding: 6px 11px; font-size: 15px; }
.suggestion-card { padding: 14px; border: 1px solid #c9dad6; border-radius: 13px; background: #f6faf9; }.suggestion-top { display: flex; align-items: center; justify-content: space-between; gap: 6px; }.suggestion-label { color: #315e58; font-size:15px; font-weight: 600; }.suggestion-top :deep(.verly-status-pill) { min-height: 26px; font-size:15px; }.suggestion-sentence { margin: 11px 0 5px; color: #25312d; font-size: 17px; line-height: 1.4; }.suggestion-why { margin: 0 0 12px; color: #56635f; font-size: 15px; line-height: 1.35; }.accept-button :deep(button) { display: inline-flex; align-items: center; gap: 7px; min-height:44px; padding: 7px 12px; font-size: 15px; }
.search-panel { padding: 13px; border: 1px solid #d4ddda; border-radius: 12px; }.search-panel>label,.field-label { display: block; margin-bottom: 7px; color: #293632; font-size: 15px; font-weight: 600; }.search-box { display: flex; align-items: center; gap: 9px; min-height: 46px; padding: 0 12px; border: 1px solid #9aa9a4; border-radius: 9px; color: #53615f; }.search-box:focus-within { outline: 3px solid #2e7d7a; outline-offset: 1px; }.search-box input { width: 100%; border: 0; outline: 0; color: #141a1f; background: transparent; font: 400 16px var(--font-verly-body); }.search-help,.field-hint { margin: 7px 0 0; color: #5a6763; font-size:15px; line-height: 1.35; }.search-results { display: grid; gap: 4px; max-height: 180px; overflow-y: auto; margin: 10px 0; }.search-results button { display: grid; gap: 2px; min-height: 50px; padding: 7px 9px; border: 0; border-radius: 7px; background: #f2f5f4; color: #17211d; text-align: left; cursor: pointer; font: inherit; }.search-results button:hover { background: #e4f1ef; }.search-results small,.search-empty { color: #586560; font-size:15px; }.search-panel :deep(.verly-action-button) { min-height:44px; font-size: 15px; }
.drawer-section select,.drawer-section textarea { width: 100%; min-height: 46px; padding: 9px 11px; border: 1px solid #98a7a2; border-radius: 8px; background: #fff; color: #18211e; font: 400 16px var(--font-verly-body); }.drawer-section textarea { resize: vertical; }.drawer-section select:focus-visible,.drawer-section textarea:focus-visible { outline: 3px solid #2e7d7a; outline-offset: 1px; }.difference-note { margin: 9px 0 0; padding: 9px 11px; border-left: 3px solid #2e7d7a; background: #f1f7f6; color: #30413c; font-size:15px; line-height: 1.4; }
.own-callout,.reference-callout { display: flex; align-items: flex-start; gap: 10px; padding: 13px; border: 1px solid #d7dedb; border-radius: 11px; background: #f6f8f7; color: #35413d; }.own-callout p,.reference-callout p { margin: 4px 0 0; color: #596662; font-size: 15px; }.reference-callout { margin-top: 20px; }
.evidence-details { margin: 19px 0 4px; border-top: 1px solid #dce2df; border-bottom: 1px solid #dce2df; }.evidence-details summary { display: flex; min-height: 49px; align-items: center; justify-content: space-between; gap: 8px; color: #36433e; font-size: 15px; font-weight: 600; cursor: pointer; list-style: none; }.evidence-details summary::-webkit-details-marker { display:none; }.evidence-details[open] summary svg { transform: rotate(180deg); }.evidence-content { display: grid; gap: 12px; padding: 4px 0 14px; }.evidence-content p { display: grid; gap: 3px; margin: 0; color: #596561; font-size:15px; line-height: 1.35; }.evidence-content strong { color: #303b37; font-size:15px; }.evidence-warning { padding: 9px; border-left: 3px solid #2e7d7a; background: #f1f7f6; }
.drawer-footer { flex: 0 0 auto; padding: 12px 22px max(14px,env(safe-area-inset-bottom)); border-top: 1px solid #dce2df; background: #fff; box-shadow: 0 -8px 18px #ffffffd9; }.destination-summary { margin: 0 0 9px; color: #4e5c57; font-size:15px; line-height: 1.3; }.footer-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; }.footer-actions :deep(.verly-action-button),.drawer-footer> :deep(.verly-action-wrap) { min-height: 46px; }.text-action { min-height: 44px; padding: 8px 0; border: 0; background: transparent; color: #245e58; font: 600 15px var(--font-verly-body); cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }.notice-text { margin: 7px 0 0; color: #52615c; font-size:15px; }.drawer-footer> :deep(.verly-action-wrap) { width: 100%; }.drawer-footer> :deep(.verly-action-wrap button) { width: 100%; }
.toast-stack { position: fixed; z-index: 90; right: 20px; bottom: 20px; display: grid; width: min(440px,calc(100vw - 32px)); gap: 9px; }
@media (max-width: 680px) { .finance-preview { padding: 14px 15px calc(88px + env(safe-area-inset-bottom)); }.page-heading { margin: 18px 0 15px; }.summary-grid { gap: 8px; }.summary-card { min-height: 92px; padding: 11px 9px; border-radius: 11px; }.summary-card span { font-size:15px; }.summary-card strong { font-size: clamp(15px,4vw,19px); letter-spacing: -.07em; }.summary-card small { font-size:15px; }.queue-section { margin-top: 26px; }.queue-heading h2 { font-size: 22px; }.count-label { max-width: 135px; text-align: right; font-size:15px; }.movement-row { grid-template-columns: 42px minmax(0,1fr) auto; gap: 9px; min-height: 74px; padding: 10px; }.row-piece { width: 40px; height: 40px; }.row-piece :deep(figure) { width: 40px; }.row-piece :deep(svg) { height: 31px; }.movement-icon { width: 38px; height: 38px; }.row-title { font-size: 16px; }.row-subtitle { max-width: 43vw; font-size:15px; }.row-meta { max-width: 116px; gap: 3px 7px; }.row-meta time { font-size:15px; }.amount { font-size:15px; }.row-meta :deep(.verly-status-pill) { min-height: 23px; padding: 1px 6px; font-size:15px; }.row-chevron { display: none; }.review-dialog { inset: auto 0 0; width: 100vw; height: min(91dvh,860px); border-radius: 18px 18px 0 0; box-shadow: 0 -18px 50px #111a1826; }.review-dialog::backdrop { background: #121b19a6; }.drawer-header { padding: 13px 17px 12px; }.drawer-header h2 { font-size: 21px; }.drawer-scroll { padding: 15px 17px 20px; }.drawer-footer { padding: 10px 17px max(12px,env(safe-area-inset-bottom)); }.toast-stack { right: 12px; bottom: calc(76px + env(safe-area-inset-bottom)); width: calc(100vw - 24px); }.piece-preview { width: 155px; margin-bottom: 8px; } }
@media (prefers-reduced-motion: reduce) { *,*::before,*::after { scroll-behavior: auto !important; transition-duration: .01ms !important; } }
</style>
