<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Check, ChevronRight, RectangleHorizontal, Ruler, Save, UserRound } from 'lucide-vue-next'
import PieceDrawing from '@/components/verly/PieceDrawing.vue'
import { formatBRL, multiplyCents, toCents } from '@/lib/money'
import { addPreviewQuote } from './vendasPreviewState'

const router = useRouter()
const step = ref(1)
const customer = ref('')
const phone = ref('')
const width = ref(140)
const height = ref(190)
const glass = ref('Incolor 8 mm')
const quantity = ref(1)
const terms = ref('50% de entrada · saldo na instalação')
const saved = ref(false)
const notice = ref('')
const glassOptions = [
  { name: 'Incolor 8 mm', glass: 510, labor: 155, accessory: 72 },
  { name: 'Verde 8 mm', glass: 585, labor: 155, accessory: 72 },
  { name: 'Espelho 4 mm', glass: 420, labor: 120, accessory: 36 },
]
const selectedGlass = computed(() => glassOptions.find(option => option.name === glass.value) ?? glassOptions[0])
const validMeasure = computed(() => Number(width.value) > 0 && Number(height.value) > 0 && Number.isFinite(Number(width.value)) && Number.isFinite(Number(height.value)))
const validQuantity = computed(() => Number.isInteger(Number(quantity.value)) && Number(quantity.value) >= 1)
const area = computed(() => validMeasure.value ? Number(width.value) * Number(height.value) / 10000 : 0)
const unitCostCents = computed(() => toCents(area.value * (selectedGlass.value.glass + selectedGlass.value.labor + selectedGlass.value.accessory)))
const unitPriceCents = computed(() => multiplyCents(unitCostCents.value, '1.30'))
const totalCents = computed(() => unitPriceCents.value * (validQuantity.value ? Number(quantity.value) : 0))
const totalCostCents = computed(() => unitCostCents.value * (validQuantity.value ? Number(quantity.value) : 0))
const markupCents = computed(() => totalCents.value - totalCostCents.value)
const canContinue = computed(() => step.value === 1 ? customer.value.trim().length >= 2 : validMeasure.value && validQuantity.value)
function goBack() { if (step.value > 1) step.value--; else router.push({ name: 'Quotes' }) }
function saveQuote() {
  if (!customer.value.trim() || !validMeasure.value || !validQuantity.value || totalCents.value <= 0) return
  const quote = addPreviewQuote({
    customer: customer.value.trim(),
    phone: phone.value.trim(),
    item: glass.value === 'Espelho 4 mm' ? 'Espelho sob medida' : 'Peça de vidro sob medida',
    width: Number(width.value),
    height: Number(height.value),
    glass: glass.value,
    quantity: Math.max(1, Number(quantity.value) || 1),
    totalCents: totalCents.value,
    profitCents: markupCents.value,
    terms: terms.value,
  })
  saved.value = true
  notice.value = `Orçamento #${quote.id} para ${customer.value.trim()} salvo nesta prévia por ${formatBRL(totalCents.value)}.`
}
function goToQuotes() { router.push({ name: 'Quotes' }) }
</script>

