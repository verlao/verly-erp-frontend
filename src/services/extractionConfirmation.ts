import leadService, { type LeadDTO } from './lead'
import quoteService, {
  type CreateQuoteFromLeadPayload,
} from './quote'

export interface ConfirmationResult {
  quote: { id: number; daysUntilExpiration?: number }
  lead: LeadDTO
}

/**
 * POST /quotes/from-lead is the backend's authoritative confirmation command.
 * A fresh lead read is required before the UI may show success or "Conferido".
 */
export async function confirmLeadExtraction(
  payload: CreateQuoteFromLeadPayload,
): Promise<ConfirmationResult> {
  const quote = await quoteService.createFromLead(payload)
  const confirmedLead = await leadService.getFreshById(payload.leadId)

  if (!confirmedLead.extractionConfirmedAt) {
    throw new Error('A API não confirmou a atualização do lead')
  }

  return { quote, lead: confirmedLead }
}
