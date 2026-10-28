import { computed, ref } from 'vue'
import { formatBRL } from '../../../lib/money'
import { useUndoToast } from '../../../composables/useUndoToast'
import { customers, partners, receipts, type Movement, type PreviewReceipt } from './fixtures'

export interface PreviewSelection {
  movement: Movement
  customerId: number | null
  orderId: number | null
  partnerId: number | null
  purpose: string
  reason: string
  accepted: boolean
}

const initialSummary = { inCents: 342000, outCents: 118000, balanceCents: 224000 }
const incomingPurposes = ['Sinal', 'Pedido inteiro', 'Avulso']
const outgoingPurposes = ['Combustível', 'Serviço', 'Materiais']

function emptySelection(movement: Movement): PreviewSelection {
  return { movement, customerId: null, orderId: null, partnerId: null, purpose: '', reason: '', accepted: false }
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function usePreviewFinance() {
  const items = ref<PreviewReceipt[]>(receipts.map(receipt => ({ ...receipt, evidence: { ...receipt.evidence } })))
  const selected = ref<PreviewReceipt | null>(null)
  const selection = ref<PreviewSelection>(emptySelection('unknown'))
  const reviewing = ref(false)
  const query = ref('')
  const editing = ref(false)
  const evidenceOpen = ref(false)
  const notice = ref('')
  const pendingIds = ref(new Set<number>())
  const completed = ref<Array<{ id: number; text: string }>>([])
  const totals = ref({ inCents: initialSummary.inCents, outCents: initialSummary.outCents })
  const summary = computed(() => ({
    inCents: totals.value.inCents,
    outCents: totals.value.outCents,
    balanceCents: totals.value.inCents - totals.value.outCents
  }))
  const { items: toasts, schedule, undo, dismissError } = useUndoToast()

  const initialSuggestion = ref<PreviewSelection | null>(null)
  const correctionRequired = computed(() => {
    const original = initialSuggestion.value
    if (!selected.value || !original) return false
    return selection.value.movement !== original.movement
      || selection.value.customerId !== original.customerId
      || selection.value.orderId !== original.orderId
      || selection.value.partnerId !== original.partnerId
      || (Boolean(original.purpose) && selection.value.purpose !== original.purpose)
  })

  const missingReason = computed(() => {
    if (selected.value?.movement === 'own') return 'Transferência entre contas próprias não altera o financeiro.'
    if (selected.value?.movement === 'reference') return 'Comprovante de referência não confirma uma movimentação financeira.'
    if (selection.value.movement === 'unknown') return 'Escolha a natureza da movimentação.'
    if (selection.value.movement === 'own') return 'Transferência entre contas próprias não altera o financeiro.'
    if (selection.value.movement === 'reference') return 'Comprovante de referência não confirma uma movimentação financeira.'
    if (correctionRequired.value && !selection.value.reason.trim()) return 'Informe o motivo para alterar a sugestão.'
    if (selection.value.movement === 'in') {
      if (!selection.value.customerId || !customers.some(customer => customer.id === selection.value.customerId)) return 'Selecione o cliente a que este pagamento se refere.'
      if (selection.value.orderId !== null) {
        const orderCustomer = customers.find(customer => customer.orderId === selection.value.orderId)
        if (!orderCustomer || orderCustomer.id !== selection.value.customerId) return 'Selecione um pedido que pertença ao cliente.'
      }
      if (!selection.value.purpose) return 'Escolha a finalidade do recebimento.'
      if (!incomingPurposes.includes(selection.value.purpose)) return 'Escolha uma finalidade válida para recebimento.'
      if (selection.value.purpose === 'Sinal') {
        if (!selection.value.customerId) return 'Selecione o cliente do pedido.'
        const customer = customers.find(item => item.id === selection.value.customerId)
        if (!selection.value.orderId || selection.value.orderId !== customer?.orderId) return 'Selecione um pedido que pertença ao cliente.'
        if (selected.value?.amountCents == null) return 'O valor ainda não foi medido.'
        if (!customer || selected.value.amountCents > customer.orderBalanceCents) return 'O valor excede o saldo do pedido.'
      }
      if (selection.value.purpose === 'Pedido inteiro') {
        if (!selection.value.customerId) return 'Selecione o cliente do pedido.'
        const customer = customers.find(item => item.id === selection.value.customerId)
        if (!selection.value.orderId || selection.value.orderId !== customer?.orderId) return 'Selecione um pedido que pertença ao cliente.'
        if (selected.value?.amountCents == null) return 'O valor ainda não foi medido.'
        if (selected.value.amountCents !== customer?.orderBalanceCents) return 'O valor precisa ser igual ao saldo exato do pedido.'
      }
      return ''
    }
    if (!outgoingPurposes.includes(selection.value.purpose)) return 'Escolha a categoria da saída.'
    if (!selection.value.partnerId) return 'Selecione quem recebeu o pagamento.'
    return ''
  })

  const canConfirm = computed(() => Boolean(selected.value && selected.value.amountCents != null)
    && selected.value?.movement !== 'own'
    && selected.value?.movement !== 'reference'
    && selection.value.movement !== 'unknown'
    && selection.value.movement !== 'own'
    && selection.value.movement !== 'reference'
    && !missingReason.value
    && (selection.value.accepted || correctionRequired.value))

  const searchResults = computed(() => {
    const term = normalize(query.value.trim())
    const digits = query.value.replace(/\D/g, '')
    const results: Array<{ id: number; label: string; detail: string; kind: 'customer' | 'partner' }> = []
    if (!term) return results
    if (selection.value.movement === 'in') {
      for (const customer of customers) {
        const text = normalize(`${customer.name} ${customer.alias}`)
        const phone = customer.phone.replace(/\D/g, '')
        const order = String(customer.orderId)
        if (text.includes(term) || (digits && phone.includes(digits)) || order.includes(query.value.trim())) {
          results.push({ id: customer.id, label: customer.name, detail: `${customer.alias} · ${customer.phone} · Pedido ${customer.orderId}`, kind: 'customer' })
        }
      }
    }
    if (selection.value.movement === 'out') {
      for (const partner of partners) {
        if (normalize(partner.name).includes(term) || normalize(partner.type).includes(term)) {
          results.push({ id: partner.id, label: partner.name, detail: partner.type, kind: 'partner' })
        }
      }
    }
    return results
  })

  function open(receipt: PreviewReceipt) {
    if (pendingIds.value.has(receipt.id)) return
    const item = items.value.find(candidate => candidate.id === receipt.id)
    if (!item) return
    selected.value = item
    selection.value = {
      movement: item.movement,
      customerId: item.customerId ?? null,
      orderId: item.orderId ?? null,
      partnerId: item.partnerId ?? null,
      purpose: item.suggestedPurpose ?? '',
      reason: '',
      accepted: false
    }
    initialSuggestion.value = { ...selection.value }
    reviewing.value = true
    query.value = ''
    editing.value = false
    evidenceOpen.value = false
    notice.value = ''
  }

  function close() {
    reviewing.value = false
    selected.value = null
    editing.value = false
    evidenceOpen.value = false
  }

  function acceptSuggestion() {
    if (!selected.value || !initialSuggestion.value) return
    selection.value = { ...selection.value, accepted: true }
  }

  function selectCustomer(id: number) {
    if (!customers.some(customer => customer.id === id)) return
    selection.value = { ...selection.value, movement: 'in', customerId: id, orderId: null, partnerId: null, purpose: '', accepted: false }
    query.value = ''
  }

  function selectPartner(id: number) {
    if (!partners.some(partner => partner.id === id)) return
    selection.value = { ...selection.value, partnerId: id, customerId: null, orderId: null, purpose: '', accepted: false }
    query.value = ''
  }

  function setMovement(movement: Movement) {
    selection.value = { ...emptySelection(movement), reason: selection.value.reason }
  }

  function setPurpose(purpose: string) {
    selection.value = { ...selection.value, purpose, orderId: purpose === 'Avulso' ? null : selection.value.orderId, accepted: false }
  }

  function setOrder(orderId: number | null) {
    selection.value = { ...selection.value, orderId, accepted: false }
  }

  function destinationName(receipt: PreviewReceipt, chosen: PreviewSelection): string {
    if (chosen.movement === 'in') {
      const customer = customers.find(item => item.id === chosen.customerId)
      const order = chosen.orderId ? `pedido ${chosen.orderId}` : 'recebimento avulso'
      return `${order}${customer ? ` de ${customer.name}` : ''}`
    }
    const partner = partners.find(item => item.id === chosen.partnerId)
    return `${partner?.name ?? receipt.payee} · ${chosen.purpose}`
  }

  function confirm() {
    const receipt = selected.value
    if (!receipt || receipt.amountCents == null || !canConfirm.value || pendingIds.value.has(receipt.id) || !items.value.some(item => item.id === receipt.id)) return false
    const snapshot = { ...receipt, amountCents: receipt.amountCents, evidence: { ...receipt.evidence } }
    const chosen = { ...selection.value }
    const target = destinationName(snapshot, chosen)
    const direction = chosen.movement === 'in' ? 'recebido' : 'pago'
    const message = `${formatBRL(snapshot.amountCents)} será ${direction} em ${target}`
    pendingIds.value = new Set(pendingIds.value).add(snapshot.id)
    close()
    schedule({
      message,
      errorMessage: 'Não foi possível concluir a prévia financeira.',
      commit: async () => {},
      onCommitted: () => {
        pendingIds.value = new Set([...pendingIds.value].filter(id => id !== snapshot.id))
        items.value = items.value.filter(item => item.id !== snapshot.id)
        if (snapshot.date.startsWith('2026-10')) {
          if (chosen.movement === 'in') {
            totals.value.inCents += snapshot.amountCents
          } else {
            totals.value.outCents += snapshot.amountCents
          }
        }
        const outcome = chosen.movement === 'in'
          ? `entrou em ${target}`
          : `saiu para ${target}`
        completed.value = [{ id: snapshot.id, text: `${formatBRL(snapshot.amountCents)} ${outcome}` }, ...completed.value]
        notice.value = 'Movimentação confirmada na prévia.'
      },
      onUndone: () => {
        pendingIds.value = new Set([...pendingIds.value].filter(id => id !== snapshot.id))
        notice.value = 'A confirmação foi desfeita. O comprovante continua na fila.'
      }
    })
    return true
  }

  function defer() {
    if (!selected.value) return
    notice.value = 'Comprovante mantido na fila para revisar depois.'
    close()
  }

  function markReference() {
    const receipt = selected.value
    if (!receipt || receipt.amountCents == null || receipt.movement !== 'reference' || pendingIds.value.has(receipt.id)) return false
    if (!items.value.some(item => item.id === receipt.id)) return false
    const snapshot = { ...receipt, amountCents: receipt.amountCents, evidence: { ...receipt.evidence } }
    pendingIds.value = new Set(pendingIds.value).add(snapshot.id)
    close()
    schedule({
      message: `${formatBRL(snapshot.amountCents)} será guardado como referência, sem contabilizar`,
      errorMessage: 'Não foi possível arquivar a referência na prévia.',
      commit: async () => {},
      onCommitted: () => {
        pendingIds.value = new Set([...pendingIds.value].filter(id => id !== snapshot.id))
        items.value = items.value.filter(item => item.id !== snapshot.id)
        completed.value = [{ id: snapshot.id, text: `${formatBRL(snapshot.amountCents)} · Guardado como referência, sem contabilizar` }, ...completed.value]
        notice.value = 'Comprovante guardado como referência, sem contabilizar.'
      },
      onUndone: () => {
        pendingIds.value = new Set([...pendingIds.value].filter(id => id !== snapshot.id))
        notice.value = 'O arquivamento foi desfeito. O comprovante continua na fila.'
      }
    })
    return true
  }

  return {
    items,
    selected,
    selection,
    reviewing,
    query,
    editing,
    evidenceOpen,
    notice,
    summary,
    toasts,
    undo,
    dismissError,
    pendingIds,
    completed,
    canConfirm,
    missingReason,
    correctionRequired,
    searchResults,
    open,
    close,
    acceptSuggestion,
    selectCustomer,
    selectPartner,
    setMovement,
    setPurpose,
    setOrder,
    confirm,
    defer,
    markReference
  }
}
