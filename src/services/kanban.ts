import api from './api'
import leadService from './lead'
import quoteService from './quote'
import orderService from './order'
import type { LeadDTO, LeadTier } from './lead'
import type { QuoteDTO } from './quote'

export type KanbanColumnKey =
  | 'NOVO'
  | 'PRECISA_MEDIR'
  | 'AGUARDANDO_ORCAMENTO'
  | 'FECHAMENTO'
  | 'PEDIDO'
  | 'PAGO'

export interface KanbanCardDTO {
  key: string // estável p/ drag: `lead-1` | `order-3`
  id: number
  type: 'LEAD' | 'QUOTE' | 'ORDER'
  title: string
  phone?: string
  value?: number
  badges: string[]
  leadId?: number
  quoteId?: number
  orderId?: number
  status?: string
  measurementStatus?: string
  tier?: LeadTier
}

export type KanbanBoard = Record<KanbanColumnKey, KanbanCardDTO[]>

export const KANBAN_COLUMNS: { key: KanbanColumnKey; label: string }[] = [
  { key: 'NOVO', label: 'Novo' },
  { key: 'PRECISA_MEDIR', label: 'Precisa medir' },
  { key: 'AGUARDANDO_ORCAMENTO', label: 'Aguardando orçamento' },
  { key: 'FECHAMENTO', label: 'Fechamento' },
  { key: 'PEDIDO', label: 'Pedido' },
  { key: 'PAGO', label: 'Pago' },
]

function emptyBoard(): KanbanBoard {
  return {
    NOVO: [],
    PRECISA_MEDIR: [],
    AGUARDANDO_ORCAMENTO: [],
    FECHAMENTO: [],
    PEDIDO: [],
    PAGO: [],
  }
}

function normalizeBackendBoard(data: any): KanbanBoard {
  const board = emptyBoard()
  for (const col of data?.columns ?? []) {
    const key = col.key as KanbanColumnKey
    if (!(key in board)) continue
    board[key] = (col.cards ?? []).map((c: any) => ({
      key: `${(c.type || 'LEAD').toLowerCase()}-${c.id}`,
      id: c.id,
      type: c.type || 'LEAD',
      title: c.title,
      phone: c.phone,
      value: c.value != null ? Number(c.value) : undefined,
      badges: c.badges ?? [],
      leadId: c.leadId,
      quoteId: c.quoteId,
      orderId: c.orderId,
      status: c.status,
      measurementStatus: c.measurementStatus,
      tier: c.tier,
    }))
  }
  return board
}

const CANCELLED = new Set(['CANCELADO', 'CANCELED', 'CANCELLED'])

/**
 * Regra pura de bucket (espelha o backend): primeira que casa vence.
 * order/quote já devem vir filtrados (pedido cancelado = undefined).
 * Retorna null para leads fora do board (CONVERTED sem rastreio).
 */
export function columnForLead(
  lead: Pick<LeadDTO, 'status' | 'measurementStatus'>,
  quote?: Pick<QuoteDTO, 'status'>,
  order?: { debt?: number | null }
): KanbanColumnKey | null {
  if (lead.status === 'LOST') return null
  if (order) return Number(order.debt ?? 1) <= 0 ? 'PAGO' : 'PEDIDO'
  if (quote?.status === 'VALID') return 'FECHAMENTO'
  const m = lead.measurementStatus
  if (m === 'NEEDED' || m === 'SCHEDULED') return 'PRECISA_MEDIR'
  if (m === 'DONE' || lead.status === 'QUALIFIED' || lead.status === 'CONTACTED') {
    return 'AGUARDANDO_ORCAMENTO'
  }
  if (lead.status === 'NEW' || !lead.status) return 'NOVO'
  return null
}

/**
 * Fallback client-side (backend sem /kanban ainda): compõe o board de
 * leads + quotes (leadId desde V2_21) + orders. Mesmas regras do backend,
 * bucket único por lead, primeira regra que casa vence (Pago → ... → Novo).
 */
async function composeBoardClientSide(): Promise<KanbanBoard> {
  const [leadsResp, quotes, orders] = await Promise.all([
    leadService.getAll({ page: 0, size: 200 }),
    quoteService.getAll() as Promise<QuoteDTO[]>,
    orderService.getAllNonPaginated(),
  ])
  const leads: LeadDTO[] = Array.isArray(leadsResp) ? leadsResp : (leadsResp?.content ?? [])
  const ordersById = new Map<number, any>()
  for (const o of orders ?? []) if (o?.id != null) ordersById.set(Number(o.id), o)

  const quoteByLead = new Map<number, QuoteDTO>()
  const rank = (q: QuoteDTO) => (q.status === 'VALID' ? 3 : q.status === 'CONVERTED' ? 2 : 1)
  for (const q of quotes ?? []) {
    const leadId = (q as any).leadId
    if (leadId == null) continue
    const prev = quoteByLead.get(leadId)
    if (!prev || rank(q) > rank(prev)) quoteByLead.set(leadId, q)
  }

  const board = emptyBoard()
  for (const lead of leads) {
    if (!lead.id || lead.status === 'LOST') continue
    const quote = quoteByLead.get(lead.id)
    let order = quote?.convertedOrderId != null ? ordersById.get(Number(quote.convertedOrderId)) : undefined
    if (order && CANCELLED.has(String(order.status || '').toUpperCase())) order = undefined

    const m = lead.measurementStatus
    const column = columnForLead(lead, quote, order)
    if (!column) continue // LOST fora; CONVERTED sem rastreio de quote/pedido

    const isOrderCard = column === 'PEDIDO' || column === 'PAGO'
    board[column].push({
      key: isOrderCard ? `order-${order.id}` : `lead-${lead.id}`,
      id: isOrderCard ? Number(order.id) : lead.id,
      type: isOrderCard ? 'ORDER' : column === 'FECHAMENTO' ? 'QUOTE' : 'LEAD',
      title: lead.name,
      phone: lead.phone,
      value: isOrderCard
        ? Number(order.price ?? 0)
        : column === 'FECHAMENTO'
          ? Number(quote?.totalPrice ?? 0)
          : lead.totalEstimatedValue,
      badges: [],
      leadId: lead.id,
      quoteId: quote?.id,
      orderId: isOrderCard ? Number(order.id) : undefined,
      status: isOrderCard ? order.status : column === 'FECHAMENTO' ? quote?.status : lead.status,
      measurementStatus: m,
      tier: lead.tier,
    })
  }
  return board
}

const kanbanService = {
  getBoard: async (): Promise<KanbanBoard> => {
    try {
      const response = await api.get('/kanban')
      return normalizeBackendBoard(response.data)
    } catch (e: any) {
      if (e?.response?.status !== 404) throw e
      return composeBoardClientSide()
    }
  },
}

export default kanbanService
