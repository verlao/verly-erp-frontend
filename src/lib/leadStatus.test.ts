import { describe, expect, it } from 'vitest'
import { shouldMarkContactedOnWhatsapp } from './leadStatus'
import type { LeadStatus } from '../services/lead'

describe('shouldMarkContactedOnWhatsapp', () => {
  it('advances NEW to CONTACTED', () => {
    expect(shouldMarkContactedOnWhatsapp('NEW')).toBe(true)
  })

  it('treats missing status as NEW', () => {
    expect(shouldMarkContactedOnWhatsapp(undefined)).toBe(true)
  })

  it('never regresses a later funnel stage', () => {
    const blocked: LeadStatus[] = ['CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']
    for (const status of blocked) {
      expect(shouldMarkContactedOnWhatsapp(status)).toBe(false)
    }
  })

  it('no-ops while a PATCH is already in flight', () => {
    expect(shouldMarkContactedOnWhatsapp('NEW', true)).toBe(false)
    expect(shouldMarkContactedOnWhatsapp(undefined, true)).toBe(false)
  })
})
