<template>
  <div class="max-w-6xl mx-auto px-4 py-4 md:py-6">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-4">
      <button
        class="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Voltar"
        @click="router.back()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg>
      </button>
      <div>
        <h1 class="text-xl md:text-2xl font-semibold text-foreground">Conferência do orçamento</h1>
        <p v-if="lead" class="text-sm text-muted-foreground">{{ lead.name }} · {{ lead.phone }}</p>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center h-40 text-muted-foreground">
      Carregando…
    </div>

    <template v-else-if="lead">
      <div
        :class="[
          'grid grid-cols-1 gap-4 lg:gap-6',
          transcript.length ? 'lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]' : '',
        ]"
      >
        <!-- Conversa: o que o cliente pediu (medidas destacadas) -->
        <aside v-if="transcript.length" class="min-w-0">
          <!-- Desktop: painel fixo sempre visível -->
          <div class="rounded-lg border border-border bg-card shadow-sm hidden lg:flex flex-col max-h-[calc(100vh-14rem)] sticky top-4">
            <div class="p-3 border-b border-border shrink-0">
              <p class="text-sm font-semibold text-foreground truncate">{{ lead.name }}</p>
              <p class="text-xs text-muted-foreground">Conversa · {{ transcript.length }} mensagens</p>
            </div>
            <div class="flex-1 overflow-y-auto p-3 space-y-1.5">
              <div
                v-for="(m, i) in transcript"
                :key="i"
                class="flex"
                :class="m.fromMe ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-[85%] rounded-lg px-3 py-1.5 text-sm"
                  :class="[
                    m.fromMe ? 'bg-primary/10' : 'bg-muted',
                    hasMeasurement(m.body) ? 'ring-1 ring-warning bg-warning/10' : '',
                  ]"
                >
                  <p class="whitespace-pre-wrap break-words">{{ m.body }}</p>
                  <p class="text-[10px] text-muted-foreground mt-0.5">
                    <span v-if="hasMeasurement(m.body)" class="text-warning font-medium">📐 medidas · </span>
                    {{ m.fromMe ? 'Loja' : 'Cliente' }} · {{ fmtTime(m.at) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile: colapsável, fechado por padrão -->
          <details class="lg:hidden rounded-lg border border-border bg-card shadow-sm">
            <summary class="cursor-pointer select-none p-3 text-sm font-medium text-foreground">
              Ver conversa ({{ transcript.length }})
            </summary>
            <div class="border-t border-border p-3 space-y-1.5 max-h-72 overflow-y-auto">
              <div
                v-for="(m, i) in transcript"
                :key="i"
                class="flex"
                :class="m.fromMe ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-[85%] rounded-lg px-3 py-1.5 text-sm"
                  :class="[
                    m.fromMe ? 'bg-primary/10' : 'bg-muted',
                    hasMeasurement(m.body) ? 'ring-1 ring-warning bg-warning/10' : '',
                  ]"
                >
                  <p class="whitespace-pre-wrap break-words">{{ m.body }}</p>
                  <p class="text-[10px] text-muted-foreground mt-0.5">
                    <span v-if="hasMeasurement(m.body)" class="text-warning font-medium">📐 medidas · </span>
                    {{ m.fromMe ? 'Loja' : 'Cliente' }} · {{ fmtTime(m.at) }}
                  </p>
                </div>
              </div>
            </div>
          </details>
        </aside>

        <!-- Produtos que a IA entendeu — ajuste fino + valores -->
        <div class="min-w-0">
          <div class="space-y-3">
            <Card
              v-for="(row, i) in rows"
              :key="i"
              class="p-4"
              :class="row.variantGroup && row.variantSelected === false ? 'opacity-60' : ''"
            >
              <div class="flex items-start justify-between mb-2">
                <span class="font-medium">{{ row.type || 'Escolha o tipo' }}</span>
                <button class="text-xs text-muted-foreground hover:text-destructive" @click="removeRow(i)">Remover</button>
              </div>

              <!-- Variantes A/B: o cliente pediu pra comparar; só a selecionada entra no total -->
              <div v-if="row.variantGroup" class="flex items-center gap-2 mb-2 text-xs">
                <span class="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                  {{ variantOptionLabel(row) }}
                </span>
                <label class="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    :name="`variant-${row.variantGroup}`"
                    :checked="row.variantSelected !== false"
                    @change="selectVariant(row)"
                  />
                  <span class="text-muted-foreground">Escolhida pelo cliente</span>
                </label>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label class="text-xs text-muted-foreground">Largura (cm)
                  <input v-model.number="row.width" type="number" class="mt-1 w-full px-2 py-1.5 border border-border rounded-md bg-background" @change="recalcRow(row)" />
                </label>
                <label class="text-xs text-muted-foreground">Altura (cm)
                  <input v-model.number="row.height" type="number" class="mt-1 w-full px-2 py-1.5 border border-border rounded-md bg-background" @change="recalcRow(row)" />
                </label>
                <label class="text-xs text-muted-foreground">Folhas
                  <input v-model.number="row.sheets" type="number" min="1" class="mt-1 w-full px-2 py-1.5 border border-border rounded-md bg-background" @change="recalcRow(row)" />
                </label>
                <label class="text-xs text-muted-foreground">Qtd
                  <input v-model.number="row.quantity" type="number" min="1" class="mt-1 w-full px-2 py-1.5 border border-border rounded-md bg-background" />
                </label>
                <label class="text-xs text-muted-foreground col-span-2">Tipo
                  <select
                    v-model="row.type"
                    class="mt-1 w-full px-2 py-1.5 border rounded-md bg-background"
                    :class="row.type ? 'border-border' : 'border-warning ring-1 ring-warning'"
                    @change="recalcRow(row)"
                  >
                    <option value="">Escolha o tipo…</option>
                    <option v-for="t in TYPES" :key="t" :value="t">{{ t }}</option>
                  </select>
                </label>
                <label class="text-xs text-muted-foreground col-span-2">Cor
                  <select v-model="row.color" class="mt-1 w-full px-2 py-1.5 border border-border rounded-md bg-background" @change="recalcRow(row)">
                    <option value="INCOLOR">Incolor</option>
                    <option value="FUME">Fumê</option>
                    <option value="VERDE">Verde</option>
                    <option value="BRONZE">Bronze</option>
                  </select>
                </label>
                <div class="col-span-2 md:col-span-4 flex items-end justify-end gap-3 text-right">
                  <span v-if="row.aiValue != null" class="text-xs text-muted-foreground" title="Valor estimado pela IA na conversa">
                    IA: {{ currency.formatCurrency(row.aiValue) }}
                  </span>
                  <span v-if="row.calculating" class="text-xs text-muted-foreground">calculando…</span>
                  <span v-else-if="row.priceUnavailable" class="text-xs text-warning font-medium">
                    {{ row.priceUnavailableReason || 'Pendente de medida' }}
                  </span>
                  <span v-else class="text-sm">
                    <span class="text-xs text-muted-foreground">{{ row.quantity || 1 }}× {{ currency.formatCurrency(row.unitPrice || 0) }} = </span>
                    <span class="font-semibold">{{ currency.formatCurrency((row.unitPrice || 0) * (row.quantity || 1)) }}</span>
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <button class="mt-3 text-sm text-primary hover:underline" @click="addRow">+ Adicionar item</button>

          <!-- Totais + desconto -->
          <Card class="p-4 mt-4 space-y-2">
            <div v-if="lead.totalEstimatedValue != null" class="flex justify-between text-sm">
              <span class="text-muted-foreground">Estimativa da IA</span>
              <span :class="aiDiverges ? 'text-warning font-medium' : 'text-muted-foreground'">
                {{ currency.formatCurrency(lead.totalEstimatedValue) }}
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Subtotal</span>
              <span>{{ currency.formatCurrency(subtotal) }}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-muted-foreground">Desconto (R$)</span>
              <input v-model.number="discount" type="number" min="0" class="w-28 px-2 py-1 border border-border rounded-md bg-background text-right" placeholder="0" />
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-muted-foreground">Preço final (manual)</span>
              <input v-model.number="finalPriceOverride" type="number" min="0" class="w-28 px-2 py-1 border border-border rounded-md bg-background text-right" placeholder="auto" />
            </div>
            <div class="flex justify-between text-base font-bold border-t border-border pt-2">
              <span>Total</span>
              <span>{{ currency.formatCurrency(finalTotal) }}</span>
            </div>
          </Card>

          <!-- Ações: salvar / enviar PDF / enviar mensagem -->
          <div class="flex flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" class="flex-1" :disabled="saving || pdfLoading" @click="save()">
              {{ saving ? 'Salvando…' : 'Salvar' }}
            </Button>
            <Button class="flex-1" :disabled="saving || pdfLoading" @click="sendPdf()">
              <FileText class="w-4 h-4 mr-2" />
              {{ pdfLoading ? 'Gerando PDF…' : 'Enviar PDF' }}
            </Button>
            <Button
              class="flex-1 bg-success hover:bg-success/90 text-success-foreground"
              :disabled="saving || pdfLoading || !lead.phone"
              @click="sendMessage()"
            >
              <MessageSquare class="w-4 h-4 mr-2" />
              Enviar mensagem
            </Button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FileText, MessageSquare } from 'lucide-vue-next'
