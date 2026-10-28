// Tradutor puro LeadDTO -> apresentação da revisão. Nunca lança: dado ausente,
// inválido ou de origem desconhecida vira `null`/'unknown', jamais 0 ou "confirmado".
import type { LeadDTO, LeadItemDTO } from '@/services/lead'

export type Origin = 'record' | 'extracted' | 'default' | 'calculated' | 'confirmed' | 'unknown'

export interface Field<T> {
  value: T | null
  origin: Origin
}

export interface ReviewItem {
  id: number | null
  productType: Field<string>
  color: Field<string>
  sheets: Field<number>
  widthCm: Field<number>
  heightCm: Field<number>
  areaM2: Field<number>
  quantity: Field<number>
  estimatedValue: Field<number>
  /** Medida declarada como pendente: o valor, se houver, precisa de conferência. */
  needsCheck: boolean
  variantGroup: string | null
  variantSelected: boolean
}

export interface VariantGroup {
  group: string
  items: ReviewItem[]
}

export interface TranscriptMessage {
  body: string
  fromMe: boolean
  at: string | null
}

export interface LeadReview {
  contactName: Field<string>
  contactPhone: Field<string>
  customerLink: Field<number>
  /** true somente quando o backend registrou confirmação da extração. */
  extractionConfirmed: boolean
  /** Itens fora de grupo de variantes. */
  items: ReviewItem[]
  /** Alternativas A/B: escolha exclusiva, nunca somar. */
  variantGroups: VariantGroup[]
  negotiated: { value: number | null; quote: string | null } | null
  visit: { date: string | null; quote: string | null } | null
  transcript: TranscriptMessage[]
  /** Nomes dos campos sem valor, no formato `contactName`, `items[0].widthCm`. */
  missing: string[]
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)
const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() !== '' ? v : null)
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)

function field<T>(value: T | null, origin: Origin): Field<T> {
  return value === null ? { value: null, origin: 'unknown' } : { value, origin }
}

export function parseLeadData(data: unknown): Record<string, unknown> | null {
  if (typeof data !== 'string') return null
  try {
    const parsed: unknown = JSON.parse(data)
    return isRecord(parsed) ? parsed : null
  } catch {
    return null
  }
}

function parseSignals(data: Record<string, unknown> | null): Pick<LeadReview, 'negotiated' | 'visit'> {
  const signals = data && isRecord(data.signals) ? data.signals : null
  let negotiated: LeadReview['negotiated'] = null
  let visit: LeadReview['visit'] = null
  if (signals && isRecord(signals.negotiated)) {
    const value = num(signals.negotiated.value)
    const quote = str(signals.negotiated.quote)
    if (value !== null || quote !== null) negotiated = { value, quote }
  }
  if (signals && isRecord(signals.visit)) {
    const date = str(signals.visit.date)
    const quote = str(signals.visit.quote)
    if (date !== null || quote !== null) visit = { date, quote }
  }
  return { negotiated, visit }
}

function parseTranscript(data: Record<string, unknown> | null): TranscriptMessage[] {
  if (!data || !Array.isArray(data.transcript)) return []
  const out: TranscriptMessage[] = []
  for (const m of data.transcript) {
    if (isRecord(m) && typeof m.body === 'string' && typeof m.fromMe === 'boolean') {
      out.push({ body: m.body, fromMe: m.fromMe, at: str(m.at) })
    }
  }
  return out
}

function translateItem(item: LeadItemDTO, confirmed: boolean): ReviewItem {
  const base: Origin = confirmed ? 'confirmed' : 'extracted'
  const pending = item.pendingMeasurement === true
  const measureOrigin: Origin = pending ? 'extracted' : base
  // Cor INCOLOR e 1 folha podem ser defaults do bot; sem confirmação não afirmamos que são fatos.
  const color = str(item.color)
  const sheets = num(item.sheets)
  const group = str(item.variantGroup)
  return {
    id: num(item.id),
    productType: field(str(item.productType), base),
    color: field(color, color === 'INCOLOR' && !confirmed ? 'default' : base),
    sheets: field(sheets, sheets === 1 && !confirmed ? 'default' : base),
    widthCm: field(num(item.widthCm), measureOrigin),
    heightCm: field(num(item.heightCm), measureOrigin),
    areaM2: field(num(item.areaM2), measureOrigin),
    quantity: field(num(item.quantity), base),
    // Valor vem da API como recebido; ausente permanece null (nunca 0).
    estimatedValue: field(num(item.estimatedValue), 'record'),
    needsCheck: pending,
    variantGroup: group,
    variantSelected: item.variantSelected === true,
  }
}

const ITEM_FIELDS = ['productType', 'color', 'sheets', 'widthCm', 'heightCm', 'quantity'] as const

export function translateLead(lead: LeadDTO): LeadReview {
  const data = parseLeadData(lead.data)
  const confirmed = !!lead.extractionConfirmedAt
  const rawItems = Array.isArray(lead.items) ? lead.items.filter(isRecord) : []
  const all = rawItems.map(i => translateItem(i as LeadItemDTO, confirmed))

  const items: ReviewItem[] = []
  const groups = new Map<string, ReviewItem[]>()
  for (const it of all) {
    if (it.variantGroup === null) items.push(it)
    else groups.set(it.variantGroup, [...(groups.get(it.variantGroup) ?? []), it])
  }

  const customerId = num(lead.convertedCustomerId)
  const review: LeadReview = {
    // Nome do perfil do WhatsApp não é nome legal: sempre 'extracted'.
    contactName: field(str(lead.name), 'extracted'),
    contactPhone: field(str(lead.phone), 'extracted'),
    customerLink: field(customerId !== null && customerId > 0 ? customerId : null, 'record'),
    extractionConfirmed: confirmed,
    items,
    variantGroups: [...groups].map(([group, list]) => ({ group, items: list })),
    ...parseSignals(data),
    transcript: parseTranscript(data),
    missing: [],
  }

  if (review.contactName.value === null) review.missing.push('contactName')
  if (review.contactPhone.value === null) review.missing.push('contactPhone')
  all.forEach((it, i) => {
    for (const f of ITEM_FIELDS) if (it[f].value === null) review.missing.push(`items[${i}].${f}`)
  })
  return review
}
