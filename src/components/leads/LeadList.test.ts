import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LeadList from './LeadList.vue'
import type { LeadDTO } from '../../services/lead'

function mountWith(leads: Partial<LeadDTO>[]) {
  return mount(LeadList, {
    props: { leads: leads as LeadDTO[] },
    global: { stubs: { LeadListItem: true } }
  })
}

const headings = (wrapper: ReturnType<typeof mountWith>) =>
  wrapper.findAll('p').map(p => p.text()).filter(Boolean)

describe('LeadList recent-activity block', () => {
  it('labels by the backend flag, not by the calendar day', () => {
    // The row that exposed the drift: created in July, answered ~30h ago. The backend ranks
    // it inside the 48h window; a calendar-day check would file it under "Anteriores".
    const wrapper = mountWith([
      { id: 1, createdDate: '2026-07-15T09:12:00', lastActivityDate: '2026-09-17T16:57:00', recentActivity: true },
      { id: 2, createdDate: '2026-08-14T11:03:00', lastActivityDate: '2026-08-14T11:03:00', recentActivity: false }
    ])
    expect(headings(wrapper)).toEqual(['Atividade recente (1)', 'Anteriores'])
  })

  it('falls back to the calendar check while the flag is absent', () => {
    // Deploy gap: frontend live before the backend that sends `recentActivity`.
    const today = new Date().toISOString()
    const wrapper = mountWith([
      { id: 1, createdDate: today, lastActivityDate: today },
      { id: 2, createdDate: '2026-07-15T09:12:00', lastActivityDate: '2026-07-15T09:12:00' }
    ])
    expect(headings(wrapper)).toEqual(['Atividade recente (1)', 'Anteriores'])
  })

  it('stays flat and unlabelled when a single band is populated', () => {
    const wrapper = mountWith([
      { id: 1, createdDate: '2026-07-15T09:12:00', lastActivityDate: '2026-07-15T09:12:00', recentActivity: false }
    ])
    expect(headings(wrapper)).toEqual([])
  })
})
