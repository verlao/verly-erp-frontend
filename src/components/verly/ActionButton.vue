<script setup lang="ts">
import { computed, useAttrs, useId } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  disabled?: boolean
  disabledReason?: string
  variant?: 'primary' | 'secondary'
  type?: 'button' | 'submit' | 'reset'
}>(), {
  disabled: false,
  variant: 'primary',
  type: 'button',
})

const attrs = useAttrs()
const reasonId = useId()
const isDisabled = computed(() => props.disabled || Boolean(props.disabledReason))
const describedBy = computed(() => [attrs['aria-describedby'], props.disabledReason ? reasonId : undefined].filter(Boolean).join(' ') || undefined)
</script>

<template>
  <span class="verly-action-wrap">
    <button
      v-bind="attrs"
      :type="type"
      :disabled="isDisabled"
      :aria-describedby="describedBy"
      class="verly-action-button"
      :class="`verly-action-button--${variant}`"
    >
      <slot />
    </button>
    <span v-if="disabledReason" :id="reasonId" class="verly-action-reason">{{ disabledReason }}</span>
  </span>
</template>

<style scoped>
.verly-action-wrap { display: inline-flex; flex-direction: column; align-items: flex-start; gap: 4px; }
.verly-action-button { min-width: 44px; min-height: 44px; padding: 8px 16px; border: 2px solid transparent; border-radius: 10px; font: 400 17px/1.25 var(--font-verly-body); cursor: pointer; }
.verly-action-button--primary { color: white; background: var(--color-verly-glass); }
.verly-action-button--secondary { color: var(--color-verly-ink); border-color: var(--color-verly-glass); background: transparent; }
.verly-action-button:focus-visible { outline: 3px solid var(--color-verly-yellow); outline-offset: 2px; }
.verly-action-button:disabled { color: #53615f; border-color: #c7cfcc; background: #e4e9e7; cursor: not-allowed; }
.verly-action-reason { color: var(--color-verly-muted); font: 400 15px/1.35 var(--font-verly-body); }
</style>
