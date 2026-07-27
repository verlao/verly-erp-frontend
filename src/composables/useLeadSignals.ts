// Sinais + timeline que o bot grava no blob JSON `lead.data`.
// Fonte única (DRY) usada por LeadPreview, LeadListItem e LeadsOverview.
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { LeadDTO } from '../services/lead'

export interface LeadSignals {
  payment?: { detected?: boolean; quote?: string | null }
  visit?: { detected?: boolean; date?: string | null; quote?: string | null }
  closed?: { detected?: boolean; quote?: string | null }
  objection?: { detected?: boolean; quote?: string | null }
}
export interface TranscriptMsg {
  fromMe?: boolean
  body?: string
  at?: string | null
}
export interface SignalChip {
  key: string
  label: string
  cls: string
}

export function parseLeadData(raw?: string): { signals?: LeadSignals; transcript?: TranscriptMsg[] } | null {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function getSignalChips(signals?: LeadSignals | null): SignalChip[] {
  if (!signals) return []
  const chips: SignalChip[] = []
  if (signals.payment?.detected) chips.push({ key: 'payment', label: '💰 Pagou', cls: 'bg-success/15 text-success' })
  if (signals.visit?.detected) chips.push({ key: 'visit', label: `📅 Visita${signals.visit.date ? ' ' + signals.visit.date : ''}`, cls: 'bg-info/15 text-info' })
  if (signals.closed?.detected) chips.push({ key: 'closed', label: '✅ Fechou', cls: 'bg-success/15 text-success' })
  if (signals.objection?.detected) chips.push({ key: 'objection', label: '⚠️ Objeção', cls: 'bg-warning/15 text-warning' })
  return chips
}

// Badge de status do lead — mapa único usado por LeadListItem e LeadPreview.
export interface StatusBadgeConfig {
  label: string
  variant: 'default' | 'secondary' | 'success' | 'warning' | 'info'
  dot: boolean
}

const STATUS_BADGES: Record<string, StatusBadgeConfig> = {
  NEW: { label: 'Novo', variant: 'info', dot: true },
  CONTACTED: { label: 'Contatado', variant: 'warning', dot: false },
  QUALIFIED: { label: 'Qualificado', variant: 'success', dot: false },
  CONVERTED: { label: 'Convertido', variant: 'default', dot: false },
  LOST: { label: 'Perdido', variant: 'secondary', dot: false },
}

export function statusBadgeConfig(status?: string | null): StatusBadgeConfig {
  return STATUS_BADGES[status ?? 'NEW'] ?? STATUS_BADGES.NEW
}

// Badge de tier ($ / $$ / $$$) — classes token-driven, único lugar que as define.
export function tierBadgeClass(tier?: string | null): string {
  if (tier === '$$$') return 'bg-warning text-warning-foreground'
  if (tier === '$$') return 'bg-info text-info-foreground'
  if (tier === '$') return 'bg-muted text-muted-foreground'
  return ''
}

export function getNextAction(signals?: LeadSignals | null): string {
  if (!signals) return ''
  if (signals.closed?.detected) return 'Cliente fechou → converter em cliente'
  if (signals.payment?.detected) return 'Pagamento sinalizado → confirmar comprovante no Financeiro'
  if (signals.visit?.detected) return `Visita combinada${signals.visit.date ? ' (' + signals.visit.date + ')' : ''} → confirmar agenda`
  if (signals.objection?.detected) return 'Objeção → fazer follow-up'
  return ''
}

// Lead "quente": tem sinal de compra (fechou/pagou/visita) OU tier de alto valor.
export function isHotLead(lead?: LeadDTO | null): boolean {
  if (!lead) return false
  const s = parseLeadData(lead.data)?.signals
  if (s?.closed?.detected || s?.payment?.detected || s?.visit?.detected) return true
  return lead.tier === '$$$'
}

// Motivo curto do "quente" (pra listar no command center).
export function hotReason(lead?: LeadDTO | null): string {
  if (!lead) return ''
  const s = parseLeadData(lead.data)?.signals
  if (s?.closed?.detected) return 'fechou o pedido'
  if (s?.payment?.detected) return 'sinalizou pagamento'
  if (s?.visit?.detected) return 'agendou visita/medição'
  if (s?.objection?.detected) return 'objeção — precisa follow-up'
  if (lead.tier === '$$$') return 'orçamento de alto valor'
  return 'novo lead'
}

export function fmtTime(at?: string | null): string {
  if (!at) return ''
  try {
    return new Date(at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

// Wrapper reativo pra uso single-lead (ex.: LeadPreview).
export function useLeadSignals(leadSource: MaybeRefOrGetter<LeadDTO | undefined>) {
  const parsed = computed(() => parseLeadData(toValue(leadSource)?.data))
  const signals = computed<LeadSignals | null>(() => parsed.value?.signals ?? null)
  const transcript = computed<TranscriptMsg[]>(() => parsed.value?.transcript ?? [])
  const signalChips = computed(() => getSignalChips(signals.value))
  const nextAction = computed(() => getNextAction(signals.value))
  return { signals, transcript, signalChips, nextAction }
}