import Button from '../components/ui/Button.vue'
import Card from '../components/ui/Card.vue'
import leadService from '../services/lead'
import type { LeadDTO } from '../services/lead'
import productService from '../services/product'
import quoteService from '../services/quote'
import type { CreateQuoteFromLeadPayload } from '../services/quote'
import { buildRichQuoteMessage, buildWhatsAppUrl } from '../lib/whatsapp'
import { useLeadSignals, fmtTime } from '../composables/useLeadSignals'
import { useCurrency } from '../composables/useCurrency'
import { useNotification } from '../composables/useNotification'

interface Row {
  // null/vazio = ainda não escolhido; nunca assumir um tipo por conta própria.
  type: string | null
  color: string
  sheets: number
  width: number | null
  height: number | null
  quantity: number
  // null/undefined = preço não calculado (ver priceUnavailable*); nunca 0 == "grátis".
  unitPrice: number | null
  aiValue: number | null
  calculating: boolean
  // vindo do backend: medida ainda não confirmada (ex: visita técnica pendente).
  pendingMeasurement: boolean
  // true quando falta tipo/medida ou o backend não conseguiu calcular o preço.
  priceUnavailable: boolean
  priceUnavailableReason: string | null
  // itens com o mesmo variantGroup são alternativas A/B que o cliente pediu
  // pra comparar; só a variante com variantSelected !== false conta no total.
  variantGroup: string | null
  variantSelected: boolean
}

