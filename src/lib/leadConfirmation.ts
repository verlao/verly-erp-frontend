import type { LeadDTO } from '../services/lead'

/**
 * A late cached response may update ordinary lead fields, but it cannot erase
 * the human-confirmed extraction already observed in this session.
 */
export function preserveConfirmedExtraction(
  current: LeadDTO | undefined,
  incoming: LeadDTO,
): LeadDTO {
  if (!current?.extractionConfirmedAt || incoming.extractionConfirmedAt) {
    return incoming
  }

  return {
    ...incoming,
    extractionConfirmedAt: current.extractionConfirmedAt,
    items: current.items,
    originalExtractedItems: current.originalExtractedItems,
    totalEstimatedValue: current.totalEstimatedValue,
    totalEstimatedProfit: current.totalEstimatedProfit,
    tier: current.tier,
  }
}

export function reconcileLeadList(
  current: LeadDTO[],
  incoming: LeadDTO[],
): LeadDTO[] {
  const currentById = new Map(current.map((lead) => [lead.id, lead]))
  return incoming.map((lead) =>
    preserveConfirmedExtraction(currentById.get(lead.id), lead),
  )
}
