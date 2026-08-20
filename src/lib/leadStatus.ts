import type { LeadStatus } from '../services/lead'

/**
 * Opening WhatsApp is a first-contact signal. Only NEW may advance to CONTACTED.
 * Missing status is treated as NEW (same as the inbox filter). CONTACTED,
 * QUALIFIED, CONVERTED, and LOST are never changed — and an in-flight PATCH
 * must not be duplicated by a double-tap.
 */
export function shouldMarkContactedOnWhatsapp(
  status: LeadStatus | undefined,
  inFlight = false
): boolean {
  if (inFlight) return false
  return (status ?? 'NEW') === 'NEW'
}
