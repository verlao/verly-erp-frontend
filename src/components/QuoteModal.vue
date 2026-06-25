<template>
  <Dialog :open="isOpen" @update:open="handleClose">
    <DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 text-xl">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
          </svg>
          Criar Orçamento
        </DialogTitle>
      </DialogHeader>

      <div class="space-y-6 py-4">
        <!-- Seleção de Cliente -->
        <div class="space-y-2">
          <Label for="customer" class="text-sm font-medium">
            Cliente <span class="text-red-500">*</span>
          </Label>
          <select
            id="customer"
            v-model="selectedCustomerId"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          >
            <option value="">Selecione um cliente...</option>
            <option
              v-for="customer in customers"
              :key="customer.id"
              :value="customer.id"
            >
              {{ customer.name }}{{ customer.cpf ? ' - ' + formatCPF(customer.cpf) : '' }}
            </option>
          </select>
        </div>

        <!-- Data de Expiração -->
        <div class="space-y-2">
          <Label for="expiration" class="text-sm font-medium">
            Data de Expiração
          </Label>
          <input
            id="expiration"
            v-model="expirationDate"
            type="date"
            :min="today"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <p class="text-xs text-muted-foreground">
            Padrão: {{ defaultExpiryDays }} dias a partir de hoje
          </p>
        </div>

        <!-- Observações -->
        <div class="space-y-2">
          <Label for="observations" class="text-sm font-medium">
            Observações (Opcional)
          </Label>
          <textarea
            id="observations"
            v-model="observations"
            rows="3"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            placeholder="Adicione observações sobre este orçamento..."
          ></textarea>
        </div>

        <!-- Lista de Produtos Selecionados -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold">Produtos Selecionados</h3>
            <span class="text-sm text-muted-foreground">
              {{ products.length }} {{ products.length === 1 ? 'produto' : 'produtos' }}
            </span>
          </div>
          
          <div class="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3 bg-muted/30">
            <div
              v-for="product in products"
              :key="product.id"
              class="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:border-blue-300 transition-colors"
            >
              <div class="flex-1 space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-sm">
                    {{ product.type }} - {{ product.color }}
                  </span>
                  <span
                    v-if="product.sheets"
                    class="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full"
                  >
                    {{ product.sheets }} {{ product.sheets === 1 ? 'folha' : 'folhas' }}
                  </span>
                </div>
                <p class="text-xs text-muted-foreground">
                  {{ product.width }}x{{ product.height }}cm
                  <span v-if="product.measure">({{ product.measure.toFixed(2) }}m²)</span>
                </p>
              </div>
              <div class="text-right space-y-0.5">
                <p class="font-semibold text-green-600">
                  R$ {{ (product.price || 0).toFixed(2) }}
                </p>
                <p class="text-xs text-muted-foreground">
                  Custo: R$ {{ (product.cost || 0).toFixed(2) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Totais Estimados -->
        <div class="border-t pt-4 space-y-2 bg-muted/20 -mx-6 px-6 py-4">
          <p class="text-xs text-muted-foreground mb-2">
            * Os valores finais serão recalculados pelo sistema no momento da criação
          </p>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Custo Total Estimado:</span>
            <span class="font-medium">R$ {{ totalCost.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Preço Total Estimado:</span>
            <span class="font-semibold text-lg text-green-600">
              R$ {{ totalPrice.toFixed(2) }}
            </span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Lucro Estimado:</span>
            <span class="font-medium text-blue-600">
              R$ {{ (totalPrice - totalCost).toFixed(2) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t">
        <button
          @click="handleClose"
          :disabled="loading"
          class="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          @click="handleCreate"
          :disabled="!canSubmit || loading"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg
            v-if="loading"
            class="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Criando...' : 'Criar Orçamento' }}
        </button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Dialog from './ui/Dialog.vue'
import DialogContent from './ui/DialogContent.vue'
import DialogHeader from './ui/DialogHeader.vue'
import DialogTitle from './ui/DialogTitle.vue'
import Label from './ui/Label.vue'
import customerService, { type CustomerDTO } from '../services/customer'
import quoteService, { type QuoteDTO } from '../services/quote'
import type { ProductDTO } from '../services/product'
import { useNotification } from '../composables/useNotification'

const props = defineProps<{
  isOpen: boolean
  products: ProductDTO[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const { success: showSuccess, error: showError } = useNotification()

const customers = ref<CustomerDTO[]>([])
const selectedCustomerId = ref<number | ''>('')
const loading = ref(false)
const observations = ref('')

// Datas
const today = new Date().toISOString().split('T')[0]
const defaultExpiryDays = 15

const defaultExpiry = new Date()
defaultExpiry.setDate(defaultExpiry.getDate() + defaultExpiryDays)
const expirationDate = ref(defaultExpiry.toISOString().split('T')[0])

// Totais estimados
const totalCost = computed(() => 
  props.products.reduce((sum, p) => sum + (p.cost || 0), 0)
)

const totalPrice = computed(() => 
  props.products.reduce((sum, p) => sum + (p.price || 0), 0)
)

const canSubmit = computed(() => 
  selectedCustomerId.value !== '' && props.products.length > 0
)

// Funções
function formatCPF(cpf: string): string {
  if (!cpf) return ''
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

async function loadCustomers() {
  try {
    customers.value = await customerService.getAllNonPaginated()
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
    showError('Erro', 'Não foi possível carregar a lista de clientes')
  }
}

async function handleCreate() {
  if (!canSubmit.value) return
  
  loading.value = true
  try {
    // Montar o Map de produtos: { "productId": quantity }
    const productsMap: Record<string, number> = {}
    props.products.forEach(product => {
      if (product.id) {
        productsMap[product.id.toString()] = 1  // Quantidade padrão: 1
      }
    })

    const quoteData: QuoteDTO = {
      customerId: Number(selectedCustomerId.value),
      products: productsMap,
      expirationDate: `${expirationDate.value}T23:59:59`,
      status: 'VALID',
      observations: observations.value.trim() || undefined
    }

    await quoteService.create(quoteData)
    showSuccess('Sucesso', 'Orçamento criado com sucesso!')
    emit('success')
  } catch (error: any) {
    console.error('Erro ao criar orçamento:', error)
    const errorMessage = error.response?.data?.message || 
                        error.response?.data || 
                        'Não foi possível criar o orçamento'
    showError('Erro ao criar orçamento', errorMessage)
  } finally {
    loading.value = false
  }
}

function handleClose() {
  if (loading.value) return
  emit('close')
}

function resetForm() {
  selectedCustomerId.value = ''
  observations.value = ''
  const newExpiry = new Date()
  newExpiry.setDate(newExpiry.getDate() + defaultExpiryDays)
  expirationDate.value = newExpiry.toISOString().split('T')[0]
}

// Watchers
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadCustomers()
    resetForm()
  }
})

onMounted(() => {
  if (props.isOpen) {
    loadCustomers()
  }
})
</script>

