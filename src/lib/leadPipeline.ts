import type { LeadStatusTotals } from '../services/lead'

/**
 * Pipeline = SUM of non-terminal statuses: new + contacted + qualified.
 * CONVERTED (already won) and LOST are excluded.
 *
 * Today this coincides numerically with *.all — converted and lost are
 * both 0 — so using `all` would look correct now and be wrong the first time
 * a lead is won or lost.
 *
 * Returns null when the series is absent so the caller can fall back
 * (page sum) instead of rendering NaN.
 */
export function pipelineTotal(
  totals: Partial<LeadStatusTotals> | null | undefined
): number | null {
  if (totals == null) return null
  return (totals.new ?? 0) + (totals.contacted ?? 0) + (totals.qualified ?? 0)
}

export interface PipelineSelection {
  /** Headline: measured open pipeline, falling back to listed totals. Null → page-sum. */
  value: number | null
  /** Open pipeline from `totals` (includes items priced without width/height). */
  listed: number | null
  /** listed − measured. Null when either series is missing. */
  unmeasured: number | null
  /** Partner open pipeline (measured, else listed). Null when `partners` is absent. */
  partners: number | null
}

/** Loose input: a stale client may omit a status key or a whole series. */
export type PipelineCountsInput = {
  totals?: Partial<LeadStatusTotals> | null
  measuredTotals?: Partial<LeadStatusTotals> | null
  partners?: {
    totals?: Partial<LeadStatusTotals> | null
    measuredTotals?: Partial<LeadStatusTotals> | null
  } | null
}

/**
 * Pick the pipeline headline and its footnotes from GET /leads/counts.
 *
 * Headline prefers `measuredTotals` (items with both width and height).
 * `totals` is the listed book including unmeasured placeholders; the
 * difference is returned so the UI can show it instead of silently dropping
 * it. Top-level keys already exclude partner-linked leads; those come back
 * under `partners`.
 */
export function selectPipeline(
  counts: PipelineCountsInput | null | undefined
): PipelineSelection {
  if (counts == null) {
    return { value: null, listed: null, unmeasured: null, partners: null }
  }

  const measured = pipelineTotal(counts.measuredTotals)
  const listed = pipelineTotal(counts.totals)
  const value = measured ?? listed
  const unmeasured = measured != null && listed != null ? listed - measured : null
  const partners =
    counts.partners == null
      ? null
      : pipelineTotal(counts.partners.measuredTotals) ??
        pipelineTotal(counts.partners.totals)

  return { value, listed, unmeasured, partners }
}
