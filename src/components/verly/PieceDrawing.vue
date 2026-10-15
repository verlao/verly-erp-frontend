<script setup lang="ts">
import { computed, useId } from 'vue'

const props = defineProps<{ widthCm: number; heightCm: number; label?: string }>()
const captionId = useId()
const valid = computed(() => Number.isFinite(props.widthCm) && Number.isFinite(props.heightCm) && props.widthCm > 0 && props.heightCm > 0)
const displayLabel = computed(() => props.label?.trim() || 'Peça de vidro')
const formatMeasure = (value: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 20 }).format(value)
const dimensions = computed(() => valid.value ? `${formatMeasure(props.widthCm)} × ${formatMeasure(props.heightCm)} cm` : 'Medidas indisponíveis')
const accessibleCaption = computed(() => `${displayLabel.value}: ${dimensions.value}`)
</script>

<template>
  <figure class="verly-piece" :aria-labelledby="captionId">
    <svg class="verly-piece__drawing" viewBox="0 0 320 220" role="img" :aria-label="accessibleCaption">
      <template v-if="valid">
        <rect x="79" y="42" width="162" height="132" rx="2" fill="#e5f2f0" stroke="#2e7d7a" stroke-width="3" />
        <path d="M79 31v-9M241 31v-9M69 42h-9M69 174h-9" stroke="#f2b705" stroke-width="1.5" />
        <path d="M79 26h162m-6-5 6 5-6 5m-150-5-6-5m0 5 6 5M64 42v132m-5-6 5 6 5-6m-5-120-5 6m5-6 5 6" fill="none" stroke="#f2b705" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M78 174h164" stroke="#f2b705" stroke-width="3" />
        <text x="160" y="16" text-anchor="middle" class="verly-piece__label">{{ formatMeasure(widthCm) }} cm</text>
        <text x="22" y="112" text-anchor="middle" class="verly-piece__label" transform="rotate(-90 22 112)">{{ formatMeasure(heightCm) }} cm</text>
      </template>
      <text v-else x="160" y="116" text-anchor="middle" class="verly-piece__empty">Medidas indisponíveis</text>
    </svg>
    <figcaption :id="captionId">{{ accessibleCaption }}</figcaption>
  </figure>
</template>

<style scoped>
.verly-piece { margin: 0; width: 100%; max-width: 360px; color: var(--color-verly-ink); font-family: var(--font-verly-body); }
.verly-piece__drawing { display: block; width: 100%; height: auto; overflow: visible; }
.verly-piece__label, .verly-piece__empty { fill: var(--color-verly-ink); font: 600 15px var(--font-verly-mono); }
.verly-piece figcaption { margin-top: 8px; color: var(--color-verly-ink); font-size: 17px; line-height: 1.35; }
</style>
