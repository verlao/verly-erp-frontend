<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRight, MapPin, Phone, Plus, Search, X } from 'lucide-vue-next'

type Customer = { id: number; name: string; alias: string; phone: string; secondPhone: string; cpf: string; address: string; note: string; orders: { code: string; item: string; status: string; date: string; amount: string }[] }
const router = useRouter()
const customers = ref<Customer[]>([
  { id: 1, name: 'Ana Exemplo', alias: 'Ana Box', phone: '(11) 99999-4421', secondPhone: '', cpf: 'Não informado', address: 'Rua Exemplo, 1048 · Bairro Modelo, São Paulo (fictício)', note: 'Conversa associada ao pedido 1048; confirme o contato antes de registrar pagamento.', orders: [{ code: 'PED-1048', item: 'Janela temperada · incolor · 120 × 80 cm', status: 'Em andamento', date: '15 out 2026', amount: 'R$ 1.340,00' }] },
  { id: 2, name: 'Beatriz Teste', alias: 'Bia Janela', phone: '(11) 99999-4422', secondPhone: '', cpf: '', address: 'Av. Exemplo, 2052 · Vila Teste, São Paulo (fictício)', note: '', orders: [{ code: 'PED-1052', item: 'Box de correr · verde · 150 × 190 cm', status: 'Aguardando confirmação', date: '13 out 2026', amount: 'R$ 1.120,00' }] },
  { id: 1046, name: 'Rogério Exemplo', alias: 'Roger obra — WhatsApp', phone: '(11) 99102-8844', secondPhone: '', cpf: '', address: 'Rua Modelo, 51 · Osasco, SP (fictício)', note: '', orders: [{ code: 'PED-2799', item: 'Janela temperada · verde · 100 × 120 cm', status: 'Orçamento enviado', date: '02 out 2026', amount: 'R$ 612,00' }] },
  { id: 1045, name: 'Clínica Exemplo', alias: 'Recepção — WhatsApp', phone: '(11) 96320-1177', secondPhone: '', cpf: 'CNPJ fictício', address: 'Praça Exemplo, 90 · Bairro Modelo, São Paulo (fictício)', note: 'Faturamento para o administrativo.', orders: [{ code: 'PED-2731', item: 'Porta de correr · incolor · 160 × 210 cm', status: 'Entregue', date: '24 set 2026', amount: 'R$ 1.930,00' }] },
])
const query = ref('')
const filter = ref<'Todos' | 'Com pedidos' | 'Atenção'>('Todos')
const filters = ['Todos', 'Com pedidos', 'Atenção'] as const
const shown = computed(() => customers.value.filter(c => {
  const text = `${c.name} ${c.alias} ${c.phone} ${c.address}`.toLocaleLowerCase('pt-BR')
  return text.includes(query.value.toLocaleLowerCase('pt-BR')) && (filter.value !== 'Com pedidos' || c.orders.length > 0) && (filter.value !== 'Atenção' || c.orders.some(o => o.status === 'Aguardando medida' || o.status === 'Aguardando confirmação'))
}))
const active = ref<Customer | null>(null)
const details = ref<HTMLDialogElement | null>(null)
const editor = ref<HTMLDialogElement | null>(null)
const editingId = ref<number | null>(null)
const notice = ref('')
const formError = ref('')
const draft = ref({ name: '', alias: '', phone: '', secondPhone: '', address: '', note: '' })
function openDetails(customer: Customer) { active.value = customer; details.value?.showModal() }
function close(dialog: HTMLDialogElement | null) { dialog?.close() }
async function openEditor(customer?: Customer) {
  formError.value = ''
  editingId.value = customer?.id ?? null
  draft.value = customer ? { name: customer.name, alias: customer.alias, phone: customer.phone, secondPhone: customer.secondPhone, address: customer.address, note: customer.note } : { name: '', alias: '', phone: '', secondPhone: '', address: '', note: '' }
  await nextTick(); editor.value?.showModal()
}
function save() {
  const name = draft.value.name.trim(); const phone = draft.value.phone.trim()
  if (!name || phone.replace(/\D/g, '').length < 10) { formError.value = 'Informe o nome e um telefone com DDD para continuar.'; return }
  if (editingId.value) {
    const customer = customers.value.find(c => c.id === editingId.value)
    if (customer) Object.assign(customer, draft.value, { name, phone })
    notice.value = `${name} atualizado na prévia.`
  } else {
    const customer: Customer = { id: Math.max(...customers.value.map(c => c.id)) + 1, ...draft.value, name, phone, cpf: '', orders: [] }
    customers.value.unshift(customer); notice.value = `${name} adicionado à prévia.`
  }
  formError.value = ''
  editor.value?.close()
}
</script>

