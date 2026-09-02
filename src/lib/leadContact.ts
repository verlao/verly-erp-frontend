const SYNTHETIC_WHATSAPP_EMAIL_SUFFIX = '@whatsapp.internal'

/**
 * WhatsApp JIDs can arrive in the email field because they identify the bot
 * contact. They remain part of the lead data, but must not be offered as email.
 */
export function isSyntheticEmail(email?: string | null): boolean {
  return email?.trim().toLowerCase().endsWith(SYNTHETIC_WHATSAPP_EMAIL_SUFFIX) ?? false
}
