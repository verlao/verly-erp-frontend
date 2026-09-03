import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Ledger from './Ledger.vue'

vi.mock('../services/ledger', () => ({
  default: {
    getByDateRangePaginated: vi.fn().mockResolvedValue({
      content: [],
      totalElements: 0,
    }),
    getSummary: vi.fn().mockResolvedValue({
      totalRevenue: 0,
      totalExpenses: 0,
      balance: 0,
      count: 0,
      pixIn: 0,
      pixOut: 0,
    }),
    getDailySeries: vi.fn().mockResolvedValue([]),
    getPendingBySource: vi.fn().mockResolvedValue([]),
  },
}))

describe('Ledger layout', () => {
  it('places the period and summary before the pending work queue', async () => {
    const wrapper = mount(Ledger, {
      global: {
        stubs: {
          PeriodChips: { template: '<div data-block="period" />' },
          FinanceSummary: { template: '<div data-block="summary" />' },
          WhatsAppPendingSection: { template: '<div data-block="pending" />' },
          DailyFlowChart: true,
          TransactionRow: true,
          Pagination: true,
          RegisterPaymentDialog: true,
          RegisterExpenseDialog: true,
          ReverseDialog: true,
          ReceiptDialog: true,
        },
      },
    })
    await flushPromises()

    expect(wrapper.findAll('[data-block]').map(block => block.attributes('data-block'))).toEqual([
      'period',
      'summary',
      'pending',
    ])
  })
})
