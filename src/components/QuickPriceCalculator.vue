<template>
  <div class="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
    <!-- Header colapsável -->
    <button
      @click="expanded = !expanded"
      class="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors min-h-[44px]"
    >
      <div class="flex items-center gap-2">
        <span class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Ruler class="w-4 h-4 text-muted-foreground" />
        </span>
        <div class="text-left">
          <p class="text-sm font-semibold text-foreground">
            Calculadora Rápida
          </p>
          <p class="text-xs text-muted-foreground">
            Cota preço pra dimensão fora do catálogo
          </p>
        </div>
      </div>
      <ChevronDown
        class="w-5 h-5 text-muted-foreground transition-transform"
        :class="expanded && 'rotate-180'"
      />
    </button>

    <!-- Body -->
    <div v-if="expanded" class="border-t border-border p-4 space-y-4">
      <!-- Tipo -->
      <div>
        <label class="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Tipo
        </label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="t in TYPES"
            :key="t"
            @click="state.type = t"
            :class="[
              'min-h-[44px] px-2 py-2 rounded-md text-sm font-medium border transition-all active:scale-95',
              state.type === t
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-border text-foreground hover:bg-accent',
            ]"
          >
            {{ t }}
          </button>
        </div>
      </div>

      <!-- Folhas -->
      <div>
        <label class="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Folhas
        </label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="s in SHEETS"
            :key="s"
            @click="state.sheets = s"
            :class="[
              'min-h-[44px] rounded-md text-sm font-medium border transition-all active:scale-95',
              state.sheets === s
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-border text-foreground hover:bg-accent',
            ]"
          >
            {{ s }} {{ s === 1 ? 'folha' : 'folhas' }}
          </button>
        </div>
      </div>

      <!-- Cor -->
      <div>
        <label class="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Cor
        </label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="c in COLORS"
            :key="c.value"
            @click="state.color = c.value"
            :class="[
              'min-h-[44px] flex items-center justify-center gap-2 rounded-md text-sm font-medium border transition-all active:scale-95',
              state.color === c.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-border text-foreground hover:bg-accent',
            ]"
          >
            <span class="w-3 h-3 rounded-full" :style="glassSwatchStyle(c.value)"></span>
            {{ c.label }}
          </button>
        </div>
      </div>

      <!-- Dimensões -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Largura (cm)
          </label>
          <input
            v-model.number="state.width"
            type="number"
            inputmode="numeric"
            placeholder="180"
            min="0"
            class="w-full px-3 py-3 min-h-[44px] border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Altura (cm)
          </label>
          <input
            v-model.number="state.height"
            type="number"
            inputmode="numeric"
            placeholder="210"
            min="0"
            class="w-full px-3 py-3 min-h-[44px] border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <!-- Botão calcular -->
      <Button
        class="w-full min-h-[48px] active:scale-95"
        :disabled="!canCalculate || loading"
        @click="calculate"
      >
        {{ loading ? 'Calculando…' : 'Calcular preço' }}
      </Button>

      <!-- Resultado -->
      <div
        v-if="result"
        class="border border-success/30 bg-success/10 rounded-lg p-4 space-y-3"
      >
        <div class="text-center">
          <p class="text-xs text-muted-foreground uppercase tracking-wide">À vista</p>
          <p class="text-3xl font-bold text-success">
            R$ {{ result.price?.toFixed(2) }}
          </p>
        </div>

        <!-- Parcelas -->
        <div
          v-if="result.priceOptions"
          class="grid grid-cols-2 gap-2 text-sm border-t border-success/30 pt-3"
        >
          <div
            v-if="result.priceOptions.cashCard"
            class="flex justify-between"
          >
            <span class="text-muted-foreground">À vista cartão</span>
            <span class="font-semibold text-success">
              R$ {{ result.priceOptions.cashCard.toFixed(2) }}
            </span>
          </div>
          <div
            v-if="result.priceOptions.installments4x"
            class="flex justify-between"
          >
            <span class="text-muted-foreground">4x</span>
            <span class="font-semibold text-success">
              R$ {{ (result.priceOptions.installments4x / 4).toFixed(2) }}
            </span>
          </div>
          <div
            v-if="result.priceOptions.installments6x"
            class="flex justify-between"
          >
            <span class="text-muted-foreground">6x</span>
            <span class="font-semibold text-success">
              R$ {{ (result.priceOptions.installments6x / 6).toFixed(2) }}
            </span>
          </div>
          <div
            v-if="result.priceOptions.installments10x"
            class="flex justify-between"
          >
            <span class="text-muted-foreground">10x</span>
            <span class="font-semibold text-success">
              R$ {{ (result.priceOptions.installments10x / 10).toFixed(2) }}
            </span>
          </div>
          <div
            v-if="result.priceOptions.installments12x"
            class="flex justify-between"
          >
            <span class="text-muted-foreground">12x</span>
            <span class="font-semibold text-success">
              R$ {{ (result.priceOptions.installments12x / 12).toFixed(2) }}
            </span>
          </div>
        </div>

        <!-- Margem (info do vendedor) -->
        <div
          class="border-t border-success/30 pt-2 flex justify-between text-xs text-muted-foreground"
        >
          <span>Custo R$ {{ result.cost?.toFixed(2) }}</span>
          <span>Lucro R$ {{ result.profit?.toFixed(2) }}</span>
          <span v-if="result.gainValue">Margem {{ result.gainValue }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown, Ruler } from 'lucide-vue-next'
import Button from './ui/Button.vue'
import productService, { type ProductDTO } from '../services/product'
import { glassSwatchStyle } from '../lib/productDisplay'
import { useNotification } from '../composables/useNotification'

const notification = useNotification()

const TYPES = ['PORTA', 'JANELA', 'BOX', 'SACADA', 'BASCULANTE', 'FIXO']
const SHEETS = [1, 2, 4]
const COLORS = [
  { value: 'INCOLOR', label: 'Incolor' },
  { value: 'VERDE', label: 'Verde' },
  { value: 'FUME', label: 'Fumê' },
]

const expanded = ref(false)
const loading = ref(false)
const result = ref<ProductDTO | null>(null)

const state = ref({
  type: 'PORTA',
  sheets: 2,
  color: 'INCOLOR',
  width: undefined as number | undefined,
  height: undefined as number | undefined,
})

const canCalculate = computed(
  () =>
    !!state.value.type &&
    !!state.value.color &&
    !!state.value.sheets &&
    !!state.value.width &&
    !!state.value.height &&
    (state.value.width ?? 0) > 0 &&
    (state.value.height ?? 0) > 0
)

async function calculate() {
  if (!canCalculate.value) return
  loading.value = true
  result.value = null
  try {
    const calc = await productService.calculate({
      category: 'VIDRO_TEMPERADO',
      type: state.value.type,
      color: state.value.color,
      sheets: state.value.sheets,
      width: state.value.width,
      height: state.value.height,
      // Dimensão fora do catálogo → custo de vidro NÃO-padrão.
      standard: false,
    })
    result.value = calc
  } catch (err: any) {
    notification.error(
      'Erro',
      err?.response?.data?.message || 'Falha ao calcular preço'
    )
  } finally {
    loading.value = false
  }
}
</script>