const route = useRoute()
const router = useRouter()
const currency = useCurrency()
const notification = useNotification()

const leadId = Number(route.params.id)
const lead = ref<LeadDTO | null>(null)
const loading = ref(true)
const saving = ref(false)
const pdfLoading = ref(false)
const rows = ref<Row[]>([])
const discount = ref<number | null>(null)
const finalPriceOverride = ref<number | null>(null)

// Conversa da IA (blob lead.data) — mesma fonte do LeadPreview.
const { transcript } = useLeadSignals(() => lead.value ?? undefined)

// Mensagens com medidas: "230x240", "1,50 m", "largura/altura" etc.
const MEASUREMENT_RE = /\d+\s*[x×]\s*\d+|\d+[.,]?\d*\s*(m|cm)\b|\b(largura|altura|lar\.|alt\.|medida)/i
function hasMeasurement(body?: string): boolean {
  return !!body && MEASUREMENT_RE.test(body)
}

// Tipos não-vidro → categoria; o resto é vidro temperado.
const NON_GLASS: Record<string, string> = { FORRO_PVC: 'PVC', PORTA_ALUMINIO: 'ALUMINIO' }
const TYPES = ['PORTA', 'JANELA', 'BOX', 'SACADA', 'BASCULANTE', 'FIXO', 'FORRO_PVC', 'PORTA_ALUMINIO']

function categoryFor(type: string | null | undefined): string | null {
  if (!type) return null
  return NON_GLASS[type] ?? 'VIDRO_TEMPERADO'
}

// Linhas que efetivamente compõem o orçamento: preço calculado e, se fizerem
// parte de um grupo de variantes A/B, a que o cliente escolheu.
function includedRows(): Row[] {
  const seenGroups = new Set<string>()
  return rows.value.filter((r) => {
    if (r.priceUnavailable) return false
    if (!r.variantGroup) return true
    if (r.variantSelected === false) return false
    if (seenGroups.has(r.variantGroup)) return false
    seenGroups.add(r.variantGroup)
    return true
  })
}

