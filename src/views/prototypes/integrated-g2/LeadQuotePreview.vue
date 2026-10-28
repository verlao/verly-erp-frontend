<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Check, MapPin, Plus, Ruler, Trash2 } from 'lucide-vue-next'
import PieceDrawing from '@/components/verly/PieceDrawing.vue'
import { formatBRL } from '@/lib/money'
import ReviewValue from './ReviewValue.vue'
import { findReviewCustomer, findReviewLead, type ReviewPiece } from './reviewContext'
import { addPreviewQuote } from './vendasPreviewState'
import { priceReviewPiece } from './previewPricing'
import { previewProducts, typeLabels } from './previewCatalog'

const route = useRoute()
const router = useRouter()
const lead = computed(() => findReviewLead(route.params.id ?? route.query.leadId))
const selectedCustomerId = ref<number | null>(route.query.customerId ? Number(route.query.customerId) : null)
const standaloneName = ref(String(route.query.newCustomerName ?? ''))
const standalonePhone = ref('')
const catalogProduct = computed(() => previewProducts.value.find(item => item.id === Number(route.query.productId)))
const standaloneItem = ref(catalogProduct.value ? `${typeLabels[catalogProduct.value.productType]} · ${catalogProduct.value.color}` : String(route.query.itemDescription ?? ''))
const standalonePrice = ref<number | null>(catalogProduct.value?.examplePriceCents != null ? catalogProduct.value.examplePriceCents / 100 : route.query.amountCents && Number.isFinite(Number(route.query.amountCents)) ? Number(route.query.amountCents) / 100 : null)
const revisionSeen = ref(lead.value?.revision ?? null)
const reviewAcknowledged = ref(false)
const revisionChanged = ref(false)
const notice = ref('')
const pieces = ref<EditablePiece[]>([])

interface EditablePiece {
  editing: boolean
  source: ReviewPiece
  name: string
  width: number | null
  height: number | null
  areaM2: number | null
  color: string
  sheets: number | null
  quantity: number
  selected: boolean
  colorConfirmed: boolean
  sheetsConfirmed: boolean
  priceCents: number | null
  priceSource: string
}

function editable(piece: ReviewPiece): EditablePiece {
  const price = priceReviewPiece(piece, piece.widthCm.value, piece.heightCm.value, piece.areaM2.value)
  return {
    source: JSON.parse(JSON.stringify(piece)) as ReviewPiece,
    editing: false,
    name: piece.name,
    width: piece.widthCm.value,
    height: piece.heightCm.value,
    areaM2: piece.areaM2.value,
    color: piece.color.value ?? '',
    sheets: piece.sheets.value,
    quantity: piece.quantity.value ?? 1,
    selected: !piece.variantGroup || piece.variantSelected,
    colorConfirmed: piece.color.origin !== 'default',
    sheetsConfirmed: piece.sheets.origin !== 'default',
    priceCents: price.cents,
    priceSource: price.source,
  }
}

watch(() => lead.value?.id, () => {
  const value = lead.value
  pieces.value = value?.items.map(editable) ?? []
  revisionSeen.value = value?.revision ?? null
  revisionChanged.value = false
  reviewAcknowledged.value = false
  selectedCustomerId.value = route.query.customerId ? Number(route.query.customerId) : null
}, { immediate: true })

watch(() => lead.value?.revision, revision => {
  if (revision == null || revisionSeen.value == null || revision === revisionSeen.value) return
  // Keep the operator's edits, but make them review the latest source revision again.
  revisionChanged.value = true
  reviewAcknowledged.value = false
  notice.value = 'A conversa mudou desde a revisão. Confira os dados atualizados antes de salvar.'
})

