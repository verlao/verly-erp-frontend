<script setup lang="ts">
withDefaults(defineProps<{ selected?: boolean; disabled?: boolean }>(), {
  selected: false,
  disabled: false,
})

const emit = defineEmits<{ 'update:selected': [selected: boolean] }>()
</script>

<template>
  <button
    type="button"
    class="verly-choice-chip"
    :class="{ 'verly-choice-chip--selected': selected }"
    :aria-pressed="selected"
    :disabled="disabled"
    @click="emit('update:selected', !selected)"
  >
    <span class="verly-choice-chip__marker" aria-hidden="true"><svg v-if="selected" viewBox="0 0 16 16"><path d="m3 8 3.2 3.2L13 4.5" /></svg></span>
    <span><slot /></span>
  </button>
</template>

<style scoped>
.verly-choice-chip { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 7px 14px; border: 1px solid #7c8986; border-radius: 999px; color: var(--color-verly-ink); background: #fff; font: 400 17px/1.25 var(--font-verly-body); cursor: pointer; }
.verly-choice-chip--selected { border-color: var(--color-verly-glass); color: #174b49; background: #e4f1ef; }
.verly-choice-chip__marker { display: grid; width: 18px; height: 18px; place-items: center; border: 1.5px solid currentColor; border-radius: 50%; }
.verly-choice-chip__marker svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.verly-choice-chip:focus-visible { outline: 3px solid var(--color-verly-glass); outline-offset: 2px; }
.verly-choice-chip:disabled { color: var(--color-verly-muted); background: #e4e9e7; cursor: not-allowed; }
</style>