function variantOptionLabel(row: Row): string {
  if (!row.variantGroup) return ''
  const group = rows.value.filter((r) => r.variantGroup === row.variantGroup)
  const pos = Math.max(group.indexOf(row), 0)
  return `Opção ${String.fromCharCode(65 + pos)}`
}

function selectVariant(row: Row) {
  if (!row.variantGroup) return
  rows.value.forEach((r) => {
    if (r.variantGroup === row.variantGroup) {
      r.variantSelected = r === row
    }
  })
}

const subtotal = computed(() => includedRows().reduce((sum, r) => sum + (r.unitPrice || 0) * (r.quantity || 1), 0))
const finalTotal = computed(() => {
  if (finalPriceOverride.value != null && finalPriceOverride.value >= 0) return finalPriceOverride.value
  return Math.max(0, subtotal.value - (discount.value || 0))
})

// Estimativa da IA diverge >10% do subtotal calculado → destaca em warning.
const aiDiverges = computed(() => {
  const ai = lead.value?.totalEstimatedValue
  if (ai == null || ai === 0 || subtotal.value === 0) return false
  return Math.abs(subtotal.value - ai) / ai > 0.1
})

function markPriceUnavailable(row: Row, reason: string) {
  row.unitPrice = null
  row.priceUnavailable = true
  row.priceUnavailableReason = reason
}

async function recalcRow(row: Row) {
  if (!row.type) {
    markPriceUnavailable(row, 'Escolha o tipo do item')
    return
  }
  if (row.pendingMeasurement) {
    markPriceUnavailable(row, 'Pendente de medição')
    return
  }
  // FORRO_PVC e PORTA_ALUMINIO são precificados por m²/unidade e legitimamente
  // não têm width/height — só exigir medida pros tipos que dependem dela.
  if (!NON_GLASS[row.type] && (!row.width || !row.height)) {
    markPriceUnavailable(row, 'Pendente de medida')
    return
  }
  row.calculating = true
  try {
    const res = await productService.calculate({
      category: categoryFor(row.type) as any,
      type: row.type as any,
      color: row.color,
      sheets: row.sheets,
      width: row.width ?? undefined,
      height: row.height ?? undefined,
    })
    // Backend pode responder price:null + priceUnavailableReason quando não
    // conseguir calcular (em vez de calcular parcial) — nunca tratar como grátis.
    const price = res?.price
    const unavailableReason = res?.priceUnavailableReason
    if (price == null || unavailableReason) {
      markPriceUnavailable(row, unavailableReason || 'Não foi possível calcular o preço')
    } else {
      row.unitPrice = price
      row.priceUnavailable = false
      row.priceUnavailableReason = null
    }
  } catch {
    markPriceUnavailable(row, 'Erro ao calcular preço')
  } finally {
    row.calculating = false
  }
}

function addRow() {
  rows.value.push({
    type: null,
    color: 'INCOLOR',
    sheets: 1,
    width: null,
    height: null,
    quantity: 1,
    unitPrice: null,
    aiValue: null,
    calculating: false,
    pendingMeasurement: false,
    priceUnavailable: true,
    priceUnavailableReason: 'Escolha o tipo do item',
    variantGroup: null,
    variantSelected: true,
  })
}

function removeRow(i: number) {
  rows.value.splice(i, 1)
}

async function load() {
  loading.value = true
  try {
    lead.value = await leadService.getById(leadId)
    rows.value = (lead.value?.items ?? []).map((it) => ({
      // Nunca assumir 'BOX' quando o backend não classificou o item — deixar
      // vazio força quem está conferindo a escolher o tipo real.
      type: it.productType || null,
      color: it.color || 'INCOLOR',
      sheets: it.sheets ?? 1,
      width: it.widthCm ?? null,
      height: it.heightCm ?? null,
      quantity: it.quantity ?? 1,
      unitPrice: null,
      aiValue: it.estimatedValue ?? null,
      calculating: false,
      pendingMeasurement: it.pendingMeasurement ?? false,
      priceUnavailable: true,
      priceUnavailableReason: null,
      variantGroup: it.variantGroup ?? null,
      // Item antigo sem a info do backend: trata como selecionado (não filtra).
      variantSelected: it.variantSelected ?? true,
    }))
    await Promise.all(rows.value.map((r) => recalcRow(r)))
  } catch {
    notification.error('Erro', 'Não foi possível carregar o lead')
  } finally {
    loading.value = false
  }
}

