import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Ledger from './Ledger.vue'
import PeriodChips from '../components/ledger/PeriodChips.vue'
import FinanceSummary from '../components/ledger/FinanceSummary.vue'
import ledgerService from '../services/ledger'
import type { LedgerSummaryDTO } from '../services/ledger'

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

describe('Ledger summary request ordering', () => {
  it('ignores a summary response for a period that is no longer selected', async () => {
    const pendingRequests: { startDate: string; endDate: string; resolve: (value: LedgerSummaryDTO) => void }[] = []
    vi.mocked(ledgerService.getSummary).mockImplementation(
      (startDate: string, endDate: string) =>
        new Promise<LedgerSummaryDTO>(resolve => {
          pendingRequests.push({ startDate, endDate, resolve })
        })
    )

    const wrapper = mount(Ledger, {
      global: {
        stubs: {
          WhatsAppPendingSection: true,
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

    // Mount fires one summary request for the default period. Leave it
    // hanging — it plays no role in the race being tested below.
    expect(pendingRequests).toHaveLength(1)

    const periodA = { startDate: '2026-01-01', endDate: '2026-01-31' }
    const periodB = { startDate: '2026-02-01', endDate: '2026-02-28' }
    const periodChips = wrapper.findComponent(PeriodChips)

    // Two rapid period changes, A then B, before either request resolves.
    periodChips.vm.$emit('change', periodA)
    periodChips.vm.$emit('change', periodB)
    await flushPromises()

    expect(pendingRequests).toHaveLength(3)
    const [, requestA, requestB] = pendingRequests
    expect(requestA.startDate).toBe(periodA.startDate)
    expect(requestB.startDate).toBe(periodB.startDate)

    const summaryA = { totalRevenue: 111, totalExpenses: 0, balance: 111, count: 1, pixIn: 0, pixOut: 0 }
    const summaryB = { totalRevenue: 222, totalExpenses: 0, balance: 222, count: 1, pixIn: 0, pixOut: 0 }

    // B (the currently selected period) resolves first; A — superseded but
    // slower — resolves last. Its late arrival must not overwrite B.
    requestB.resolve(summaryB)
    await flushPromises()
    requestA.resolve(summaryA)
    await flushPromises()

    const financeSummary = wrapper.findComponent(FinanceSummary)
    expect(financeSummary.props('summary')).toEqual(summaryB)
    expect(financeSummary.props('summary')).not.toEqual(summaryA)
    expect(financeSummary.props('loading')).toBe(false)
    expect(wrapper.text()).not.toContain('Não foi possível atualizar o resumo')

    vi.mocked(ledgerService.getSummary).mockResolvedValue({
      totalRevenue: 0,
      totalExpenses: 0,
      balance: 0,
      count: 0,
      pixIn: 0,
      pixOut: 0,
    })
  })
})