<template>
  <main class="preview-page new-quote-page">
    <button class="back-button" @click="goBack"><ArrowLeft :size="18" /> {{ step === 1 ? 'Orçamentos' : 'Voltar' }}</button>
    <p class="preview-eyebrow">VENDAS · NOVA PROPOSTA</p>
    <h1 class="preview-heading">Novo orçamento</h1>
    <p class="preview-subtitle">Monte a proposta junto com o cliente, medida por medida.</p>
    <ol class="stepper" aria-label="Etapas do orçamento"><li v-for="(label, index) in ['Cliente', 'Peça e preço', 'Revisar']" :key="label" :class="{ current: step === index + 1, complete: step > index + 1 }"><span class="step-dot"><Check v-if="step > index + 1" :size="16" /><template v-else>{{ index + 1 }}</template></span><span>{{ label }}</span><i v-if="index < 2"></i></li></ol>

    <section v-if="step === 1" class="form-card preview-surface">
      <div class="section-icon"><UserRound :size="20" /></div><h2>Quem vai receber a proposta?</h2><p class="section-hint">Informe o cliente e um telefone para identificar este orçamento.</p>
      <div class="form-grid"><label class="preview-form-field">Nome do cliente<input v-model.trim="customer" autocomplete="name" placeholder="Ex.: Ana Oliveira" /></label><label class="preview-form-field">Telefone <span class="optional">opcional</span><input v-model="phone" type="tel" autocomplete="tel" placeholder="(21) 99999-9999" /></label></div>
      <p v-if="!customer" class="field-hint">Informe o nome do cliente para continuar.</p><p v-else-if="customer.length < 2" class="field-error">Digite pelo menos dois caracteres para continuar.</p>
      <button class="preview-button preview-button-primary step-action" :disabled="!canContinue" @click="step = 2">Definir peça e preço <ChevronRight :size="18" /></button>
    </section>

    <section v-else-if="step === 2" class="form-card preview-surface">
      <div class="section-icon"><Ruler :size="20" /></div><h2>O que vamos produzir?</h2><p class="section-hint">As medidas são em centímetros. A área e o preço atualizam automaticamente.</p>
      <div class="measure-grid"><label class="preview-form-field">Largura (cm)<input v-model.number="width" type="number" min="1" step="0.1" /></label><span class="times">×</span><label class="preview-form-field">Altura (cm)<input v-model.number="height" type="number" min="1" step="0.1" /></label><label class="preview-form-field">Quantidade<input v-model.number="quantity" type="number" min="1" step="1" /></label></div>
      <label class="preview-form-field glass-field"><span><RectangleHorizontal :size="17" /> Tipo de vidro</span><select v-model="glass"><option v-for="option in glassOptions" :key="option.name">{{ option.name }}</option></select></label>
      <label class="preview-form-field terms-field">Condição de pagamento<select v-model="terms"><option>50% de entrada · saldo na instalação</option><option>40% de entrada · saldo na instalação</option><option>À vista ou em até 6x no cartão</option></select></label>
      <p v-if="!validMeasure || !validQuantity" class="field-error">Use medidas maiores que zero e uma quantidade inteira de pelo menos uma unidade.</p>
      <div class="piece-preview"><PieceDrawing :width-cm="Number(width)" :height-cm="Number(height)" :label="glass" /><div class="area-summary"><span>Área desta peça</span><strong>{{ area.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) }} m²</strong><small>Área calculada pelas medidas informadas</small></div></div>
      <div class="price-preview"><span>Preço por unidade <strong>{{ formatBRL(unitPriceCents) }}</strong></span><span>{{ quantity }} × {{ formatBRL(unitPriceCents) }} <strong>{{ formatBRL(totalCents) }}</strong></span><small>Acréscimo estimado no total: {{ formatBRL(markupCents) }}</small></div>
      <div class="step-actions"><button class="preview-button" @click="step = 1">Voltar ao cliente</button><button class="preview-button preview-button-primary" :disabled="!canContinue" @click="step = 3">Revisar proposta <ChevronRight :size="18" /></button></div>
    </section>

    <section v-else-if="saved" class="form-card preview-surface review-card">
      <div class="saved-state"><span class="saved-icon"><Check :size="24" /></span><p class="preview-eyebrow">PROPOSTA REGISTRADA</p><h2>Orçamento pronto para {{ customer }}</h2><p>{{ formatBRL(totalCents) }} · {{ quantity }} {{ quantity === 1 ? 'peça' : 'peças' }} · {{ width }} × {{ height }} cm</p><div class="saved-actions"><button class="preview-button preview-button-primary" @click="goToQuotes">Ver orçamentos</button><button class="preview-button" @click="router.push({ name: 'Orders' })">Ir para pedidos</button></div><p class="local-note" role="status">{{ notice }}</p></div>
    </section>
    <section v-else class="form-card preview-surface review-card">
      <div class="section-icon"><Check :size="20" /></div><h2>Confira antes de salvar</h2><p class="section-hint">Revise os dados e registre a proposta para apresentar ao cliente.</p><div class="review-customer"><UserRound :size="19" /><span><strong>{{ customer }}</strong><small>{{ phone || 'Sem telefone informado' }}</small></span></div><div class="review-piece"><PieceDrawing :width-cm="Number(width)" :height-cm="Number(height)" :label="glass" /><div><strong>{{ glass }}</strong><span>{{ width }} × {{ height }} cm · {{ quantity }} {{ quantity === 1 ? 'unidade' : 'unidades' }}</span><small>{{ terms }}</small></div></div><div class="review-total"><span>Total da proposta</span><strong>{{ formatBRL(totalCents) }}</strong><small>Acréscimo estimado · {{ formatBRL(markupCents) }}</small></div><div class="step-actions"><button class="preview-button" @click="step = 2">Ajustar peça</button><button class="preview-button preview-button-primary" @click="saveQuote"><Save :size="17" /> Salvar orçamento</button></div>
    </section>
  </main>