const activePieces = computed(() => pieces.value.filter(piece => piece.selected))
const totalCents = computed(() => activePieces.value.reduce((sum, piece) => sum + (piece.priceCents ?? 0) * (Number.isInteger(piece.quantity) && piece.quantity > 0 ? piece.quantity : 0), 0))
const hasTotalEstimate = computed(() => activePieces.value.length > 0 && activePieces.value.every(piece => piece.priceCents != null && piece.priceCents > 0))
const unresolvedDefaults = computed(() => activePieces.value.some(piece =>
  (piece.source.color.origin === 'default' && !piece.colorConfirmed) ||
  (piece.source.sheets.origin === 'default' && !piece.sheetsConfirmed),
))
const unresolvedAlternative = computed(() => {
  const groups = [...new Set(pieces.value.map(piece => piece.source.variantGroup).filter((value): value is string => !!value))]
  return groups.some(group => pieces.value.filter(piece => piece.source.variantGroup === group).filter(piece => piece.selected).length !== 1)
})
const ready = computed(() => !revisionChanged.value && !!lead.value && activePieces.value.length > 0 && !unresolvedDefaults.value && !unresolvedAlternative.value &&
  activePieces.value.every(piece => piece.name.trim() && Number.isInteger(Number(piece.quantity)) && piece.quantity > 0 && piece.priceCents != null && piece.priceCents > 0 &&
    (piece.source.pricingBasis === 'PER_M2' || (piece.color.trim() && Number.isInteger(Number(piece.sheets)) && Number(piece.sheets) > 0)) &&
    (piece.source.pricingBasis === 'PER_M2' ? piece.areaM2 != null && piece.areaM2 > 0 : piece.width != null && piece.height != null && piece.width > 0 && piece.height > 0)) && reviewAcknowledged.value)
const customer = computed(() => selectedCustomerId.value == null ? undefined : findReviewCustomer(selectedCustomerId.value))
const candidateCustomers = computed(() => (lead.value?.candidateCustomerIds ?? []).map(findReviewCustomer).filter(Boolean))


function displayField(piece: EditablePiece, key: 'width' | 'height' | 'areaM2' | 'color' | 'sheets' | 'quantity') {
 const sourceKey = {width:'widthCm',height:'heightCm',areaM2:'areaM2',color:'color',sheets:'sheets',quantity:'quantity'} as const
 const source = piece.source[sourceKey[key]]
 const value = piece[key]
 return {value, origin: value !== source.value ? 'confirmed' as const : source.origin, sourceLabel: value !== source.value ? 'Corrigido nesta conferência' : source.sourceLabel}
}
function reloadLatest() {
 if (!lead.value) return
 const previous = pieces.value
 pieces.value = lead.value.items.map(source => {
  const next = editable(source)
  const old = previous.find(piece => piece.source.id === source.id)
  if (!old) return next
  if (old.width !== old.source.widthCm.value) next.width = old.width
  if (old.height !== old.source.heightCm.value) next.height = old.height
  if (old.areaM2 !== old.source.areaM2.value) next.areaM2 = old.areaM2
  if (old.color !== old.source.color.value) next.color = old.color
  if (old.sheets !== old.source.sheets.value) next.sheets = old.sheets
  if (old.quantity !== old.source.quantity.value) next.quantity = old.quantity
  next.selected = old.selected
  const price = priceReviewPiece(source, next.width, next.height, next.areaM2)
  next.priceCents = price.cents
  next.priceSource = price.source
  return next
 })
 for (const old of previous) {
  if (!lead.value.items.some(item => item.id === old.source.id)) pieces.value.push({...old, editing:true})
 }
 revisionSeen.value = lead.value.revision
 revisionChanged.value = false
 reviewAcknowledged.value = false
 notice.value = 'Conversa atualizada. Suas correções foram preservadas; confira a proposta novamente.'
}
function categoryLabel(value: string) { return ({VIDRO_TEMPERADO:'Vidro temperado',PVC:'PVC',ALUMINIO:'Alumínio'} as Record<string,string>)[value] || value }

function priceAgain(piece: EditablePiece) {
  const price = priceReviewPiece(piece.source, piece.width, piece.height, piece.areaM2, piece.color)
  piece.priceCents = price.cents
  piece.priceSource = price.source
  reviewAcknowledged.value = false
  notice.value = 'A peça mudou. Confira a nova estimativa de exemplo e os dados antes de salvar.'
}

function addPiece() {
  const nextId = Math.max(0, ...pieces.value.map(piece => piece.source.id)) + 1
  const source: ReviewPiece = {
    id: nextId, productType: 'JANELA', category: 'VIDRO_TEMPERADO', pricingBasis: 'PER_UNIT', name: 'Nova peça',
    widthCm: { value: null, origin: 'unknown', sourceLabel: 'Ainda falta' }, heightCm: { value: null, origin: 'unknown', sourceLabel: 'Ainda falta' },
    areaM2: { value: null, origin: 'unknown', sourceLabel: 'Ainda falta' }, sheets: { value: null, origin: 'unknown', sourceLabel: 'Ainda falta' },
    color: { value: null, origin: 'unknown', sourceLabel: 'Ainda falta' }, quantity: { value: 1, origin: 'default', sourceLabel: 'Padrão · conferir' },
    pendingMeasurement: true, variantSelected: true, estimatedUnitCents: null,
  }
  pieces.value.push(editable(source))
  reviewAcknowledged.value = false
}

