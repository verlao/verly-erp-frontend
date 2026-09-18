import type { LeadDTO } from '../services/lead'

/**
 * The list used to age leads by `createdDate`, which is the lead's BIRTH date and
 * never moves. A lead created in July and answered on WhatsApp yesterday rendered
 * as "15 de jul." — indistinguishable from one nobody had touched in two months.
 * `lastActivityDate` is the live signal (the backend fills it for every lead), so
 * freshness reads it first and only falls back to birth for a lead with no activity.
 *
 * Both columns are wall-clock São Paulo time with no zone suffix, which `new Date`
 * parses as local — the same parsing the list has always used. Do not "fix" that
 * into UTC without also changing what the backend writes.
 */
export function freshnessStamp(lead: Pick<LeadDTO, 'createdDate' | 'lastActivityDate'>): string | undefined {
  return lead.lastActivityDate ?? lead.createdDate
}

function parseStamp(stamp: string | undefined): Date | undefined {
  if (!stamp) return undefined
  const date = new Date(stamp)
  return Number.isNaN(date.getTime()) ? undefined : date
}

/**
 * Relative up to a week, absolute after — past that a "há 34 dias" is noise and the
 * date is what someone actually looks for. Future stamps (clock skew between the Pi
 * and the browser) clamp to "agora" instead of rendering a negative age.
 */
export function formatFreshness(
  lead: Pick<LeadDTO, 'createdDate' | 'lastActivityDate'>,
  now: Date = new Date()
): string {
  const date = parseStamp(freshnessStamp(lead))
  if (!date) return ''

  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60_000)
  if (diffMins < 1) return 'agora'
  if (diffMins < 60) return `há ${diffMins}min`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `há ${diffHours}h`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}
