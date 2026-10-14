import { afterEach, describe, expect, it, vi } from 'vitest'
import { isEnabled, type FlagName } from './flags'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('isEnabled', () => {
  it('is off by default when the variable is not set', () => {
    expect(isEnabled('PIX_ORDER_LINK')).toBe(false)
  })

  it('is on only when the variable is exactly "true"', () => {
    vi.stubEnv('VITE_FLAG_LIVE_EVENTS', 'true')
    expect(isEnabled('LIVE_EVENTS')).toBe(true)
  })

  it.each(['false', '', '1', 'TRUE', 'yes'])('stays off for the value %j', (value) => {
    vi.stubEnv('VITE_FLAG_LEAD_SNOOZE', value)
    expect(isEnabled('LEAD_SNOOZE')).toBe(false)
  })

  it('reads each flag from its own VITE_FLAG_ variable', () => {
    vi.stubEnv('VITE_FLAG_MOBILE_SHELL', 'true')
    expect(isEnabled('MOBILE_SHELL')).toBe(true)
    expect(isEnabled('PIX_DISMISS')).toBe(false)
  })

  it('reads the environment at call time, not at import time', () => {
    expect(isEnabled('LEAD_LOST_REASON')).toBe(false)
    vi.stubEnv('VITE_FLAG_LEAD_LOST_REASON', 'true')
    expect(isEnabled('LEAD_LOST_REASON')).toBe(true)
    vi.unstubAllEnvs()
    expect(isEnabled('LEAD_LOST_REASON')).toBe(false)
  })

  it('covers every declared flag name', () => {
    const names: FlagName[] = [
      'PIX_ORDER_LINK',
      'PIX_DISMISS',
      'LIVE_EVENTS',
      'LEAD_SNOOZE',
      'LEAD_LOST_REASON',
      'INSTALLATION_SCHEDULE',
      'MOBILE_SHELL',
    ]
    for (const name of names) {
      vi.stubEnv(`VITE_FLAG_${name}`, 'true')
      expect(isEnabled(name)).toBe(true)
    }
  })
})
