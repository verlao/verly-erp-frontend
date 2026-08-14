import { describe, expect, it } from 'vitest'
import {
  activeDuplicatesOf,
  isActiveLead,
  isPaymentAwaitingReceipt,
  negotiatedInfo,
  normalizePhone,
} from './useLeadSignals'
import type { LeadDTO } from '../services/lead'

// Factory: só os campos relevantes; o resto com defaults válidos.
function lead(overrides: Partial<LeadDTO> = {}): LeadDTO {
  return {
    id: 1,
    name: 'Cliente Teste',
    phone: '(24) 99999-0001',
    email: '',
    description: '',
    city: 'Volta Redonda',
    neighborhood: 'Centro',
    data: '',
    createdDate: '2026-08-14T10:00:00Z',
    status: 'NEW',
    ...overrides,
  }
}

function dataWithNegotiated(value: number | null | undefined, detected = true): string {
  return JSON.stringify({ signals: { negotiated: { detected, value, quote: 'fechamos nesse valor' } } })
}

describe('negotiatedInfo — valor negociado na conversa (signals.negotiated)', () => {
  it('lead antigo sem signals.negotiated → null (tolera ausência)', () => {
    expect(negotiatedInfo(lead())).toBeNull()
    expect(negotiatedInfo(lead({ data: JSON.stringify({ signals: { payment: { detected: true } } }) }))).toBeNull()
    expect(negotiatedInfo(lead({ data: 'não é json' }))).toBeNull()
    expect(negotiatedInfo(null)).toBeNull()
  })

  it('detected=false ou value ausente/inválido → null', () => {
    expect(negotiatedInfo(lead({ data: dataWithNegotiated(1200, false) }))).toBeNull()
    expect(negotiatedInfo(lead({ data: dataWithNegotiated(null) }))).toBeNull()
    expect(negotiatedInfo(lead({ data: dataWithNegotiated(undefined) }))).toBeNull()
    expect(negotiatedInfo(lead({ data: dataWithNegotiated(0) }))).toBeNull()
    expect(negotiatedInfo(lead({ data: dataWithNegotiated(-50) }))).toBeNull()
  })

  it('negociado dentro de 30% do estimado → sem alerta', () => {
    const info = negotiatedInfo(lead({ data: dataWithNegotiated(1100), totalEstimatedValue: 1000 }))
    expect(info).toEqual({ value: 1100, estimated: 1000, divergent: false })
  })

  it('divergência acima de 30% (pra cima ou pra baixo) → divergent=true', () => {
    expect(negotiatedInfo(lead({ data: dataWithNegotiated(1400), totalEstimatedValue: 1000 }))?.divergent).toBe(true)
    expect(negotiatedInfo(lead({ data: dataWithNegotiated(600), totalEstimatedValue: 1000 }))?.divergent).toBe(true)
  })

  it('exatamente 30% NÃO diverge (limite é exclusivo)', () => {
    expect(negotiatedInfo(lead({ data: dataWithNegotiated(1300), totalEstimatedValue: 1000 }))?.divergent).toBe(false)
    expect(negotiatedInfo(lead({ data: dataWithNegotiated(700), totalEstimatedValue: 1000 }))?.divergent).toBe(false)
  })

  it('sem valor estimado → mostra negociado sem alerta de divergência', () => {
    const info = negotiatedInfo(lead({ data: dataWithNegotiated(950) }))
    expect(info).toEqual({ value: 950, estimated: null, divergent: false })
  })
})

describe('isPaymentAwaitingReceipt — fila "💰 Pagos"', () => {
  it('true só quando paymentAwaitingReceipt=true', () => {
    expect(isPaymentAwaitingReceipt(lead({ paymentAwaitingReceipt: true }))).toBe(true)
    expect(isPaymentAwaitingReceipt(lead({ paymentAwaitingReceipt: false }))).toBe(false)
    expect(isPaymentAwaitingReceipt(lead())).toBe(false)
    expect(isPaymentAwaitingReceipt(null)).toBe(false)
  })
})

describe('duplicatas ativas por telefone (client-side)', () => {
  it('isActiveLead: CONVERTED/LOST são terminais; sem status conta como NEW (ativo)', () => {
    expect(isActiveLead(lead({ status: 'NEW' }))).toBe(true)
    expect(isActiveLead(lead({ status: 'CONTACTED' }))).toBe(true)
    expect(isActiveLead(lead({ status: 'QUALIFIED' }))).toBe(true)
    expect(isActiveLead(lead({ status: undefined }))).toBe(true)
    expect(isActiveLead(lead({ status: 'CONVERTED' }))).toBe(false)
    expect(isActiveLead(lead({ status: 'LOST' }))).toBe(false)
  })

  it('normalizePhone: compara só dígitos', () => {
    expect(normalizePhone('(24) 99999-0001')).toBe('24999990001')
    expect(normalizePhone('24 99999 0001')).toBe('24999990001')
    expect(normalizePhone('')).toBe('')
    expect(normalizePhone(undefined)).toBe('')
  })

  it('acha outros leads ATIVOS do mesmo telefone, mesmo com formatação diferente', () => {
    const target = lead({ id: 1, phone: '(24) 99999-0001' })
    const all = [
      target,
      lead({ id: 2, phone: '24999990001', status: 'CONTACTED' }), // ativo, mesmo fone
      lead({ id: 3, phone: '24999990001', status: 'CONVERTED' }), // terminal → fora
      lead({ id: 4, phone: '24999990001', status: 'LOST' }), // terminal → fora
      lead({ id: 5, phone: '(24) 98888-0002' }), // outro fone → fora
      lead({ id: 6, phone: '24 99999-0001', status: 'QUALIFIED' }), // ativo, mesmo fone
    ]
    expect(activeDuplicatesOf(all, target).map((l) => l.id)).toEqual([2, 6])
  })

  it('não inclui o próprio lead; sem telefone → sem duplicatas', () => {
    const target = lead({ id: 1, phone: '' })
    const all = [target, lead({ id: 2, phone: '' })]
    expect(activeDuplicatesOf(all, target)).toEqual([])
    expect(activeDuplicatesOf(all, null)).toEqual([])
  })
})
