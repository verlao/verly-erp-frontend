<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, Search } from 'lucide-vue-next'
import { findReviewCustomer, findReviewLead, reviewCustomers, reviewLeads } from './reviewContext'

const route = useRoute()
const router = useRouter()
const search = ref('')
const newName = ref('')
const pickedCustomerId = ref<number | null>(route.query.customerId ? Number(route.query.customerId) : null)
const lead = computed(() => findReviewLead(route.query.leadId))
const customer = computed(() => findReviewCustomer(pickedCustomerId.value))
const filteredCustomers = computed(() => reviewCustomers.value.filter(item => `${item.name} ${item.alias} ${item.phone}`.toLocaleLowerCase('pt-BR').includes(search.value.toLocaleLowerCase('pt-BR'))))
const filteredLeads = computed(() => reviewLeads.value.filter(item => `${item.name.value ?? ''} ${item.phone.value ?? ''}`.toLocaleLowerCase('pt-BR').includes(search.value.toLocaleLowerCase('pt-BR'))))
const canContinue = computed(() => !!lead.value || !!customer.value || newName.value.trim().length >= 2)
function continueToReview() {
  if (lead.value) router.push({ name: 'LeadQuote', params: { id: String(lead.value.id) }, query: { ...route.query, ...(customer.value ? { customerId: String(customer.value.id) } : {}) } })
  else if (customer.value) router.push({ name: 'LeadQuote', params: { id: 'novo' }, query: { ...route.query, customerId: String(customer.value.id) } })
  else router.push({ name: 'LeadQuote', params: { id: 'novo' }, query: { ...route.query, newCustomerName: newName.value.trim() } })
}
</script>

<template>
  <main class="preview-page new-review-quote">
    <p class="preview-eyebrow">VENDAS · FICHA PREPARADA</p>
    <h1 class="preview-heading">Novo orçamento</h1>
    <p class="preview-subtitle">Comece pelo lead ou cadastro. Você só informa um nome quando for um novo cliente.</p>
    <section v-if="lead" class="selected-context preview-surface"><span>Lead selecionado · #{{ lead.id }}</span><strong>{{ lead.name.value || 'Nome ainda não informado' }}</strong><small>{{ lead.phone.value || 'Telefone ainda não informado' }} · {{ lead.items.length }} peça(s) encontrada(s)</small><p>{{ lead.transcript }}</p></section>
    <label class="preview-search"><Search :size="18"/><input v-model="search" type="search" aria-label="Buscar lead ou cliente" placeholder="Buscar por nome ou telefone" /></label>
    <div class="selection-grid">
      <section class="preview-surface selection-card"><h2>Continuar com um lead</h2><button v-for="item in filteredLeads" :key="item.id" class="selection-row" type="button" @click="router.push({ name: 'NewQuote', query: { ...route.query, leadId: String(item.id) } })"><span><strong>{{ item.name.value || `Lead #${item.id}` }}</strong><small>{{ item.phone.value || 'Telefone não informado' }} · {{ item.items.length }} peça(s)</small></span><ArrowRight :size="18"/></button></section>
      <section class="preview-surface selection-card"><h2>Usar cadastro existente</h2><button v-for="item in filteredCustomers" :key="item.id" class="selection-row" type="button" :aria-pressed="pickedCustomerId === item.id" @click="pickedCustomerId = item.id"><span><strong>{{ item.name }}</strong><small>{{ item.phone }}<template v-if="item.alias"> · {{ item.alias }}</template></small></span><span>{{ pickedCustomerId === item.id ? 'Selecionado' : 'Escolher' }}</span></button></section>
    </div>
    <section v-if="!lead && !customer" class="preview-surface selection-card new-customer"><h2>Novo cliente</h2><label class="preview-form-field">Nome<input v-model.trim="newName" autocomplete="name" placeholder="Nome necessário para identificar a proposta" /></label><small>Telefone é opcional. Não é criado CPF ou e-mail de exemplo.</small></section>
    <section v-if="customer" class="selected-context preview-surface"><span>Cadastro selecionado por você</span><strong>{{ customer.name }}</strong><small>{{ customer.phone }} · #{{ customer.id }}</small></section>
    <button class="preview-button preview-button-primary continue-button" type="button" :disabled="!canContinue" @click="continueToReview">Continuar para revisar as peças <ArrowRight :size="18" /></button>
  </main>
</template>

<style scoped>
.new-review-quote{display:grid;gap:17px;color:#141a1f}.new-review-quote .preview-heading{margin:0}.new-review-quote .preview-subtitle{margin:0;color:#56625f;font-size:17px}.preview-search{display:flex;align-items:center;gap:10px;max-width:560px;min-height:48px;padding:0 13px;border:1px solid #c7d1cd;border-radius:10px;background:#fff;color:#596560}.preview-search input{width:100%;border:0;outline:0;background:transparent;font:16px var(--font-verly-body)}.selection-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}.selection-card{display:grid;align-content:start;gap:8px;padding:18px}.selection-card h2{margin:0 0 5px;font:600 21px var(--font-verly-display)}.selection-row{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:58px;padding:9px 8px;border:0;border-top:1px solid #e2e8e5;background:white;color:#18211e;text-align:left;cursor:pointer}.selection-row span:first-child{display:grid;gap:3px}.selection-row small,.selected-context small,.new-customer>small{color:#596761;font-size:15px}.selection-row[aria-pressed=true]{background:#eff7f5;color:#245d58}.selected-context{display:grid;gap:4px;padding:16px}.selected-context>span{color:#586560;font-size:15px}.selected-context strong{font-size:18px}.selected-context p{margin:4px 0 0;line-height:1.45}.new-customer .preview-form-field{display:grid;gap:7px;font-size:15px}.new-customer input{min-height:48px;padding:9px 12px;border:1px solid #9ca9a4;border-radius:9px;font:16px var(--font-verly-body)}.continue-button{justify-self:start;min-height:48px}.continue-button:disabled{opacity:.55;cursor:not-allowed}@media(max-width:720px){.selection-grid{grid-template-columns:1fr}.continue-button{width:100%}}
</style>
