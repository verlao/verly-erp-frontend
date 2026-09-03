import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import type { LedgerResponseDTO } from '../../services/ledger'
import WhatsAppPendingSection from './WhatsAppPendingSection.vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

function pendingEntry(id: number): LedgerResponseDTO {
  return {
    id,
    transactionId: `PIX-${id}`,
    entryDate: '2026-09-03',
    description: `Comprovante ${id}`,
    documentType: 'INCOME',
    source: 'WHATSAPP',
    hasReceipt: true,
    totalAmount: 100,
    status: 'PENDING',
    createdAt: '2026-09-03T12:00:00Z',
    createdBy: 'whatsapp',
    entries: [],
  }
}

describe('WhatsAppPendingSection', () => {
  it('keeps all pending entries in a compact scrollable work queue', () => {
    const entries = Array.from({ length: 12 }, (_, index) => pendingEntry(index + 1))
    const wrapper = mount(WhatsAppPendingSection, {
      props: { entries, actionLoading: null },
    })

    const queue = wrapper.get('ul')
    expect(queue.classes()).toContain('max-h-64')
    expect(queue.classes()).toContain('overflow-y-auto')
    expect(queue.attributes('aria-label')).toBe('Comprovantes pendentes')
    expect(queue.findAll('li')).toHaveLength(12)
  })
})