function saveQuote() {
  if (!lead.value) {
    if (customer.value == null && standaloneName.value.trim().length < 2) return
    if (!standaloneItem.value.trim() || standalonePrice.value == null || !Number.isFinite(standalonePrice.value) || standalonePrice.value <= 0) return
    const quote = addPreviewQuote({
      customer: customer.value?.name ?? standaloneName.value.trim(),
      phone: customer.value?.phone ?? standalonePhone.value.trim(),
      ...(customer.value ? { customerId: customer.value.id } : {}),
      item: standaloneItem.value.trim(), width: catalogProduct.value?.width ?? null, height: catalogProduct.value?.height ?? null, glass: catalogProduct.value?.color ?? 'A definir', quantity: 1,
      totalCents: Math.round(standalonePrice.value * 100), profitCents: 0, priceSource: 'Valor informado nesta prévia',
      terms: 'Condição a combinar',
    })
    router.push({ name: 'Quotes', query: { ...(customer.value ? { customerId: String(customer.value.id) } : {}) } })
    notice.value = `Orçamento #${quote.id} preparado nesta prévia.`
    return
  }
  if (!ready.value) return
  const lines = activePieces.value.map(piece => ({
    name: piece.name,
    glass: `${piece.source.category}${piece.color ? ` · ${piece.color}` : ''}`,
    width: piece.width,
    height: piece.height,
    areaM2: piece.areaM2,
    productType: piece.source.productType,
    category: piece.source.category,
    pricingBasis: piece.source.pricingBasis,
    quantity: piece.quantity,
    unitCents: piece.priceCents!,
    leaves: piece.sheets ?? undefined,
  }))
  const first = lines[0]!
  const quote = addPreviewQuote({
    customer: customer.value?.name ?? lead.value.name.value ?? 'Cliente a identificar',
    phone: customer.value?.phone ?? lead.value.phone.value ?? '',
    ...(customer.value ? { customerId: customer.value.id } : {}),
    leadId: lead.value.id,
    item: lines.length === 1 ? first.name : `${lines.length} peças`,
    width: first.width,
    height: first.height,
    areaM2: first.areaM2,
    glass: first.glass,
    quantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    totalCents: totalCents.value,
    profitCents: 0,
    reviewedRevision: lead.value.revision,
    priceSource: activePieces.value.map(piece => piece.priceSource).join('; '),
    terms: 'Condição a combinar',
    items: lines,
  })
  notice.value = `Orçamento #${quote.id} preparado nesta prévia · ${formatBRL(totalCents.value)}.`
  router.push({ name: 'Quotes', query: { leadId: String(lead.value.id), ...(customer.value ? { customerId: String(customer.value.id) } : {}) } })
}

function returnToLeads() { router.push({ name: 'Leads', query: lead.value ? { leadId: String(lead.value.id) } : {} }) }
</script>

