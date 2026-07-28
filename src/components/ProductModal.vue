<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent>
      <div class="overflow-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {{ isEditing ? 'Editar Produto' : 'Novo Produto' }}
          </DialogTitle>
        </DialogHeader>

        <form @submit.prevent="handleSubmit" class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Type -->
            <div>
              <Label for="type" class="mb-2">Tipo *</Label>
              <Select
                v-model="formData.type"
                id="type"
                placeholder="Selecione o tipo"
              >
                <SelectItem value="">Selecione o tipo</SelectItem>
                <SelectItem value="PORTA">Porta</SelectItem>
                <SelectItem value="JANELA">Janela</SelectItem>
                <SelectItem value="SACADA">Sacada</SelectItem>
                <SelectItem value="BASCULANTE">Basculante</SelectItem>
                <SelectItem value="FIXO">Fixo</SelectItem>
                <SelectItem value="BOX">Box</SelectItem>
              </Select>
            </div>

            <!-- Sheets -->
            <div>
              <Label for="sheets" class="mb-2">Folhas</Label>
              <Input
                id="sheets"
                v-model.number="formData.sheets"
                type="number"
                min="0"
                step="1"
                placeholder="Ex: 2"
              />
            </div>

            <!-- Width -->
            <div>
              <Label for="width" class="mb-2">Largura (cm)</Label>
              <Input
                id="width"
                v-model.number="formData.width"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>

            <!-- Height -->
            <div>
              <Label for="height" class="mb-2">Altura (cm)</Label>
              <Input
                id="height"
                v-model.number="formData.height"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>

            <!-- Color -->
            <div>
              <Label for="color" class="mb-2">Cor</Label>
              <Select
                v-model="formData.color"
                id="color"
                placeholder="Selecione a cor"
              >
                <SelectItem value="">Selecione a cor</SelectItem>
                <SelectItem value="INCOLOR">Incolor</SelectItem>
                <SelectItem value="VERDE">Verde</SelectItem>
                <SelectItem value="FUME">Fumê</SelectItem>
                <SelectItem value="BRONZE">Bronze</SelectItem>
              </Select>
            </div>

            <!-- Kit -->
            <div>
              <Label for="kit" class="mb-2">Kit (R$)</Label>
              <CurrencyInput
                id="kit"
                v-model="formData.kit"
                placeholder="R$ 0,00"
              />
            </div>
          </div>

          <!-- Auto-calculation Info -->
          <div class="mt-6 p-4 bg-info/10 border border-info/20 rounded-lg">
            <div class="flex items-center">
              <svg
                class="w-5 h-5 text-info mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                />
              </svg>
              <p class="text-sm text-foreground">
                O custo, preço e lucro serão calculados automaticamente com base nas configurações do sistema.
              </p>
            </div>
          </div>

          <!-- Price Info (when editing) -->
          <div
            v-if="isEditing && product && (product.price || product.priceOptions)"
            class="mt-6 p-4 bg-success/5 rounded-lg border border-success/20"
          >
            <h4 class="text-sm font-semibold text-success mb-3 flex items-center">
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
              Informações de Preço
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <!-- À Vista Dinheiro -->
              <div class="text-center p-3 bg-card rounded-lg border border-border">
                <div class="text-xs text-muted-foreground mb-1">À Vista Dinheiro</div>
                <div class="font-mono text-lg font-semibold text-success">
                  {{ formatCurrency(product.priceOptions?.cashMoney ?? product.price ?? 0) }}
                </div>
              </div>
              <!-- À Vista Cartão -->
              <div class="text-center p-3 bg-card rounded-lg border border-border">
                <div class="text-xs text-muted-foreground mb-1">À Vista Cartão</div>
                <div class="font-mono text-lg font-semibold text-success">
                  {{ formatCurrency(product.priceOptions?.cashCard ?? 0) }}
                </div>
              </div>
              <!-- Custo -->
              <div class="text-center p-3 bg-card rounded-lg border border-border">
                <div class="text-xs text-muted-foreground mb-1">Custo Total</div>
                <div class="font-mono text-lg font-semibold text-foreground">
                  {{ formatCurrency(product.cost ?? 0) }}
                </div>
              </div>
            </div>
            <!-- Parcelamentos -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="text-center p-2 bg-card rounded border border-border">
                <div class="text-xs text-muted-foreground mb-1">Parc 4x</div>
                <div class="font-mono text-sm font-semibold text-info">
                  {{ product.priceOptions?.installments4x ? formatCurrency(product.priceOptions.installments4x) : '-' }}
                </div>
              </div>
              <div class="text-center p-2 bg-card rounded border border-border">
                <div class="text-xs text-muted-foreground mb-1">Parc 6x</div>
                <div class="font-mono text-sm font-semibold text-info">
                  {{ product.priceOptions?.installments6x ? formatCurrency(product.priceOptions.installments6x) : '-' }}
                </div>
              </div>
              <div class="text-center p-2 bg-card rounded border border-border">
                <div class="text-xs text-muted-foreground mb-1">Parc 10x</div>
                <div class="font-mono text-sm font-semibold text-info">
                  {{ product.priceOptions?.installments10x ? formatCurrency(product.priceOptions.installments10x) : '-' }}
                </div>
              </div>
              <div class="text-center p-2 bg-card rounded border border-border">
                <div class="text-xs text-muted-foreground mb-1">Parc 12x</div>
                <div class="font-mono text-sm font-semibold text-info">
                  {{ product.priceOptions?.installments12x ? formatCurrency(product.priceOptions.installments12x) : '-' }}
                </div>
              </div>
            </div>
            <div class="mt-3 text-xs text-muted-foreground text-center">
              * Preços calculados automaticamente pelo backend
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-8 flex justify-end space-x-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              @click="emit('update:open', false)"
              :disabled="saving"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              :disabled="saving || !isFormValid"
            >
              <span v-if="saving" class="flex items-center">
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Salvando...
              </span>
              <span v-else>{{ isEditing ? 'Atualizar' : 'Criar' }} Produto</span>
            </Button>
          </div>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, provide } from 'vue'