// Só linhas com preço calculado e (se houver variantes) a escolhida pelo
// cliente entram no orçamento — mandar uma linha sem preço pro backend seria
// o mesmo bug do preço 0, só que virando um item "de graça" no PDF/mensagem.
function buildPayload(): CreateQuoteFromLeadPayload {
  return {
    leadId,
    items: includedRows().map((r) => ({
      type: r.type || '',
      category: categoryFor(r.type) ?? undefined,
      color: r.color,
      sheets: r.sheets,
      width: r.width ?? undefined,
      height: r.height ?? undefined,
      quantity: r.quantity,
    })),
    discount: discount.value ?? undefined,
    finalPriceOverride: finalPriceOverride.value ?? undefined,
  }
}

async function save(): Promise<{ id: number; daysUntilExpiration?: number } | null> {
  if (rows.value.length === 0) {
    notification.warning('Atenção', 'Adicione ao menos um item')
    return null
  }
  if (includedRows().length === 0) {
    notification.warning('Atenção', 'Nenhum item com preço calculado — defina o tipo e a medida antes de salvar')
    return null
  }
  saving.value = true
  try {
    const created = await quoteService.createFromLead(buildPayload())
    notification.success('Sucesso', 'Orçamento salvo')
    return created
  } catch (e: any) {
    notification.error('Erro', e.response?.data?.message || 'Não foi possível salvar o orçamento')
    return null
  } finally {
    saving.value = false
  }
}

function itemLabel(r: Row): string {
  return `${r.type || ''} ${r.width || ''}×${r.height || ''}${r.color && r.color !== 'INCOLOR' ? ' ' + r.color : ''}`.trim()
}

function firstNameOf(name: string): string {
  return name.trim().split(' ')[0] || name
}

// Enviar PDF: salva → gera o PDF do backend → share sheet nativo no mobile
// (manda direto no WhatsApp); no desktop baixa o arquivo e abre a conversa
// pro usuário anexar.
async function sendPdf() {
  const created = await save()
  if (!created) return
  pdfLoading.value = true
  try {
    const data = await quoteService.getPDF(created.id)
    const blob = new Blob([data], { type: 'application/pdf' })
    const file = new File([blob], `orcamento-${created.id}.pdf`, { type: 'application/pdf' })

    if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: `Orçamento #${created.id}` }).catch(() => {})
      return
    }

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `orcamento-${created.id}.pdf`
    link.click()
    URL.revokeObjectURL(url)

    if (lead.value?.phone) {
      const msg = `Olá ${firstNameOf(lead.value.name)}! Aqui é da Verly Vidraçaria 👋 Preparamos seu orçamento — segue em PDF 👇`
      window.open(buildWhatsAppUrl(lead.value.phone, msg), '_blank')
    }
  } catch {
    notification.error('Erro', 'Não foi possível gerar o PDF')
  } finally {
    pdfLoading.value = false
  }
}

// Enviar mensagem: salva → mensagem comercial estruturada com preço por item.
// Mesmo filtro do orçamento/PDF: nunca mandar pro cliente uma linha sem
// preço calculado ou uma variante que ele não escolheu.
async function sendMessage() {
  const created = await save()
  if (!created || !lead.value?.phone) return
  const message = buildRichQuoteMessage({
    customerName: lead.value.name,
    quoteId: created.id,
    items: includedRows().map((r) => ({
      qty: r.quantity || 1,
      label: itemLabel(r),
      lineTotal: (r.unitPrice || 0) * (r.quantity || 1),
    })),
    total: finalTotal.value,
    discount: finalPriceOverride.value == null ? discount.value ?? undefined : undefined,
    validityDays: created.daysUntilExpiration ?? 7,
  })
  window.open(buildWhatsAppUrl(lead.value.phone, message), '_blank')
}

onMounted(load)
</script>
