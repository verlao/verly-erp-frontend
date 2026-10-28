// Identidade de contexto carregada na query da rota (reload mantém a seleção).
// Só IDs inteiros positivos; nunca casa por nome.
import type { LocationQuery, RouteLocationRaw } from 'vue-router'

export type ContextKey = 'leadId' | 'customerId' | 'quoteId' | 'orderId' | 'partnerId'

export type ContextIds = Partial<Record<ContextKey, number | null>>

type QueryValue = unknown

/** Aceita apenas string de dígitos decimais que seja inteiro positivo seguro. */
export function parseContextId(raw: QueryValue): number | null {
  if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw)) return null
  const n = Number(raw)
  return Number.isSafeInteger(n) ? n : null
}

export function parseContextQuery(query: Record<string, QueryValue>): Record<ContextKey, number | null> {
  return {
    leadId: parseContextId(query.leadId),
    customerId: parseContextId(query.customerId),
    quoteId: parseContextId(query.quoteId),
    orderId: parseContextId(query.orderId),
    partnerId: parseContextId(query.partnerId),
  }
}

function requireId(id: number, label: string): number {
  if (!Number.isSafeInteger(id) || id <= 0) throw new RangeError(`Invalid ${label}: ${id}`)
  return id
}

/** Cliente -> pedidos filtrados por esse cliente. */
export function customerOrdersRoute(customerId: number): RouteLocationRaw {
  return { path: '/orders', query: { customerId: String(requireId(customerId, 'customerId')) } }
}

/** Lead -> revisão do orçamento. */
export function leadQuoteRoute(leadId: number): RouteLocationRaw {
  return { path: `/leads/${requireId(leadId, 'leadId')}/orcamento` }
}

/** Novo orçamento já com o contexto de lead ou cliente (exatamente um). */
export function newQuoteRoute(ctx: { leadId: number } | { customerId: number }): RouteLocationRaw {
  if ('leadId' in ctx) return { path: '/new-quote', query: { leadId: String(requireId(ctx.leadId, 'leadId')) } }
  return { path: '/new-quote', query: { customerId: String(requireId(ctx.customerId, 'customerId')) } }
}

/** Remove uma chave de contexto preservando o resto da query. */
export function withoutContextKey(query: LocationQuery, key: ContextKey): LocationQuery {
  const { [key]: _removed, ...rest } = query
  return rest
}