<template>
  <main class="preview-page customers-preview">
    <p class="preview-eyebrow">Relacionamento com clientes</p>
    <div class="preview-heading"><div><h1>Clientes</h1><p class="preview-subtitle">Encontre pessoas e empresas pelo nome, apelido usado na conversa ou telefone.</p></div><button class="preview-button-primary" @click="openEditor()"><Plus :size="18" aria-hidden="true" /> Novo cliente</button></div>
    <div v-if="notice" class="preview-notice" role="status">{{ notice }} <button aria-label="Dispensar aviso" @click="notice = ''">Fechar</button></div>
    <section class="preview-surface customer-toolbar">
      <label class="preview-search"><Search :size="18" aria-hidden="true" /><input v-model="query" aria-label="Buscar clientes" placeholder="Buscar nome, apelido, telefone ou endereço" /></label>
      <div class="customer-filters" aria-label="Filtrar clientes"><button v-for="item in filters" :key="item" type="button" class="preview-chip" :class="{ 'is-active': filter === item }" :aria-pressed="filter === item" @click="filter = item">{{ item }}</button></div>
    </section>
    <p class="customer-count">{{ shown.length }} {{ shown.length === 1 ? 'cadastro' : 'cadastros' }} <span>· Dados de exemplo desta prévia</span></p>
    <section v-if="shown.length" class="preview-grid">
      <button v-for="customer in shown" :key="customer.id" type="button" class="preview-card customer-card" @click="openDetails(customer)">
        <div class="customer-card-top"><span class="customer-initials">{{ customer.name.split(' ').map(n => n[0]).slice(0, 2).join('') }}</span><span class="customer-id">#{{ customer.id }}</span></div>
        <h2>{{ customer.name }}</h2><p v-if="customer.alias" class="customer-alias">WhatsApp: “{{ customer.alias }}”</p>
        <p class="customer-phone"><Phone :size="16" aria-hidden="true" /> {{ customer.phone }} <span v-if="customer.secondPhone">· {{ customer.secondPhone }}</span></p>
        <p class="customer-address"><MapPin :size="16" aria-hidden="true" /> {{ customer.address }}</p>
        <div class="customer-card-bottom"><span>{{ customer.orders.length }} {{ customer.orders.length === 1 ? 'pedido' : 'pedidos' }} no histórico</span><ChevronRight :size="20" aria-hidden="true" /></div>
      </button>
    </section>
    <div v-else class="preview-empty"><h2>Nenhum cliente nessa busca</h2><p>Tente outro nome, telefone ou escolha “Todos”.</p><button class="preview-button" @click="query = ''; filter = 'Todos'">Limpar busca e filtro</button></div>

    <dialog ref="details" class="preview-dialog customer-dialog" aria-labelledby="customer-details-title" @click="($event.target as HTMLElement).tagName === 'DIALOG' && close(details)">
      <template v-if="active"><header class="dialog-heading"><div><p class="preview-eyebrow">Cliente #{{ active.id }}</p><h2 id="customer-details-title">{{ active.name }}</h2><p v-if="active.alias" class="customer-alias">WhatsApp salvo como “{{ active.alias }}”</p></div><button class="dialog-close" aria-label="Fechar detalhes do cliente" @click="close(details)"><X :size="20" /></button></header>
      <div class="dialog-content"><section class="customer-contact"><h3>Contato e entrega</h3><p><strong>Telefone principal</strong>{{ active.phone }}</p><p v-if="active.secondPhone"><strong>Outro telefone</strong>{{ active.secondPhone }}</p><p><strong>Documento</strong>{{ active.cpf || 'Não informado' }}</p><p><strong>Endereço</strong>{{ active.address || 'Endereço ainda não informado' }}</p><p v-if="active.note"><strong>Observação</strong>{{ active.note }}</p><p class="identity-note">O apelido ajuda a reconhecer a conversa; por si só, não confirma a identidade de quem escreveu.</p></section>
        <section class="customer-history"><div class="history-title"><h3>Pedidos recentes</h3><button class="preview-button" @click="router.push({ name: 'Orders' })">Abrir pedidos</button></div><article v-for="order in active.orders" :key="order.code" class="order-item"><div><strong>{{ order.code }}</strong><span>{{ order.item }}</span><small>{{ order.date }}</small></div><div class="order-meta"><span class="preview-chip" :class="{ 'is-pending': order.status === 'Aguardando medida' }">{{ order.status }}</span><strong>{{ order.amount }}</strong></div></article><p v-if="!active.orders.length" class="history-empty">Ainda não há pedidos neste cadastro.</p></section>
      </div><footer class="dialog-actions"><button class="preview-button" @click="openEditor(active)">Editar cadastro</button><button class="preview-button-primary" @click="router.push({ name: 'Orders' })">Ver todos os pedidos</button></footer></template>
    </dialog>
    <dialog ref="editor" class="preview-dialog customer-editor" aria-labelledby="customer-editor-title">
      <form class="editor-form" @submit.prevent="save"><header class="dialog-heading"><div><p class="preview-eyebrow">{{ editingId ? 'Atualizar dados' : 'Novo cadastro' }}</p><h2 id="customer-editor-title">{{ editingId ? 'Editar cliente' : 'Cadastrar cliente' }}</h2><p class="preview-subtitle">As alterações ficam somente nesta prévia.</p></div><button type="button" class="dialog-close" aria-label="Fechar cadastro de cliente" @click="close(editor)"><X :size="20" /></button></header>
        <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
        <div class="editor-fields"><label class="preview-form-field">Nome de pessoa ou empresa<input v-model="draft.name" required maxlength="90" placeholder="Ex.: Marina Costa" /></label><label class="preview-form-field">Apelido usado na conversa<input v-model="draft.alias" maxlength="90" placeholder="Ex.: Mari — WhatsApp" /><small>É uma referência para a equipe, não uma confirmação de identidade.</small></label><div class="editor-two"><label class="preview-form-field">Telefone principal<input v-model="draft.phone" required type="tel" minlength="10" placeholder="(11) 99999-9999" /></label><label class="preview-form-field">Outro telefone<input v-model="draft.secondPhone" type="tel" placeholder="Opcional" /></label></div><label class="preview-form-field">Endereço de entrega<input v-model="draft.address" maxlength="140" placeholder="Rua, número · bairro, cidade" /></label><label class="preview-form-field">Observação para a equipe<textarea v-model="draft.note" rows="2" maxlength="180" placeholder="Horário de contato, acesso ao local…" /></label></div>
        <footer class="dialog-actions"><button type="button" class="preview-button" @click="close(editor)">Cancelar</button><button class="preview-button-primary" type="submit">{{ editingId ? 'Salvar alterações' : 'Adicionar cliente' }}</button></footer>
      </form>
    </dialog>
  </main>
