import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PeriodChips from './PeriodChips.vue'

describe('PeriodChips', () => {
  it('identifies the filter and shows the active date range', async () => {
    const wrapper = mount(PeriodChips, {
      props: {
        startDate: '2026-09-01',
        endDate: '2026-09-03',
      },
    })

    expect(wrapper.text()).toContain('Período')
    expect(wrapper.text()).toContain('Este mês · 1–3 set')

    await wrapper.setProps({
      startDate: '2026-08-29',
      endDate: '2026-09-03',
    })

    expect(wrapper.text()).toContain('Este mês · 29 ago–3 set')
  })
})
