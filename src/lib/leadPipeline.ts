import type { LeadStatusTotals } from '../services/lead'

/**
 * Pipeline = SUM of non-terminal statuses: new + contacted + qualified.
 * CONVERTED (already won) and LOST are excluded.
 *
 * Today this coincides numerically with totals.all — converted and lost are
 * both 0 — so using `all` would look correct now and be wrong the first time
 * a lead is won or lost.
 *
 * Returns null when `totals` is absent so the caller can fall back (page sum)
 * instead of rendering NaN.
 */
export function pipelineTotal(
  totals: Partial<LeadStatusTotals> | null | undefined
): number | null {
  if (totals == null) return null
  return (totals.new ?? 0) + (totals.contacted ?? 0) + (totals.qualified ?? 0)
}
