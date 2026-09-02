import { describe, expect, it } from 'vitest'
import { isSyntheticEmail } from './leadContact'

describe('isSyntheticEmail', () => {
  it('identifies WhatsApp JIDs stored in the email field', () => {
    expect(isSyntheticEmail('5521969478521@whatsapp.internal')).toBe(true)
    expect(isSyntheticEmail('  CONTACT@WHATSAPP.INTERNAL ')).toBe(true)
  })

  it('keeps real and missing email addresses available', () => {
    expect(isSyntheticEmail('cliente@example.com')).toBe(false)
    expect(isSyntheticEmail('cliente@internal.example')).toBe(false)
    expect(isSyntheticEmail(null)).toBe(false)
    expect(isSyntheticEmail(undefined)).toBe(false)
  })
})
