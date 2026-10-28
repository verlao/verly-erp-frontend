<script setup lang="ts">
import { originLabels, type ReviewField } from './reviewContext'
defineProps<{ label: string; field: ReviewField<string | number>; suffix?: string }>()
</script>

<template>
 <div class="review-value">
  <span class="review-value__label">{{ label }}</span>
  <strong>{{ field.value === null || field.value === '' ? 'Ainda falta' : field.value }}<span v-if="field.value !== null && field.value !== '' && suffix"> {{ suffix }}</span></strong>
  <span class="review-origin" :class="`review-origin--${field.origin}`">{{ originLabels[field.origin] }}</span>
  <small>{{ field.sourceLabel }}</small>
  <q v-if="field.quote">{{ field.quote }}</q>
 </div>
</template>

<style scoped>
.review-value { display:grid; align-content:start; gap:5px; min-width:0; padding:15px; background:#F5F8F6; border:1px solid #DFE6E2; border-radius:14px; }
.review-value__label,.review-value small { color:#53615F; font-size:15px; font-weight:400; }
.review-value strong { color:#141A1F; font-size:18px; overflow-wrap:anywhere; }
.review-value q { font-size:15px; color:#465C55; line-height:1.45; }
.review-value .review-origin { justify-self:start; }
</style>