import Dialog from './ui/Dialog.vue'
import DialogContent from './ui/DialogContent.vue'
import DialogHeader from './ui/DialogHeader.vue'
import DialogTitle from './ui/DialogTitle.vue'
import Label from './ui/Label.vue'
import Input from './ui/Input.vue'
import Select from './ui/Select.vue'
import SelectItem from './ui/SelectItem.vue'
import Button from './ui/Button.vue'
import CurrencyInput from './CurrencyInput.vue'
import { useCurrency } from '../composables/useCurrency'
import type { ProductDTO } from '../services/product'

const props = defineProps<{
  open: boolean
  product?: ProductDTO | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [product: ProductDTO]
}>()

const { formatCurrency } = useCurrency()

const saving = ref(false)

const isEditing = computed(() => !!props.product)

const typeLabels = {
  PORTA: 'Porta',
  JANELA: 'Janela',
  SACADA: 'Sacada',
  BASCULANTE: 'Basculante',
  FIXO: 'Fixo'
}

const colorLabels = {
  INCOLOR: 'Incolor',
  VERDE: 'Verde',
  FUME: 'Fumê',
  BRONZE: 'Bronze'
}

// Form data
const formData = ref<ProductDTO>({
  id: undefined,
  key: '',
  category: '',
  type: '',
  sheets: 0,
  accessory: 0,
  kit: 0,
  width: 0,
  height: 0,
  measure: 0,
  color: '',
  cost: 0,
  price: 0,
  profit: 0,
  laborValue: 0,
  createdDate: '',
  installments: [],
  priceOptions: {
    cashMoney: 0,
    cashCard: 0,
    installments4x: 0,
    installments6x: 0,
    installments10x: 0,
    installments12x: 0
  }
})

// Watch for product changes
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    formData.value = {
      ...newProduct,
      kit: newProduct.accessory ?? newProduct.kit ?? 0,
      accessory: newProduct.accessory ?? newProduct.kit ?? 0
    }
  } else {
    // Reset form
    formData.value = {
      id: undefined,
      key: '',
      category: '',
      type: '',
      sheets: 0,
      accessory: 0,
      kit: 0,
      width: 0,
      height: 0,
      measure: 0,
      color: '',
      cost: 0,
      price: 0,
      profit: 0,
      laborValue: 0,
      createdDate: '',
      installments: [],
      priceOptions: {
        cashMoney: 0,
        cashCard: 0,
        installments4x: 0,
        installments6x: 0,
        installments10x: 0,
        installments12x: 0
      }
    }
  }
}, { immediate: true })

// Provide emit and close functions for SelectItem components
provide('select-emit', (event: string, value: string | number) => {
  if (event === 'update:modelValue') {
    // Handle select value updates - this is handled by v-model in Select components
  }
})

provide('select-close', () => {
  // Close functionality is handled by Select component
})

// Form validation
const isFormValid = computed(() => {
  return !!formData.value.type
})

const handleSubmit = async () => {
  if (!isFormValid.value) return

  saving.value = true
  try {
    // Sync accessory with kit value
    formData.value.accessory = formData.value.kit

    emit('save', formData.value)
  } finally {
    saving.value = false
  }
}
</script>