<template>
  <main class="preview-page review-quote">
    <button class="rq-back" type="button" @click="returnToLeads"><ArrowLeft :size="18" /> Voltar aos leads</button>
    <template v-if="lead">
      <header class="rq-header">
        <div><p class="preview-eyebrow">Ficha preparada · lead #{{ lead.id }}</p><h1 class="preview-heading">{{ lead.name.value || 'Contato a identificar' }}</h1><p class="preview-subtitle">{{ lead.phone.value || 'Telefone ainda não informado' }} · {{ lead.name.sourceLabel }}</p></div>
        <p class="rq-source-note">Dados de exemplo · revisão {{ lead.revision }}</p>
      </header>

      <section class="rq-context preview-surface" aria-label="Resumo do contato e da conversa">
        <div class="rq-contact"><div><span>Contato</span><strong>{{ lead.name.value || 'Nome ainda não informado' }}</strong><small>{{ lead.phone.value || 'Telefone ainda não informado' }} · {{ lead.phone.sourceLabel }}</small></div><div><span>Endereço</span><strong>{{ lead.address.value || 'Endereço da obra ainda não informado' }}</strong><small>{{ lead.address.sourceLabel }}</small></div></div>
        <blockquote>{{ lead.transcript }}</blockquote>
        <label v-if="candidateCustomers.length" class="preview-form-field rq-customer">Cadastro existente · escolha se for o mesmo cliente
          <select v-model.number="selectedCustomerId" aria-label="Vincular a um cadastro existente"><option :value="null">Manter lead sem vínculo confirmado</option><option v-for="person in candidateCustomers" :key="person!.id" :value="person!.id">{{ person!.name }} · {{ person!.phone }}</option></select>
        </label>
        <p v-if="customer" class="rq-bound"><Check :size="17" /> Cadastro selecionado por você: {{ customer.name }}. O orçamento mantém o lead #{{ lead.id }}.</p>
      </section>

      <div v-if="revisionChanged" class="review-pending" role="alert"><strong>A conversa recebeu informações novas.</strong><p>Atualize a ficha antes de salvar. As correções que você fez serão preservadas para conferir.</p><button class="preview-button" @click="reloadLatest">Conferir atualização</button></div>
      <div class="rq-title-row"><div><p class="preview-eyebrow">Peças detectadas</p><h2>Confira e corrija somente o necessário</h2></div><button class="preview-button" type="button" @click="addPiece"><Plus :size="17" /> Adicionar peça</button></div>
      <p v-if="unresolvedAlternative" class="rq-pending" role="status">Há opções alternativas. Escolha uma para estimar o conjunto, sem somar as alternativas entre si.</p>
      <article v-for="(piece, index) in pieces" :key="piece.source.id" class="rq-piece preview-surface" :class="{ 'rq-not-selected': !piece.selected }">
        <header><div><span class="rq-number">{{ String(index + 1).padStart(2, '0') }}</span><div><h3>{{ piece.name }}</h3><p>{{ categoryLabel(piece.source.category) }} · {{ piece.source.pricingBasis === 'PER_M2' ? 'por área' : 'por peça' }}</p></div></div>
          <label v-if="piece.source.variantGroup" class="rq-radio"><input v-model="piece.selected" type="radio" :name="piece.source.variantGroup" :value="true" @change="pieces.forEach(other => { if (other !== piece && other.source.variantGroup === piece.source.variantGroup) other.selected = false }); reviewAcknowledged = false" /> Usar esta opção</label>
        </header>
        <div v-if="piece.selected" class="rq-piece-content">
          <PieceDrawing v-if="piece.width && piece.height" :width-cm="piece.width" :height-cm="piece.height" :label="piece.name" />
          <div v-else-if="piece.source.pricingBasis === 'PER_M2'" class="rq-area"><strong>{{ piece.areaM2 }} m²</strong><span>Área informada na conversa</span></div>
          <div v-else class="rq-measure-missing"><Ruler :size="19" /><strong>Medida ainda incompleta</strong><span>Digite apenas a dimensão que falta. A medida informada é do cliente e não substitui a visita técnica.</span></div>
          <div class="rq-fields">
            <button class="preview-button rq-wide" type="button" @click="piece.editing = !piece.editing">{{ piece.editing ? 'Concluir correção' : 'Corrigir esta peça' }}</button>
            <label v-if="piece.editing" class="preview-form-field rq-wide">Nome da peça<input v-model.trim="piece.name" @input="reviewAcknowledged = false" /></label>
            <template v-if="piece.source.pricingBasis === 'PER_UNIT'">
              <ReviewValue v-if="!piece.editing && piece.source.widthCm.value != null" label="Largura" :field="displayField(piece, 'width')" suffix="cm" />
              <label v-else class="preview-form-field">{{ piece.width == null ? 'Largura que falta (cm)' : 'Largura (cm)' }}<input v-model.number="piece.width" type="number" min="1" step="0.1" @input="priceAgain(piece)" /></label>
              <ReviewValue v-if="!piece.editing && piece.source.heightCm.value != null" label="Altura" :field="displayField(piece, 'height')" suffix="cm" />
              <label v-else class="preview-form-field">{{ piece.height == null ? 'Altura que falta (cm)' : 'Altura (cm)' }}<input v-model.number="piece.height" type="number" min="1" step="0.1" @input="priceAgain(piece)" /></label>
            </template>
            <template v-else>
              <ReviewValue v-if="!piece.editing && piece.source.areaM2.value != null" label="Área" :field="displayField(piece, 'areaM2')" suffix="m²" />
              <label v-else class="preview-form-field">Área (m²)<input v-model.number="piece.areaM2" type="number" min="0.01" step="0.01" @input="priceAgain(piece)" /></label>
            </template>
            <ReviewValue v-if="!piece.editing" label="Quantidade" :field="displayField(piece, 'quantity')" />
            <label v-else class="preview-form-field">Quantidade<input v-model.number="piece.quantity" type="number" min="1" step="1" @input="reviewAcknowledged = false" /></label>
            <ReviewValue v-if="!piece.editing" label="Cor" :field="displayField(piece, 'color')" />
            <label v-else class="preview-form-field">Cor<select v-model="piece.color" @change="piece.colorConfirmed = !!piece.color; priceAgain(piece)"><option value="">Escolher cor</option><option>INCOLOR</option><option>VERDE</option><option>BRANCO</option><option>FUMÊ</option><option>BRONZE</option></select></label>
            <template v-if="piece.source.pricingBasis === 'PER_UNIT'">
              <ReviewValue v-if="!piece.editing" label="Folhas" :field="displayField(piece, 'sheets')" />
              <label v-else class="preview-form-field">Folhas<input v-model.number="piece.sheets" type="number" min="1" max="8" @input="piece.sheetsConfirmed = Number(piece.sheets) > 0; priceAgain(piece)" /></label>
            </template>
            <label v-if="piece.source.color.origin === 'default'" class="rq-confirm rq-wide"><input v-model="piece.colorConfirmed" type="checkbox" @change="reviewAcknowledged = false" /> Conferi a cor {{ piece.color || 'ainda não escolhida' }}</label>
            <label v-if="piece.source.sheets.origin === 'default' && piece.source.pricingBasis === 'PER_UNIT'" class="rq-confirm rq-wide"><input v-model="piece.sheetsConfirmed" type="checkbox" @change="reviewAcknowledged = false" /> Conferi {{ piece.sheets ?? 'a quantidade de' }} folhas</label>
            <div v-if="piece.priceCents != null" class="rq-price rq-wide"><span>Estimativa desta peça · {{ piece.quantity }} × {{ formatBRL(piece.priceCents) }}</span><strong>{{ formatBRL(piece.priceCents * (Number.isInteger(piece.quantity) && piece.quantity > 0 ? piece.quantity : 0)) }}</strong><small>{{ piece.priceSource }}</small></div>
            <p v-else class="rq-price-missing rq-wide">{{ piece.priceSource }}</p>
          </div>
        </div>
      </article>

      <section class="rq-summary preview-surface"><div><span>Resumo do orçamento</span><strong>{{ hasTotalEstimate ? formatBRL(totalCents) : 'A calcular' }}</strong></div><small>Valores de exemplo · condição de pagamento a combinar.</small>
        <label class="rq-confirm rq-review"><input v-model="reviewAcknowledged" type="checkbox" /> Conferi os dados e as pendências desta revisão {{ lead.revision }}</label>
        <p v-if="lead.items.some(piece => piece.pendingMeasurement)" class="rq-pending">Medida conversada não significa medição técnica concluída.</p>