</template>

<style scoped>
.customers-preview { color:#141a1f; }
.preview-heading { display:flex; align-items:end; justify-content:space-between; gap:20px; margin:14px 0 25px; }
.preview-heading h1,.dialog-heading h2 { margin:0; font:600 clamp(30px,4vw,38px)/1.08 var(--font-verly-display); }
.preview-subtitle { max-width:680px; margin:9px 0 0; color:#52605d; font-size:17px; line-height:1.45; }
.customer-toolbar { display:flex; align-items:center; gap:14px; padding:14px; border:1px solid #dce2df; border-radius:14px; background:#fff; }
.customer-toolbar .preview-search { display:flex; flex:1; align-items:center; gap:10px; min-width:180px; min-height:46px; width:auto; padding:0 13px; border:1px solid #b4c0bb; border-radius:9px; color:#52605d; }
.customer-toolbar .preview-search:focus-within { outline:3px solid #2e7d7a; outline-offset:1px; }
.customer-toolbar .preview-search input { width:100%; min-height:42px; padding:0; border:0; outline:0; background:transparent; color:#141a1f; font:16px var(--font-verly-body); }
.customer-filters { display:flex; gap:7px; overflow:auto; }
.customer-count { margin:18px 0 10px; color:#293632; font-size:15px; font-weight:600; }
.customer-count span { color:#64716c; font-weight:400; }
.customer-card { display:flex; width:100%; min-height:230px; flex-direction:column; padding:18px; border:1px solid #dce2df; border-radius:14px; background:#fff; color:#141a1f; text-align:left; font:inherit; cursor:pointer; transition:border-color .15s,transform .15s; }
.customer-card:hover { border-color:#81aaa4; transform:translateY(-2px); }
.customer-card:focus-visible { outline:3px solid #2e7d7a; outline-offset:2px; }
.customer-card-top { display:flex; align-items:center; justify-content:space-between; }
.customer-initials { display:grid; width:43px; height:43px; place-items:center; border-radius:13px; background:#e4f1ef; color:#246765; font-weight:700; }
.customer-id { color:#64716c; font:15px var(--font-verly-mono); }
.customer-card h2 { margin:15px 0 3px; font:600 21px/1.2 var(--font-verly-display); }
.customer-alias { margin:0; color:#4c5b56; font-size:15px; line-height:1.4; }
.customer-phone { display:flex; align-items:center; gap:6px; margin:13px 0 3px; font-size:16px; font-weight:600; }
.customer-phone svg { flex:none; color:#52615d; }
.customer-address { display:flex; align-items:flex-start; gap:6px; margin:4px 0 14px; color:#5c6964; font-size:15px; line-height:1.4; }
.customer-address svg { flex:none; margin-top:2px; color:#52615d; }
.customer-card-bottom { display:flex; justify-content:space-between; align-items:center; margin-top:auto; padding-top:12px; border-top:1px solid #e3e8e5; color:#315e58; font-size:15px; font-weight:600; }
.preview-dialog { width:min(720px,calc(100vw - 32px)); max-width:none; max-height:90dvh; padding:0; border:1px solid #d8e1dd; border-radius:24px; background:#fff; color:#141a1f; box-shadow:0 22px 70px #101a1733; overflow:auto; }
.preview-dialog::backdrop { background:#121b19a6; backdrop-filter:blur(2px); }
.dialog-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; padding:23px 25px 18px; border-bottom:1px solid #e0e5e2; }
.dialog-heading h2 { font-size:27px; }
.dialog-heading .preview-eyebrow { margin:0 0 7px; }
.dialog-heading .customer-alias { margin-top:7px; }
.dialog-close { display:grid; flex:none; width:44px; height:44px; place-items:center; border:1px solid #cbd5d0; border-radius:50%; background:#fff; color:#24302b; cursor:pointer; }
.dialog-content { padding:20px 25px; }
.dialog-content h3 { margin:0 0 12px; font:600 19px var(--font-verly-display); }
.customer-contact { padding:16px; border-radius:12px; background:#f3f5f4; }
.customer-contact p { display:grid; gap:2px; margin:0 0 12px; color:#35413d; font-size:16px; line-height:1.4; }
.customer-contact p strong { color:#67736e; font-size:15px; }
.customer-contact .identity-note { display:block; margin:14px 0 0; padding:10px 12px; border-left:3px solid #2e7d7a; background:#e7f1ef; color:#315b56; font-size:15px; line-height:1.4; }
.history-title { display:flex; align-items:center; justify-content:space-between; gap:10px; margin:22px 0 10px; }
.history-title h3 { margin:0; }
.order-item { display:flex; justify-content:space-between; gap:15px; padding:14px 0; border-bottom:1px solid #e3e8e5; }
.order-item>div:first-child { display:grid; gap:4px; }
.order-item strong { font-size:16px; }
.order-item span,.order-item small { color:#596661; font-size:15px; }
.order-meta { display:grid; justify-items:end; align-content:center; gap:7px; white-space:nowrap; }
.order-meta>strong { color:#141a1f; font:600 15px var(--font-verly-mono); }
.preview-chip.is-pending { border-color:#e8ba82; background:#fbe8cf; color:#864408; }
.history-empty { color:#586560; font-size:16px; }
.dialog-actions { display:flex; justify-content:flex-end; gap:10px; padding:15px 25px 22px; border-top:1px solid #e0e5e2; }
.customer-editor { width:min(600px,calc(100vw - 32px)); }
.editor-form { display:block; }
.editor-fields { display:grid; gap:14px; padding:20px 25px; }
.editor-two { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.preview-form-field { display:grid; gap:6px; color:#34413c; font-size:15px; font-weight:600; }
.preview-form-field input,.preview-form-field textarea { width:100%; min-height:46px; padding:10px 12px; border:1px solid #9eada7; border-radius:8px; background:#fff; color:#141a1f; font:16px var(--font-verly-body); }
.preview-form-field textarea { resize:vertical; }
.preview-form-field small { color:#5e6b66; font-size:15px; font-weight:400; }
.preview-empty { padding:36px; border:1px dashed #aebbb5; border-radius:14px; text-align:center; }
.preview-empty h2 { font:600 22px var(--font-verly-display); }
.preview-empty p { color:#596661; font-size:16px; }
.preview-notice { display:flex; justify-content:space-between; gap:12px; margin:0 0 14px; padding:12px 15px; border-left:4px solid #1e7a3c; border-radius:8px; background:#edf6ef; color:#245631; font-size:15px; }
.preview-notice button { min-height:44px; border:0; background:none; color:inherit; font:600 15px var(--font-verly-body); text-decoration:underline; cursor:pointer; }
.form-error { margin:12px 25px 0; padding:10px 12px; border-left:3px solid #a84f06; background:#fbe8cf; color:#733803; font-size:15px; }
@media(max-width:650px) { .preview-heading{align-items:flex-start;flex-direction:column}.customer-toolbar{align-items:stretch;flex-direction:column}.customer-filters{padding-bottom:2px}.customer-card{min-height:210px}.dialog-heading,.dialog-content{padding-right:17px;padding-left:17px}.dialog-actions{padding:13px 17px 18px;flex-wrap:wrap}.order-item{flex-direction:column}.order-meta{display:flex;justify-content:space-between;align-items:center}.editor-fields{padding:16px 17px}.editor-two{grid-template-columns:1fr}.form-error{margin:10px 17px 0} }
</style>
