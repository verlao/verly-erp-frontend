<template>
  <div class="max-w-3xl mx-auto px-4 py-4 md:py-6">
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
        <h1 class="text-xl md:text-2xl font-semibold text-foreground">Orçamento</h1>
        <p v-if="lead" class="text-sm text-muted-foreground">{{ lead.name }} · {{ lead.phone }}</p>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center h-40 text-muted-foreground">
      Carregando…
    </div>

    <template v-else-if="lead">
      <!-- Itens editáveis -->
      <div class="space-y-3">
        <Card v-for="(row, i) in rows" :key="i" class="p-4">
          <div class="flex items-start justify-between mb-2">
            <span class="font-medium">{{ row.type || 'Item' }}</span>
            <button class="text-xs text-muted-foreground hover:text-destructive" @click="removeRow(i)">Remover</button>
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
            <label class="text-xs text-muted-foreground col-span-2">Cor
              <select v-model="row.color" class="mt-1 w-full px-2 py-1.5 border border-border rounded-md bg-background" @change="recalcRow(row)">
                <option value="INCOLOR">Incolor</option>
                <option value="FUME">Fumê</option>
                <option value="VERDE">Verde</option>
                <option value="BRONZE">Bronze</option>
              </select>
            </label>
            <div class="col-span-2 flex items-end justify-end">
              <span v-if="row.calculating" class="text-xs text-muted-foreground">calculando…</span>
              <span v-else class="text-sm font-semibold">{{ currency.formatCurrency((row.unitPrice || 0) * (row.quantity || 1)) }}</span>
            </div>
          </div>
        </Card>
      </div>

      <button class="mt-3 text-sm text-primary hover:underline" @click="addRow">+ Adicionar item</button>

      <!-- Totais + desconto -->
      <Card class="p-4 mt-4 space-y-2">
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

      <!-- Ações -->
      <div class="flex flex-col sm:flex-row gap-2 mt-4">
        <Button variant="outline" class="flex-1" :disabled="saving" @click="save()">
          {{ saving ? 'Salvando…' : 'Salvar' }}
        </Button>
        <Button class="flex-1 bg-green-600 hover:bg-green-700 text-white" :disabled="saving || !lead.phone" @click="saveAndSend()">
          Salvar e enviar no WhatsApp
        </Button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '../components/ui/Button.vue'
import Card from '../components/ui/Card.vue'
import leadService from '../services/lead'
import type { LeadDTO } from '../services/lead'
import productService from '../services/product'
import quoteService from '../services/quote'
import type { CreateQuoteFromLeadPayload } from '../services/quote'
import { buildQuoteMessage, buildWhatsAppUrl } from '../lib/whatsapp'
import { useCurrency } from '../composables/useCurrency'
import { useNotification } from '../composables/useNotification'

interface Row {
  type: string
  color: string
  sheets: number
  width: number | null
  height: number | null
  quantity: number
  unitPrice: number
  calculating: boolean
}

const route = useRoute()
const router = useRouter()
const currency = useCurrency()
const notification = useNotification()

const leadId = Number(route.params.id)
const lead = ref<LeadDTO | null>(null)
const loading = ref(true)
const saving = ref(false)
const rows = ref<Row[]>([])
const discount = ref<number | null>(null)
const finalPriceOverride = ref<number | null>(null)

// Tipos não-vidro → categoria; o resto é vidro temperado.
const NON_GLASS: Record<string, string> = { FORRO_PVC: 'PVC', PORTA_ALUMINIO: 'ALUMINIO' }
function categoryFor(type: string): string {
  return NON_GLASS[type] ?? 'VIDRO_TEMPERADO'
}

const subtotal = computed(() =>
  rows.value.reduce((sum, r) => sum + (r.unitPrice || 0) * (r.quantity || 1), 0)
)
const finalTotal = computed(() => {
  if (finalPriceOverride.value != null && finalPriceOverride.value >= 0) return finalPriceOverride.value
  return Math.max(0, subtotal.value - (discount.value || 0))
})

async function recalcRow(row: Row) {
  if (!row.type) return
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
    row.unitPrice = res?.price ?? 0
  } catch {
    row.unitPrice = 0
  } finally {
    row.calculating = false
  }
}

function addRow() {
  rows.value.push({ type: 'BOX', color: 'INCOLOR', sheets: 1, width: null, height: null, quantity: 1, unitPrice: 0, calculating: false })
}

function removeRow(i: number) {
  rows.value.splice(i, 1)
}

async function load() {
  loading.value = true
  try {
    lead.value = await leadService.getById(leadId)
    rows.value = (lead.value?.items ?? []).map((it) => ({
      type: it.productType || 'BOX',
      color: it.color || 'INCOLOR',
      sheets: it.sheets ?? 1,
      width: it.widthCm ?? null,
      height: it.heightCm ?? null,
      quantity: it.quantity ?? 1,
      unitPrice: 0,
      calculating: false,
    }))
    await Promise.all(rows.value.map((r) => recalcRow(r)))
  } catch {
    notification.error('Erro', 'Não foi possível carregar o lead')
  } finally {
    loading.value = false
  }
}

function buildPayload(): CreateQuoteFromLeadPayload {
  return {
    leadId,
    items: rows.value.map((r) => ({
      type: r.type,
      category: categoryFor(r.type),
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

async function save(): Promise<{ id: number } | null> {
  if (rows.value.length === 0) {
    notification.warning('Atenção', 'Adicione ao menos um item')
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

async function saveAndSend() {
  const created = await save()
  if (!created || !lead.value?.phone) return
  const message = buildQuoteMessage({
    customerName: lead.value.name,
    quoteId: created.id,
    items: rows.value.map((r) => ({
      qty: r.quantity,
      label: `${r.type} ${r.width || ''}×${r.height || ''}${r.color && r.color !== 'INCOLOR' ? ' ' + r.color : ''}`.trim(),
    })),
    total: finalTotal.value,
  })
  window.open(buildWhatsAppUrl(lead.value.phone, message), '_blank')
}

onMounted(load)
</script>