<p v-if="!ready" class="rq-pending">Confira os dados padrão e complete as pendências antes de salvar.</p>
        <button class="preview-button preview-button-primary" type="button" :disabled="!ready" @click="saveQuote">Salvar orçamento preparado</button>
      </section>
    </template>
    <section v-else class="rq-standalone preview-surface">
      <p class="preview-eyebrow">PROPOSTA AVULSA · SEM LEAD</p>
      <h2>Identifique a proposta</h2>
      <p>Use um cadastro selecionado ou informe somente o nome necessário. Confira a peça e o valor combinado antes de salvar.</p>
      <label v-if="!customer" class="preview-form-field">Nome do cliente<input v-model.trim="standaloneName" autocomplete="name" required /></label>
      <p v-else class="rq-bound"><Check :size="17"/>{{ customer.name }} · cadastro #{{ customer.id }} selecionado</p>
      <label v-if="!customer" class="preview-form-field">Telefone · opcional<input v-model.trim="standalonePhone" autocomplete="tel" /></label>
      <p v-if="catalogProduct" class="review-prepared">Produto #{{ catalogProduct.id }} reaproveitado do catálogo · {{ catalogProduct.width }} × {{ catalogProduct.height }} cm. O valor é um exemplo para esta prévia.</p>
      <label class="preview-form-field">Descrição da peça<input v-model.trim="standaloneItem" placeholder="Ex.: janela de correr" /></label>
      <label class="preview-form-field">Valor combinado (R$)<input v-model.number="standalonePrice" type="number" min="0" step="0.01" /></label>
      <button class="preview-button preview-button-primary" type="button" :disabled="(!customer && standaloneName.trim().length < 2) || !standaloneItem.trim() || standalonePrice == null || !Number.isFinite(standalonePrice) || standalonePrice <= 0" @click="saveQuote">Salvar proposta avulsa</button>
    </section>
  </main>
