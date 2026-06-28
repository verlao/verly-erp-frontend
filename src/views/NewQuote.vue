<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-semibold text-foreground">Novo Orçamento</h1>
        <p class="text-muted-foreground mt-1">Crie um orçamento em 3 passos</p>
      </div>

      <!-- Stepper -->
      <ol class="flex items-center w-full mb-8 text-sm">
        <li
          v-for="(label, i) in stepLabels"
          :key="i"
          :class="[
            'flex items-center',
            i < stepLabels.length - 1 ? 'flex-1' : '',
          ]"
        >
          <span
            :class="[
              'flex items-center justify-center w-8 h-8 rounded-full border shrink-0',
              step > i + 1
                ? 'bg-green-600 border-green-600 text-white'
                : step === i + 1
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-background border-border text-muted-foreground',
            ]"
          >
            <svg
              v-if="step > i + 1"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span v-else>{{ i + 1 }}</span>
          </span>
          <span
            :class="[
              'ml-2 hidden sm:inline',
              step === i + 1 ? 'font-medium text-foreground' : 'text-muted-foreground',
            ]"
            >{{ label }}</span
          >
          <span
            v-if="i < stepLabels.length - 1"
            class="flex-1 h-px bg-border mx-2 sm:mx-4"
          ></span>
        </li>
      </ol>

      <!-- ============ STEP 1: CLIENTE ============ -->
      <section
        v-if="step === 1"
        class="bg-card rounded-lg shadow-sm border border-border p-6 space-y-4"
      >
        <h2 class="text-lg font-medium text-foreground">Cliente</h2>
        <div>
          <label class="block text-sm font-medium text-foreground mb-1">Telefone</label>
          <div class="flex gap-2">
            <input
              v-model="phoneInput"
              type="tel"
              placeholder="(11) 99999-9999"
              :disabled="phoneSearchLoading"
              class="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              @input="onPhoneInput"
              @keyup.enter="searchByPhone"
            />
            <button
              @click="searchByPhone"
              :disabled="phoneSearchLoading || !phoneDigits"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
            >
              {{ phoneSearchLoading ? 'Buscando…' : 'Buscar' }}
            </button>
          </div>
        </div>

        <!-- Cliente encontrado -->
        <div
          v-if="customer && !showCreateForm"
          class="border border-green-200 bg-green-50 rounded-lg p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-green-800 font-semibold">{{ customer.name }}</p>
              <p class="text-xs text-green-700">
                {{ customer.phoneOne || '-' }}
                <span v-if="customer.cpf"> • CPF {{ customer.cpf }}</span>
              </p>
            </div>
            <button
              @click="resetCustomer"
              class="text-xs text-green-700 hover:text-green-900 underline"
            >
              Trocar
            </button>
          </div>
        </div>

        <!-- Form criar cliente -->
        <div
          v-if="showCreateForm"
          class="border border-blue-200 bg-blue-50/50 rounded-lg p-4 space-y-3"
        >
          <p class="text-sm text-foreground">
            Cliente com telefone <strong>{{ phoneInput }}</strong> não encontrado. Criar
            novo:
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-foreground mb-1">Nome *</label>
              <input
                v-model="newCustomer.name"
                type="text"
                class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-foreground mb-1">
                CPF
                <span class="text-muted-foreground font-normal">(opcional, p/ nota fiscal)</span>
              </label>
              <input
                v-model="newCustomer.cpf"
                type="text"
                placeholder="000.000.000-00"
                class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                @input="onCpfInput"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-foreground mb-1">
                CNPJ
                <span class="text-muted-foreground font-normal">(opcional, pessoa jurídica)</span>
              </label>
              <input
                v-model="newCustomer.cnpj"
                type="text"
                placeholder="00.000.000/0000-00"
                class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                @input="onCnpjInput"
              />
            </div>
          </div>

          <!-- Endereço (com busca de logradouro RJ pelo BE) -->
          <div class="border-t border-blue-200 pt-3 mt-3">
            <p class="text-xs font-medium text-foreground mb-2">
              Endereço
              <span class="text-muted-foreground font-normal">
                (digite o CEP, ou pesquise pela rua se não souber)
              </span>
            </p>
            <AddressForm
              v-model="newAddress"
              :enable-street-search="true"
              default-uf="RJ"
            />
          </div>

          <div class="flex gap-2">
            <button
              @click="createCustomer"
              :disabled="creatingCustomer || !newCustomer.name"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
            >
              {{ creatingCustomer ? 'Criando…' : 'Criar Cliente' }}
            </button>
            <button
              @click="resetCustomer"
              class="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button
            @click="step = 2"
            :disabled="!customer"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium"
          >
            Continuar →
          </button>
        </div>
      </section>

      <!-- ============ STEP 2: PRODUTOS ============ -->
      <section
        v-if="step === 2"
        class="bg-card rounded-lg shadow-sm border border-border p-6 space-y-4"
      >
        <h2 class="text-lg font-medium text-foreground">Produtos</h2>

        <!-- Busca -->
        <div>
          <input
            v-model="productQuery"
            type="text"
            placeholder="Buscar produtos por tipo, cor ou dimensão…"
            class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            @input="onProductSearch"
          />
        </div>

        <!-- Resultados -->
        <div
          v-if="searchResults.length > 0"
          class="border border-border rounded-lg overflow-hidden"
        >
          <div
            v-for="p in searchResults"
            :key="p.id"
            class="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0 hover:bg-accent/30"
          >
            <div class="flex-1">
              <p class="text-sm font-medium text-foreground">
                {{ p.type }} {{ p.sheets }}F • {{ p.color }}
                <span class="text-muted-foreground">
                  ({{ p.width }}×{{ p.height }}cm)
                </span>
              </p>
              <p class="text-xs text-muted-foreground">
                R$ {{ p.price?.toFixed(2) }}
              </p>
            </div>
            <button
              @click="addProduct(p)"
              class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
            >
              + Adicionar
            </button>
          </div>
        </div>
        <p
          v-else-if="productQuery.length >= 2 && !productSearchLoading"
          class="text-sm text-muted-foreground"
        >
          Nenhum produto encontrado.
        </p>

        <!-- Carrinho -->
        <div v-if="cart.length > 0" class="pt-2">
          <h3 class="text-sm font-medium text-foreground mb-2">
            Selecionados ({{ cart.length }})
          </h3>
          <div class="border border-border rounded-lg overflow-hidden">
            <div
              v-for="item in cart"
              :key="item.product.id"
              class="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0 bg-blue-50/40"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-foreground truncate">
                  {{ item.product.type }} {{ item.product.sheets }}F •
                  {{ item.product.color }}
                </p>
                <p class="text-xs text-muted-foreground">
                  R$ {{ item.product.price?.toFixed(2) }} × {{ item.quantity }} = R$
                  {{ ((item.product.price ?? 0) * item.quantity).toFixed(2) }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="updateQty(item, item.quantity - 1)"
                  class="w-7 h-7 rounded border border-border text-muted-foreground hover:bg-accent"
                >
                  -
                </button>
                <span class="w-8 text-center text-sm">{{ item.quantity }}</span>
                <button
                  @click="updateQty(item, item.quantity + 1)"
                  class="w-7 h-7 rounded border border-border text-muted-foreground hover:bg-accent"
                >
                  +
                </button>
                <button
                  @click="removeProduct(item)"
                  class="ml-1 w-7 h-7 rounded text-destructive hover:bg-destructive/10"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
          <p class="mt-2 text-sm text-right text-foreground font-medium">
            Total: R$ {{ cartTotal.toFixed(2) }}
          </p>
        </div>

        <div ref="reviewActionsRef" class="flex justify-between pt-2">
          <button
            @click="step = 1"
            class="px-6 py-2 text-muted-foreground hover:text-foreground"
          >
            ← Voltar
          </button>
          <button
            @click="step = 3"
            :disabled="cart.length === 0"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium"
          >
            Revisar →
          </button>
        </div>
      </section>

      <!-- ============ STEP 3: REVISÃO / GERAÇÃO ============ -->
      <section
        v-if="step === 3"
        class="bg-card rounded-lg shadow-sm border border-border p-6 space-y-4"
      >
        <h2 class="text-lg font-medium text-foreground">Revisão</h2>

        <div class="space-y-3">
          <div class="border border-border rounded-lg p-4">
            <p class="text-xs text-muted-foreground uppercase tracking-wide">Cliente</p>
            <p class="text-sm font-medium text-foreground">{{ customer?.name }}</p>
            <p class="text-xs text-muted-foreground">{{ customer?.phoneOne }}</p>
          </div>

          <div class="border border-border rounded-lg overflow-hidden">
            <div class="px-4 py-2 bg-muted text-xs text-muted-foreground uppercase tracking-wide">
              Itens ({{ cart.length }})
            </div>
            <div
              v-for="item in cart"
              :key="item.product.id"
              class="px-4 py-2 border-b border-border last:border-b-0 text-sm flex justify-between"
            >
              <span class="text-foreground">
                {{ item.quantity }}× {{ item.product.type }}
                {{ item.product.sheets }}F • {{ item.product.color }}
              </span>
              <span class="text-foreground font-medium">
                R$ {{ ((item.product.price ?? 0) * item.quantity).toFixed(2) }}
              </span>
            </div>
            <div class="px-4 py-3 bg-blue-50/40 flex justify-between font-semibold">
              <span>Total</span>
              <span>R$ {{ cartTotal.toFixed(2) }}</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-foreground mb-1">
              Observações (opcional)
            </label>
            <textarea
              v-model="observations"
              rows="2"
              class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            ></textarea>
          </div>
        </div>

        <!-- Antes de gerar -->
        <div v-if="!createdQuoteId" class="flex justify-between pt-2">
          <button
            @click="step = 2"
            class="px-6 py-2 text-muted-foreground hover:text-foreground"
          >
            ← Voltar
          </button>
          <button
            @click="submitQuote"
            :disabled="submitting"
            class="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium"
          >
            {{ submitting ? 'Gerando…' : 'Gerar Orçamento' }}
          </button>
        </div>

        <!-- Depois de gerar: ações de share -->
        <div
          v-else
          class="border border-green-200 bg-green-50 rounded-lg p-4 space-y-3"
        >
          <p class="text-sm font-semibold text-green-800">
            ✓ Orçamento #{{ createdQuoteId }} criado com sucesso
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              @click="downloadPdf"
              :disabled="pdfLoading"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
            >
              📄 {{ pdfLoading ? 'Baixando…' : 'Baixar PDF' }}
            </button>
            <button
              @click="openWhatsApp"
              class="px-4 py-2 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-lg text-sm font-medium"
            >
              💬 Enviar via WhatsApp
            </button>
            <button
              @click="resetWizard"
              class="px-4 py-2 border border-border hover:bg-accent text-foreground rounded-lg text-sm font-medium"
            >
              🔁 Novo Orçamento
            </button>
          </div>
          <p class="text-xs text-muted-foreground">
            O WhatsApp abre com mensagem pronta. Baixe o PDF e anexe no chat.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import customerService, { type AddressDTO, type CustomerDTO } from '../services/customer'
import productService, { type ProductDTO } from '../services/product'
import quoteService from '../services/quote'
import { useNotification } from '../composables/useNotification'
import { maskCpf, maskCnpj, maskPhone } from '../lib/masks'
import { buildWhatsAppUrl, buildQuoteMessage } from '../lib/whatsapp'
import AddressForm from '../components/AddressForm.vue'

interface CartItem {
  product: ProductDTO
  quantity: number
}

const notification = useNotification()
const stepLabels = ['Cliente', 'Produtos', 'Revisão']
const step = ref<1 | 2 | 3>(1)

// ===== STEP 1: cliente =====
const phoneInput = ref('')
const phoneSearchLoading = ref(false)
const customer = ref<CustomerDTO | null>(null)
const showCreateForm = ref(false)
const newCustomer = ref<{ name: string; cpf?: string; cnpj?: string }>({
  name: '',
  cpf: '',
  cnpj: '',
})
const newAddress = ref<AddressDTO>({ isPrimary: true })
const creatingCustomer = ref(false)

const phoneDigits = computed(() => phoneInput.value.replace(/\D/g, ''))

function onPhoneInput(e: Event) {
  const target = e.target as HTMLInputElement
  phoneInput.value = maskPhone(target.value)
}

function onCpfInput(e: Event) {
  const target = e.target as HTMLInputElement
  newCustomer.value.cpf = maskCpf(target.value)
}

function onCnpjInput(e: Event) {
  const target = e.target as HTMLInputElement
  newCustomer.value.cnpj = maskCnpj(target.value)
}

async function searchByPhone() {
  if (!phoneDigits.value) return
  phoneSearchLoading.value = true
  customer.value = null
  showCreateForm.value = false
  try {
    const found = await customerService.findByPhone(phoneInput.value)
    if (found) {
      customer.value = found
    } else {
      showCreateForm.value = true
    }
  } catch (err: any) {
    notification.error('Erro', err?.response?.data?.message || 'Falha ao buscar cliente')
  } finally {
    phoneSearchLoading.value = false
  }
}

async function createCustomer() {
  creatingCustomer.value = true
  try {
    // BE retorna 201 sem body, então recuperamos o cliente recém-criado via phone
    // Envia address apenas se algum campo foi preenchido
    const hasAddress = !!(
      newAddress.value.cep ||
      newAddress.value.logradouro ||
      newAddress.value.bairro ||
      newAddress.value.localidade
    )
    await customerService.create({
      name: newCustomer.value.name,
      cpf: newCustomer.value.cpf || undefined,
      cnpj: newCustomer.value.cnpj || undefined,
      phoneOne: phoneInput.value,
      addresses: hasAddress ? [{ ...newAddress.value, isPrimary: true }] : undefined,
    })
    const fetched = await customerService.findByPhone(phoneInput.value)
    if (!fetched) {
      throw new Error('Cliente foi criado mas não retornou da busca')
    }
    customer.value = fetched
    showCreateForm.value = false
    notification.success('Sucesso', 'Cliente criado')
  } catch (err: any) {
    notification.error(
      'Erro',
      err?.response?.data?.message || err?.message || 'Falha ao criar cliente'
    )
  } finally {
    creatingCustomer.value = false
  }
}

function resetCustomer() {
  customer.value = null
  showCreateForm.value = false
  newCustomer.value = { name: '', cpf: '', cnpj: '' }
  newAddress.value = { isPrimary: true }
}

// ===== STEP 2: produtos =====
const productQuery = ref('')
const productSearchLoading = ref(false)
const searchResults = ref<ProductDTO[]>([])
const cart = ref<CartItem[]>([])
const reviewActionsRef = ref<HTMLElement | null>(null)
let searchTimer: ReturnType<typeof setTimeout> | null = null

function onProductSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(runProductSearch, 300)
}

