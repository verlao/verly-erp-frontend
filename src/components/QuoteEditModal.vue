<template>
  <Dialog :open="open" @update:open="onCloseDialog">
    <DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 text-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-amber-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Editar Orçamento #{{ quote?.id }}
        </DialogTitle>
      </DialogHeader>

      <div v-if="quote" class="space-y-4 py-4">
        <!-- Cliente (read-only) -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-1">Cliente</label>
          <p class="text-sm text-muted-foreground px-3 py-2 bg-muted/40 rounded-md">
            {{ customerName }}
          </p>
        </div>

        <!-- Data de expiração -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-1">
            Data de Expiração
          </label>
          <input
            v-model="expirationDate"
            type="date"
            class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        <!-- Lista de produtos -->
        <div>
          <h3 class="text-sm font-medium text-foreground mb-2">
            Produtos ({{ cart.length }})
          </h3>
          <div
            v-if="cart.length === 0"
            class="text-sm text-muted-foreground italic py-4 text-center border border-dashed border-border rounded-lg"
          >
            Nenhum produto.
          </div>
          <div
            v-else
            class="border border-border rounded-lg overflow-hidden divide-y divide-border"
          >
            <div
              v-for="item in cart"
              :key="item.product.id"
              class="flex items-center justify-between px-3 py-2 bg-card"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">
                  {{ item.product.type }} {{ item.product.sheets }}F •
                  {{ item.product.color }}
                  <span class="text-xs text-muted-foreground">
                    ({{ item.product.width }}×{{ item.product.height }}cm)
                  </span>
                </p>
                <p class="text-xs text-muted-foreground">
                  R$ {{ item.product.price?.toFixed(2) }} × {{ item.quantity }}
                </p>
              </div>
              <div class="flex items-center gap-1.5">
                <button
                  @click="setQty(item, item.quantity - 1)"
                  class="w-6 h-6 rounded border border-border text-muted-foreground hover:bg-accent text-xs"
                >
                  -
                </button>
                <span class="w-6 text-center text-sm">{{ item.quantity }}</span>
                <button
                  @click="setQty(item, item.quantity + 1)"
                  class="w-6 h-6 rounded border border-border text-muted-foreground hover:bg-accent text-xs"
                >
                  +
                </button>
                <button
                  @click="removeProduct(item)"
                  class="ml-1 w-6 h-6 rounded text-destructive hover:bg-destructive/10 text-xs"
                  title="Remover"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Buscar novo produto -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-1">
            Adicionar Produto
          </label>
          <input
            v-model="productQuery"
            type="text"
            placeholder="Buscar tipo, cor, dimensão…"
            class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            @input="onProductSearch"
          />
          <div
            v-if="searchResults.length > 0"
            class="mt-2 border border-border rounded-lg overflow-hidden divide-y divide-border"
          >
            <div
              v-for="p in searchResults"
              :key="p.id"
              class="flex items-center justify-between px-3 py-2 hover:bg-accent/30"
            >
              <p class="text-sm flex-1 truncate">
                {{ p.type }} {{ p.sheets }}F • {{ p.color }} ({{ p.width }}×{{
                  p.height
                }}cm) — R$ {{ p.price?.toFixed(2) }}
              </p>
              <button
                @click="addProduct(p)"
                class="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <!-- Observações -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-1">
            Observações
          </label>
          <textarea
            v-model="observations"
            rows="2"
            class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          ></textarea>
        </div>

        <!-- Total estimado -->
        <div class="flex justify-between border-t border-border pt-3 text-sm">
          <span class="text-muted-foreground">
            Total (será recalculado no servidor)
          </span>
          <span class="font-semibold">R$ {{ cartTotal.toFixed(2) }}</span>
        </div>
      </div>

      <div class="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t">
        <button
          @click="onCloseDialog(false)"
          :disabled="saving"
          class="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          @click="save"
          :disabled="saving || cart.length === 0"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {{ saving ? 'Salvando…' : 'Salvar' }}
        </button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Dialog from './ui/Dialog.vue'
import DialogContent from './ui/DialogContent.vue'
import DialogHeader from './ui/DialogHeader.vue'
import DialogTitle from './ui/DialogTitle.vue'
import productService, { type ProductDTO } from '../services/product'
import quoteService, { type QuoteDTO } from '../services/quote'
import { useNotification } from '../composables/useNotification'

interface CartItem {
  product: ProductDTO
  quantity: number
}

interface Props {
  open: boolean
  quote: QuoteDTO | null
  customerName?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const notification = useNotification()

const cart = ref<CartItem[]>([])
const observations = ref('')
const expirationDate = ref('')
const productQuery = ref('')
const searchResults = ref<ProductDTO[]>([])
const saving = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

// Quando o quote prop muda (modal abre com outro orçamento), recarrega cart
watch(
  () => [props.open, props.quote?.id],
  async ([isOpen]) => {
    if (!isOpen || !props.quote) return
    observations.value = props.quote.observations || ''
    expirationDate.value = (props.quote.expirationDate || '').substring(0, 10)
    productQuery.value = ''
    searchResults.value = []
    cart.value = []

    // Carrega produtos do quote — products é Record<id, qty>
    const entries = Object.entries(props.quote.products || {})
    if (entries.length === 0) return
    try {
      const fetched: CartItem[] = await Promise.all(
        entries.map(async ([id, qty]) => {
          const p: ProductDTO = await productService.getByKey(id)
          return { product: p, quantity: Number(qty) }
        })
      )
      cart.value = fetched
    } catch (err) {
      console.error('Erro ao carregar produtos do quote', err)
    }
  },
  { immediate: true }
)

function onProductSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(runSearch, 300)
}

async function runSearch() {
  const q = productQuery.value.trim()
  if (q.length < 2) {
    searchResults.value = []
    return
  }
  try {
    const res = await productService.search({ query: q, size: 6 })
    searchResults.value = res.content ?? []
  } catch {
    searchResults.value = []
  }
}

function addProduct(p: ProductDTO) {
  if (!p.id) return
  const existing = cart.value.find(c => c.product.id === p.id)
  if (existing) existing.quantity += 1
  else cart.value.push({ product: p, quantity: 1 })
  productQuery.value = ''
  searchResults.value = []
}

function setQty(item: CartItem, qty: number) {
  if (qty <= 0) {
    removeProduct(item)
    return
  }
  item.quantity = qty
}

function removeProduct(item: CartItem) {
  cart.value = cart.value.filter(c => c.product.id !== item.product.id)
}

const cartTotal = computed(() =>
  cart.value.reduce((sum, c) => sum + (c.product.price ?? 0) * c.quantity, 0)
)

async function save() {
  if (!props.quote?.id || !props.quote.customerId) return
  saving.value = true
  try {
    const products: Record<string, number> = {}
    for (const item of cart.value) {
      if (item.product.id) products[String(item.product.id)] = item.quantity
    }
    await quoteService.update(props.quote.id, {
      customerId: props.quote.customerId,
      products,
      observations: observations.value || undefined,
      expirationDate: expirationDate.value || undefined,
    })
    notification.success('Sucesso', `Orçamento #${props.quote.id} atualizado`)
    emit('saved')
    onCloseDialog(false)
  } catch (err: any) {
    notification.error(
      'Erro',
      err?.response?.data?.message || 'Falha ao atualizar orçamento'
    )
  } finally {
    saving.value = false
  }
}

function onCloseDialog(value: boolean) {
  emit('update:open', value)
}
</script>