</template>

<style scoped>
.back-button{display:inline-flex;align-items:center;gap:8px;min-height:44px;margin:0 0 18px;padding:5px 8px;border:0;background:transparent;color:#315f5a;font:600 15px var(--font-verly-body);cursor:pointer}.preview-heading{margin:4px 0 7px;color:#141a1f;font:600 clamp(30px,4vw,38px)/1.1 var(--font-verly-display)}.preview-subtitle{margin:0;color:#56625f;font-size:17px}.stepper{display:flex;align-items:center;max-width:700px;margin:30px 0 20px;padding:0;list-style:none}.stepper li{display:flex;flex:1;align-items:center;gap:8px;color:#697571;font-size:15px}.stepper li:last-child{flex:0}.step-dot{display:grid;flex:0 0 34px;width:34px;height:34px;place-items:center;border:1px solid #cbd5d1;border-radius:50%;background:#fff;color:#5b6763;font:600 15px var(--font-verly-mono)}.stepper li i{height:1px;flex:1;margin:0 8px;background:#cbd5d1}.stepper li.current{color:#174b49;font-weight:600}.stepper li.current .step-dot{border-color:#2e7d7a;background:#2e7d7a;color:#fff}.stepper li.complete .step-dot{border-color:#1e7a3c;background:#1e7a3c;color:#fff}.form-card{max-width:760px;padding:25px;border:1px solid #dce3e0;border-radius:15px}.section-icon{display:grid;place-items:center;width:42px;height:42px;margin-bottom:13px;border-radius:12px;background:#e4f1ef;color:#246765}.form-card h2{margin:0;color:#18211e;font:600 23px/1.2 var(--font-verly-display)}.section-hint{margin:7px 0 22px;color:#5a6763;font-size:16px;line-height:1.45}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.preview-form-field{display:grid;gap:7px;color:#293632;font-size:15px;font-weight:600}.preview-form-field input,.preview-form-field select{width:100%;min-height:48px;padding:9px 12px;border:1px solid #9ca9a4;border-radius:9px;background:#fff;color:#18211e;font:16px var(--font-verly-body)}.preview-form-field input:focus,.preview-form-field select:focus{outline:3px solid #2e7d7a66;outline-offset:1px}.optional{color:#6a7572;font-weight:400}.step-action{margin-top:23px}.preview-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:9px 16px;border:1px solid #cbd5d1;border-radius:10px;background:#fff;color:#24302c;font:600 16px var(--font-verly-body);cursor:pointer}.preview-button-primary{border-color:#2e7d7a;background:#2e7d7a;color:#fff}.preview-button:disabled{opacity:.45;cursor:not-allowed}.measure-grid{display:grid;grid-template-columns:1fr 20px 1fr 1fr;align-items:end;gap:10px}.times{padding-bottom:14px;text-align:center;color:#6b7672}.glass-field,.terms-field{margin-top:17px}.glass-field>span{display:flex;align-items:center;gap:7px}.piece-preview{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(170px,.85fr);align-items:center;gap:15px;margin:17px 0;padding:13px 17px;border-radius:12px;background:#f3f6f5}.piece-preview :deep(figure){max-width:340px}.piece-preview :deep(figcaption){font-size:15px}.area-summary{display:grid;gap:5px}.area-summary span,.area-summary small{color:#56625f;font-size:15px}.area-summary strong{font:600 22px var(--font-verly-mono);color:#141a1f}.price-preview{display:grid;gap:8px;padding:16px 0 3px;border-top:1px solid #e1e6e3;color:#42504b;font-size:15px}.price-preview>span{display:flex;justify-content:space-between;gap:8px}.price-preview strong{color:#141a1f;font:600 16px var(--font-verly-mono)}.price-preview small{color:#53615c;font-size:15px}.step-actions{display:flex;justify-content:space-between;gap:10px;margin-top:22px}.field-error{margin:8px 0 0;color:#8b4104;font-size:15px}.review-customer{display:flex;align-items:center;gap:10px;margin:16px 0;padding:12px;border-radius:10px;background:#f3f6f5;color:#2e625d}.review-customer span{display:grid;gap:2px}.review-customer strong{color:#18211e;font-size:16px}.review-customer small{color:#5b6763;font-size:15px}.review-piece{display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid #e1e6e3}.review-piece :deep(figure){width:150px}.review-piece :deep(figcaption){font-size:15px}.review-piece>div{display:grid;gap:6px}.review-piece>div strong{font-size:17px}.review-piece>div span,.review-piece>div small{color:#56625f;font-size:15px}.review-total{display:grid;gap:5px;margin-top:17px}.review-total span,.review-total small{color:#56625f;font-size:15px}.review-total strong{font:600 28px var(--font-verly-mono);color:#141a1f}.review-total small{color:#246765}.saved-state{display:grid;justify-items:center;padding:24px 10px;text-align:center}.saved-icon{display:grid;place-items:center;width:58px;height:58px;margin-bottom:17px;border-radius:50%;background:#e5f3e9;color:#1e7a3c}.saved-state .preview-eyebrow{margin:0 0 7px;color:#1e7a3c}.saved-state h2{max-width:520px}.saved-state>p:not(.preview-eyebrow){color:#56625f;font-size:16px}.saved-actions{display:flex;gap:9px;margin:14px 0}.local-note{max-width:510px;padding:10px 13px;border-radius:9px;background:#f3f6f5;font-size:15px!important}@media(max-width:650px){.form-card{padding:18px 15px}.stepper{margin:23px 0 16px}.stepper li{gap:5px;font-size:15px}.step-dot{flex-basis:31px;width:31px;height:31px}.stepper li i{margin:0 3px}.form-grid{grid-template-columns:1fr}.measure-grid{grid-template-columns:1fr 15px 1fr}.measure-grid .preview-form-field:last-child{grid-column:1/-1}.piece-preview{grid-template-columns:1fr;gap:4px;padding:12px}.piece-preview :deep(figure){max-width:250px;margin:auto}.area-summary{grid-template-columns:1fr auto}.area-summary small{grid-column:1/-1}.step-actions .preview-button{flex:1;padding:9px 10px;font-size:15px}.review-piece :deep(figure){width:105px}.saved-actions{width:100%;flex-direction:column}.saved-actions .preview-button{width:100%}}
.preview-button-primary{border-color:#141a1f;background:#141a1f;color:#fff}.preview-button-primary:disabled{border-color:#d2dad7;background:#e0e5e3;color:#53615f;opacity:1;cursor:not-allowed}.field-hint{margin:8px 0 0;color:#596560;font-size:15px}
</style>