async function runProductSearch() {
  const q = productQuery.value.trim()
  if (q.length < 2) {
    searchResults.value = []
    return
  }
  productSearchLoading.value = true
  try {
    const res = await productService.search({ query: q, size: 8 })
    searchResults.value = res.content ?? []
  } catch {
    searchResults.value = []
  } finally {
    productSearchLoading.value = false
  }
}

function addProduct(p: ProductDTO) {
  if (!p.id) return
  const existing = cart.value.find(c => c.product.id === p.id)
  if (existing) {
    existing.quantity += 1
  } else {
    cart.value.push({ product: p, quantity: 1 })
  }
  // Scroll suave pro botão "Revisar →" — inclui o carrinho inteiro na viewport
  // (especialmente útil em mobile pra usuário ver item adicionado + ação seguinte)
  nextTick(() => {
    reviewActionsRef.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  })
}

function updateQty(item: CartItem, qty: number) {
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

// ===== STEP 3: gerar orçamento =====
const observations = ref('')
const submitting = ref(false)
const createdQuoteId = ref<number | null>(null)
const pdfLoading = ref(false)

async function submitQuote() {
  if (!customer.value?.id || cart.value.length === 0) return
  submitting.value = true
  try {
    const products: Record<string, number> = {}
    for (const item of cart.value) {
      if (item.product.id) products[String(item.product.id)] = item.quantity
    }
    const created = await quoteService.create({
      customerId: customer.value.id,
      products,
      observations: observations.value || undefined,
    })
    createdQuoteId.value = created?.id ?? null
    notification.success('Sucesso', `Orçamento #${createdQuoteId.value} gerado`)

    // Auto-abre WhatsApp com mensagem pronta. Browser pode bloquear popup
    // se delay for grande; rodamos sem await após o success do POST.
    if (createdQuoteId.value && customer.value?.phoneOne) {
      openWhatsApp()
    }
  } catch (err: any) {
    notification.error(
      'Erro',
      err?.response?.data?.message || 'Falha ao gerar orçamento'
    )
  } finally {
    submitting.value = false
  }
}

async function downloadPdf() {
  if (!createdQuoteId.value) return
  pdfLoading.value = true
  try {
    const data = await quoteService.getPDF(createdQuoteId.value)
    const blob = new Blob([data], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `orcamento-${createdQuoteId.value}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (err: any) {
    notification.error('Erro', err?.response?.data?.message || 'Falha ao gerar PDF')
  } finally {
    pdfLoading.value = false
  }
}

function openWhatsApp() {
  if (!customer.value || !createdQuoteId.value || !customer.value.phoneOne) return
  const message = buildQuoteMessage({
    customerName: customer.value.name,
    quoteId: createdQuoteId.value,
    items: cart.value.map(i => ({
      qty: i.quantity,
      label: `${i.product.type} ${i.product.sheets}F ${i.product.color}`,
    })),
    total: cartTotal.value,
  })
  const url = buildWhatsAppUrl(customer.value.phoneOne, message)
  window.open(url, '_blank', 'noopener,noreferrer')
}

function resetWizard() {
  step.value = 1
  phoneInput.value = ''
  customer.value = null
  showCreateForm.value = false
  newCustomer.value = { name: '', cpf: '', cnpj: '' }
  newAddress.value = { isPrimary: true }
  productQuery.value = ''
  searchResults.value = []
  cart.value = []
  observations.value = ''
  createdQuoteId.value = null
}
</script>
