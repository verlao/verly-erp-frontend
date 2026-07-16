<template>
  <div class="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
    <!-- Header colapsável -->
    <button
      @click="expanded = !expanded"
      class="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors min-h-[44px]"
    >
      <div class="flex items-center gap-2">
        <span class="text-xl">📐</span>
        <div class="text-left">
          <p class="text-sm font-semibold text-foreground">
            Calculadora Rápida
          </p>
          <p class="text-xs text-muted-foreground">
            Cota preço pra dimensão fora do catálogo
          </p>
        </div>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        :class="['transition-transform', expanded ? 'rotate-180' : '']"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
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
                ? 'bg-blue-600 text-white border-blue-600'
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
                ? 'bg-blue-600 text-white border-blue-600'
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
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-background border-border text-foreground hover:bg-accent',
            ]"
          >
            <span class="w-3 h-3 rounded-full" :style="{ background: c.swatch }"></span>
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
            class="w-full px-3 py-3 min-h-[44px] border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
            class="w-full px-3 py-3 min-h-[44px] border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <!-- Botão calcular -->
      <button
        @click="calculate"
        :disabled="!canCalculate || loading"
        class="w-full min-h-[48px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-transform active:scale-95"
      >
        {{ loading ? 'Calculando…' : 'Calcular preço' }}
      </button>

      <!-- Resultado -->
      <div
        v-if="result"
        class="border border-green-200 bg-green-50 rounded-lg p-4 space-y-3"
      >
        <div class="text-center">
          <p class="text-xs text-green-700 uppercase tracking-wide">À vista</p>
          <p class="text-3xl font-bold text-green-700">
            R$ {{ result.price?.toFixed(2) }}
          </p>
        </div>

        <!-- Parcelas -->
        <div
          v-if="result.priceOptions"
          class="grid grid-cols-2 gap-2 text-sm border-t border-green-200 pt-3"
        >
          <div
            v-if="result.priceOptions.cashCard"
            class="flex justify-between"
          >
            <span class="text-green-700">À vista cartão</span>
            <span class="font-semibold text-green-800">
              R$ {{ result.priceOptions.cashCard.toFixed(2) }}
            </span>
          </div>
          <div
            v-if="result.priceOptions.installments4x"
            class="flex justify-between"
          >
            <span class="text-green-700">4x</span>
            <span class="font-semibold text-green-800">
              R$ {{ (result.priceOptions.installments4x / 4).toFixed(2) }}
            </span>
          </div>
          <div
            v-if="result.priceOptions.installments6x"
            class="flex justify-between"
          >
            <span class="text-green-700">6x</span>
            <span class="font-semibold text-green-800">
              R$ {{ (result.priceOptions.installments6x / 6).toFixed(2) }}
            </span>
          </div>
          <div
            v-if="result.priceOptions.installments10x"
            class="flex justify-between"
          >
            <span class="text-green-700">10x</span>
            <span class="font-semibold text-green-800">
              R$ {{ (result.priceOptions.installments10x / 10).toFixed(2) }}
            </span>
          </div>
          <div
            v-if="result.priceOptions.installments12x"
            class="flex justify-between"
          >
            <span class="text-green-700">12x</span>
            <span class="font-semibold text-green-800">
              R$ {{ (result.priceOptions.installments12x / 12).toFixed(2) }}
            </span>
          </div>
        </div>

        <!-- Margem (info do vendedor) -->
        <div
          class="border-t border-green-200 pt-2 flex justify-between text-xs text-green-600"
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
import productService, { type ProductDTO } from '../services/product'
import { useNotification } from '../composables/useNotification'

const notification = useNotification()

const TYPES = ['PORTA', 'JANELA', 'BOX', 'SACADA', 'BASCULANTE', 'FIXO']
const SHEETS = [1, 2, 4]
const COLORS = [
  { value: 'INCOLOR', label: 'Incolor', swatch: '#e5e7eb' },
  { value: 'VERDE', label: 'Verde', swatch: '#22c55e' },
  { value: 'FUME', label: 'Fumê', swatch: '#6b7280' },
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