</template>

<style scoped>
.review-quote{display:grid;gap:18px;color:#141a1f}.rq-back{justify-self:start;display:flex;align-items:center;gap:8px;min-height:44px;border:0;background:transparent;color:#286965;font:600 16px var(--font-verly-body);cursor:pointer}.rq-header,.rq-title-row{display:flex;align-items:center;justify-content:space-between;gap:16px}.rq-header .preview-heading{margin:3px 0}.rq-source-note{padding:9px 12px;border-radius:9px;background:#eff7f5;color:#40544d;font-size:15px}.rq-context{display:grid;gap:14px;padding:20px}.rq-contact{display:grid;grid-template-columns:1fr 1fr;gap:15px}.rq-contact>div{display:grid;gap:4px}.rq-contact span,.rq-contact small{color:#596761;font-size:15px}.rq-contact strong{font-size:17px}.rq-context blockquote{margin:0;padding:14px;border-left:3px solid #2e7d7a;background:#eff7f5;font-size:16px;line-height:1.5}.rq-customer{max-width:500px}.rq-bound{display:flex;align-items:center;gap:8px;margin:0;color:#245d35;font-size:15px}.rq-title-row h2{margin:3px 0;font:600 23px var(--font-verly-display)}.rq-piece{padding:17px}.rq-piece>header{display:flex;align-items:center;justify-content:space-between;gap:12px}.rq-piece>header>div{display:flex;align-items:center;gap:12px}.rq-number{display:grid;place-items:center;width:36px;height:36px;border-radius:10px;background:#e4f1ef;color:#246765;font:600 16px var(--font-verly-mono)}.rq-piece h3{margin:0;font-size:18px}.rq-piece header p{margin:4px 0 0;color:#596761;font-size:15px}.rq-radio{display:flex;align-items:center;gap:8px;min-height:44px;font-size:15px}.rq-piece-content{display:grid;grid-template-columns:minmax(140px,.7fr) minmax(0,1.4fr);align-items:center;gap:16px;padding-top:15px}.rq-piece-content :deep(figure){max-width:230px}.rq-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.rq-fields :deep(.review-value){min-width:0}.rq-fields input,.rq-fields select{width:100%;min-height:46px;padding:8px 10px;border:1px solid #bdcbc5;border-radius:8px;background:#fff;color:#141a1f;font:16px var(--font-verly-body)}.rq-wide{grid-column:1/-1}.rq-confirm{display:flex;align-items:flex-start;gap:9px;min-height:44px;color:#34443e;font-size:15px;line-height:1.4}.rq-confirm input{width:20px;height:20px;flex:0 0 20px;margin:1px 0;accent-color:#2e7d7a}.rq-measure-missing{display:grid;justify-items:center;gap:8px;padding:20px;border:1px dashed #d8ad75;border-radius:11px;background:#fff8ed;color:#765019;text-align:center}.rq-measure-missing span{font-size:15px;line-height:1.4}.rq-price{display:grid;gap:4px;padding:13px;border-radius:10px;background:#f2f6f4}.rq-price span,.rq-price small,.rq-price-missing{color:#586560;font-size:15px}.rq-price strong{font:600 21px var(--font-verly-mono)}.rq-price-missing{margin:0;padding:12px;background:#fff8ed}.rq-summary{display:grid;gap:10px;padding:18px}.rq-summary>div{display:flex;justify-content:space-between;align-items:center;gap:15px}.rq-summary>div span{font-size:17px}.rq-summary>div strong{font:600 25px var(--font-verly-mono)}.rq-summary small{color:#586560;font-size:15px}.rq-summary .preview-button{min-height:48px}.rq-pending{margin:0;padding:12px;border-radius:9px;background:#fff3df;color:#70430c;font-size:15px;line-height:1.4}.rq-not-selected{opacity:.75}@media(max-width:680px){.rq-header,.rq-title-row{align-items:flex-start;flex-direction:column}.rq-contact{grid-template-columns:1fr}.rq-piece{padding:14px}.rq-piece-content{grid-template-columns:1fr}.rq-piece-content :deep(figure){margin:auto}.rq-fields{gap:9px}.rq-title-row>.preview-button{width:100%}.rq-summary>div strong{font-size:21px}}
.rq-area{display:grid;gap:8px;justify-items:center;padding:28px;background:#E5F2EF;border-radius:16px;color:#245F59}.rq-area strong{font:600 32px var(--font-verly-mono)}.rq-area span{font-size:15px}
</style>
