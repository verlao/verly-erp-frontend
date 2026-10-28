import { describe, expect, it } from 'vitest'
import { parseLeadData, translateLead } from './leadReview'
import type { LeadDTO } from '@/services/lead'

const base = (over: Partial<LeadDTO> = {}): LeadDTO => ({
  id: 1, name: 'Fulano Teste', phone: '5511900000000', email: '', description: '', city: '',
  neighborhood: '', data: '{}', createdDate: '2026-01-01', ...over,
})

describe('parseLeadData', () => {
  it.each([null, undefined, 5, '', 'not json', '[1]', 'null', '"x"'])('treats %j as absent', (v) => {
    expect(parseLeadData(v)).toBeNull()
  })
  it('parses an object', () => expect(parseLeadData('{"a":1}')).toEqual({ a: 1 }))
})

describe('translateLead signals and transcript', () => {
  it('extracts valid shapes', () => {
    const r = translateLead(base({ data: JSON.stringify({
      signals: { negotiated: { value: 900, quote: 'fecho por 900' }, visit: { date: '2026-02-01', quote: 'sábado' } },
      transcript: [{ body: 'oi', fromMe: false, at: '10:00' }, { body: 1, fromMe: true }, 'x', { body: 'ok', fromMe: true }],
    }) }))
    expect(r.negotiated).toEqual({ value: 900, quote: 'fecho por 900' })
    expect(r.visit).toEqual({ date: '2026-02-01', quote: 'sábado' })
    expect(r.transcript).toEqual([{ body: 'oi', fromMe: false, at: '10:00' }, { body: 'ok', fromMe: true, at: null }])
  })
  it('never throws on wrong types', () => {
    const r = translateLead(base({ data: JSON.stringify({ signals: { negotiated: { value: '9', quote: 3 }, visit: 7 }, transcript: 'x' }) }))
    expect(r.negotiated).toBeNull()
    expect(r.visit).toBeNull()
    expect(r.transcript).toEqual([])
    expect(translateLead(base({ data: '{broken' })).transcript).toEqual([])
  })
})

describe('translateLead items', () => {
  it('absent measures are null, never 0, and listed as missing', () => {
    const r = translateLead(base({ items: [{ quantity: 1, productType: 'Película' }] }))
    expect(r.items[0].widthCm.value).toBeNull()
    expect(r.items[0].widthCm.origin).toBe('unknown')
    expect(r.items[0].estimatedValue.value).toBeNull()
    expect(r.missing).toEqual(expect.arrayContaining(['items[0].widthCm', 'items[0].heightCm']))
  })
  it('keeps a real zero distinct from absent only when sent', () => {
    const r = translateLead(base({ items: [{ quantity: 1, estimatedValue: 0 }] }))
    expect(r.items[0].estimatedValue.value).toBe(0)
  })
  it('pendingMeasurement stays extracted and needs check even when confirmed', () => {
    const r = translateLead(base({
      extractionConfirmedAt: '2026-01-02', items: [{ quantity: 1, widthCm: 100, heightCm: 50, pendingMeasurement: true }],
    }))
    expect(r.items[0].widthCm).toEqual({ value: 100, origin: 'extracted' })
    expect(r.items[0].needsCheck).toBe(true)
  })
  it('INCOLOR and 1 sheet are defaults until confirmed', () => {
    const items = [{ quantity: 2, color: 'INCOLOR', sheets: 1, widthCm: 10, heightCm: 10 }]
    const open = translateLead(base({ items }))
    expect(open.items[0].color.origin).toBe('default')
    expect(open.items[0].sheets.origin).toBe('default')
    expect(open.items[0].widthCm.origin).toBe('extracted')
    expect(open.extractionConfirmed).toBe(false)
    const done = translateLead(base({ items, extractionConfirmedAt: '2026-01-02' }))
    expect(done.items[0].color.origin).toBe('confirmed')
    expect(done.extractionConfirmed).toBe(true)
  })
  it('groups variants and does not mix them into plain items', () => {
    const r = translateLead(base({ items: [
      { quantity: 1, variantGroup: 'A', variantSelected: true, estimatedValue: 100 },
      { quantity: 1, variantGroup: 'A', estimatedValue: 200 },
      { quantity: 1, estimatedValue: 50 },
    ] }))
    expect(r.items).toHaveLength(1)
    expect(r.variantGroups).toHaveLength(1)
    expect(r.variantGroups[0].items.map(i => i.variantSelected)).toEqual([true, false])
  })
})

describe('translateLead contact and link', () => {
  it('contact is extracted and link only from a positive convertedCustomerId', () => {
    const r = translateLead(base({ convertedCustomerId: 12 }))
    expect(r.contactName).toEqual({ value: 'Fulano Teste', origin: 'extracted' })
    expect(r.customerLink).toEqual({ value: 12, origin: 'record' })
    expect(translateLead(base({ convertedCustomerId: 0 })).customerLink).toEqual({ value: null, origin: 'unknown' })
    expect(translateLead(base({ name: ' ' })).missing).toContain('contactName')
  })
})
