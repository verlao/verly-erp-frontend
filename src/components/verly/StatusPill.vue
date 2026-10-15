<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'entered' | 'pending' | 'overdue' | 'neutral' }>(), {
  tone: 'neutral',
})
</script>

<template>
  <span class="verly-status-pill" :class="`verly-status-pill--${tone}`"><slot /></span>
</template>

<style scoped>
.verly-status-pill { display: inline-flex; align-items: center; min-height: 30px; padding: 4px 10px; border: 1px solid currentColor; border-radius: 999px; font: 600 15px/1.25 var(--font-verly-body); }
.verly-status-pill--entered { color: #155d2e; background: #e8f4eb; }
.verly-status-pill--pending { color: #783800; background: #fff0df; }
.verly-status-pill--overdue { color: #8f1c14; background: #fce9e7; }
.verly-status-pill--neutral { color: #3e4a48; background: #edf0ef; }
</style>
