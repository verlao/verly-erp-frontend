import { ref } from 'vue'

export type QuoteLinePreview = { name: string; glass: string; width: number; height: number; quantity: number; unitCents: number; leaves?: number }

export type QuotePreviewStatus = 'Válido' | 'Expirando' | 'Convertido' | 'Expirado'
export type QuotePreview = {
  id: number
  customer: string
  phone: string
  item: string
  width: number
  height: number
  glass: string
  quantity: number
  totalCents: number
  profitCents: number
  items?: QuoteLinePreview[]
  status: QuotePreviewStatus
  created: string
  expires: string
  terms: string
  orderId?: number
}

export type OrderPreviewStage = 'Medição' | 'Produção' | 'Instalação'
export type OrderPreview = {
  id: number
  quoteId?: number
  customer: string
  phone: string
  item: string
  measure: string
  quantity: number
  total: number
  paid: number
  stage: OrderPreviewStage
  measureDate: string
  production: string
  installDate: string
  installDateValue?: string
  address: string
  responsible: string
  paymentNote: string
  items?: QuoteLinePreview[]
}

// These fixtures belong to the isolated preview and reset with a page reload.
export const previewQuotes = ref<QuotePreview[]>([
  { id: 2841, customer: 'Mariana Exemplo', phone: '(21) 98842-1603', item: 'Box frontal', width: 140, height: 190, glass: 'Incolor 8 mm', quantity: 1, totalCents: 152490, profitCents: 35190, status: 'Válido', created: '14 out', expires: '21 out', terms: '50% de entrada · saldo na instalação' },
  { id: 2840, customer: 'Estúdio Exemplo', phone: '(21) 99108-4412', item: 'Espelho lapidado', width: 90, height: 120, glass: 'Espelho 4 mm', quantity: 2, totalCents: 138600, profitCents: 31700, status: 'Expirando', created: '12 out', expires: '16 out', terms: 'À vista ou em até 6x no cartão' },
  { id: 2838, customer: 'Rafael Teste', phone: '(21) 99772-0834', item: 'Janela de correr', width: 160, height: 110, glass: 'Verde 8 mm', quantity: 1, totalCents: 184900, profitCents: 42600, status: 'Convertido', created: '10 out', expires: '17 out', terms: '40% de entrada · saldo na instalação', orderId: 1051 },
  { id: 2831, customer: 'Clínica Exemplo', phone: '(21) 98210-7741', item: 'Divisória fixa', width: 220, height: 205, glass: 'Incolor 10 mm', quantity: 1, totalCents: 329800, profitCents: 72100, status: 'Expirado', created: '2 out', expires: '9 out', terms: '50% de entrada · saldo na instalação' },
])

export const previewOrders = ref<OrderPreview[]>([
  { id: 1048, customer: 'Ana Exemplo', phone: '(11) 99999-4421', item: 'Janela temperada', measure: '120 × 80 cm · Incolor 8 mm', quantity: 1, total: 134000, paid: 38000, stage: 'Medição', measureDate: 'A confirmar', production: 'Aguardando medidas', installDate: 'A agendar', address: 'Rua Exemplo, 1048 · Bairro Modelo, São Paulo', responsible: 'Equipe a definir', paymentNote: 'Sinal recebido · Pix' },
  { id: 1052, customer: 'Beatriz Teste', phone: '(11) 99999-4422', item: 'Box de correr', measure: '150 × 190 cm · Verde 8 mm', quantity: 1, total: 112000, paid: 64000, stage: 'Produção', measureDate: 'Concluída · 13 out', production: 'Corte em andamento', installDate: 'A agendar', address: 'Av. Exemplo, 2052 · Vila Teste, São Paulo', responsible: 'Equipe de instalação a definir', paymentNote: 'Entrada recebida · Pix' },
  { id: 1051, customer: 'Rafael Teste', phone: '(21) 99772-0834', item: 'Janela de correr', measure: '160 × 110 cm · Verde 8 mm', quantity: 1, total: 184900, paid: 110940, stage: 'Instalação', measureDate: 'Concluída · 9 out', production: 'Pronta', installDate: '17 out · 9h às 12h', installDateValue: '2026-10-17T09:00', address: 'Av. Maracanã, 720 · Tijuca', responsible: 'Equipe Norte', paymentNote: 'Entrada recebida · Pix' },
  { id: 1046, customer: 'Estúdio Exemplo', phone: '(21) 99108-4412', item: 'Divisória fixa', measure: '220 × 205 cm · Incolor 10 mm', quantity: 1, total: 329800, paid: 164900, stage: 'Produção', measureDate: 'Concluída · 11 out', production: 'Preparação dos perfis', installDate: 'A agendar', address: 'Rua Jardim Botânico, 510 · Jardim Botânico', responsible: 'Equipe a definir', paymentNote: '50% de entrada recebida' },
])

let nextQuoteId = 2842
let nextOrderId = 1053

export function addPreviewQuote(input: Omit<QuotePreview, 'id' | 'created' | 'expires' | 'status'>): QuotePreview {
  const quote: QuotePreview = {
    ...input,
    id: nextQuoteId++,
    created: '15 out',
    expires: '22 out',
    status: 'Válido',
  }
  previewQuotes.value = [quote, ...previewQuotes.value]
  return quote
}

export function convertPreviewQuote(quoteId: number): OrderPreview | null {
  const quote = previewQuotes.value.find(item => item.id === quoteId)
  if (!quote || (quote.status !== 'Válido' && quote.status !== 'Expirando')) return null

  const orderId = nextOrderId++
  const order: OrderPreview = {
    id: orderId,
    quoteId,
    items: quote.items?.map(item => ({ ...item })),
    customer: quote.customer,
    phone: quote.phone,
    item: quote.item,
    measure: quote.items && quote.items.length > 1 ? `${quote.items.length} tipos de peça · medidas no detalhe` : `${quote.width} × ${quote.height} cm · ${quote.glass}`,
    quantity: quote.quantity,
    total: quote.totalCents,
    paid: 0,
    stage: 'Medição',
    measureDate: 'A confirmar',
    production: 'Aguardando medidas',
    installDate: 'A agendar',
    address: 'Endereço a confirmar com o cliente',
    responsible: 'Equipe a definir',
    paymentNote: 'Nenhum pagamento registrado neste pedido',
  }
  previewQuotes.value = previewQuotes.value.map(item => item.id === quoteId
    ? { ...item, status: 'Convertido' as const, orderId }
    : item)
  previewOrders.value = [order, ...previewOrders.value]
  return order
}
