import leadService, { type LeadDTO } from './lead'
import quoteService, {
  type CreateQuoteFromLeadPayload,
} from './quote'

export interface ConfirmationResult {
  quote: { id: number; daysUntilExpiration?: number }
  lead: LeadDTO
}

/**
 * The quote was created, but the lead could not be read back as confirmed.
 * Repeating the save would create a second quote.
 */
export class LeadConfirmationNotReadError extends Error {
  override readonly name = 'LeadConfirmationNotReadError'
  readonly quoteId: number

  constructor(quoteId: number) {
    super('A API não confirmou a atualização do lead')
    this.quoteId = quoteId
  }
}

/**
 * POST /quotes/from-lead is the backend's authoritative confirmation command.
 * A fresh lead read is required before the UI may show success or "Conferido".
 */
export async function confirmLeadExtraction(
  payload: CreateQuoteFromLeadPayload,
): Promise<ConfirmationResult> {
  const quote = await quoteService.createFromLead(payload)
  let confirmedLead: LeadDTO
  try {
    confirmedLead = await leadService.getFreshById(payload.leadId)
  } catch {
    throw new LeadConfirmationNotReadError(quote.id)
  }

  if (!confirmedLead.extractionConfirmedAt) {
    throw new LeadConfirmationNotReadError(quote.id)
  }

  return { quote, lead: confirmedLead }
}
