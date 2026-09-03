import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FinanceSummary from './FinanceSummary.vue'

describe('FinanceSummary', () => {
  it('makes the pending total period scope explicit', () => {
    const wrapper = mount(FinanceSummary, {
      props: {
        loading: false,
        summary: {
          totalRevenue: 3200,
          totalExpenses: 700,
          balance: 2500,
          count: 8,
          pixIn: 3200,
          pixOut: 700,
          pendingAmount: 1000,
          pendingCount: 2,
        },
      },
    })

    expect(wrapper.text()).toContain('Pendentes no período')
    expect(wrapper.text()).toContain('2 lançamento(s)')
  })
})
