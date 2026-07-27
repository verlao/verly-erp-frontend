import { describe, expect, it } from 'vitest'
import { fillMissingDays, maxFlow } from './dailySeries'

describe('fillMissingDays', () => {
  it('preenche período vazio com zeros', () => {
    const out = fillMissingDays([], '2026-07-01', '2026-07-03')
    expect(out).toHaveLength(3)
    expect(out[0]).toEqual({ date: '2026-07-01', in: 0, out: 0 })
    expect(out[2]).toEqual({ date: '2026-07-03', in: 0, out: 0 })
  })

  it('preserva pontos existentes e completa os buracos', () => {
    const out = fillMissingDays(
      [{ date: '2026-07-02', in: 100, out: 50 }],
      '2026-07-01',
      '2026-07-03'
    )
    expect(out[1]).toEqual({ date: '2026-07-02', in: 100, out: 50 })
    expect(out[0].in).toBe(0)
  })

  it('atravessa boundary de mês sem deslocar dia (tz local)', () => {
    const out = fillMissingDays([], '2026-06-29', '2026-07-02')
    expect(out.map(d => d.date)).toEqual(['2026-06-29', '2026-06-30', '2026-07-01', '2026-07-02'])
  })

  it('start === end retorna 1 dia', () => {
    expect(fillMissingDays([], '2026-07-15', '2026-07-15')).toHaveLength(1)
  })

  it('nunca excede o cap de segurança', () => {
    expect(fillMissingDays([], '2020-01-01', '2026-01-01').length).toBeLessThanOrEqual(370)
  })
})

describe('maxFlow', () => {
  it('retorna o maior fluxo individual', () => {
    expect(
      maxFlow([
        { date: '2026-07-01', in: 100, out: 300 },
        { date: '2026-07-02', in: 250, out: 0 },
      ])
    ).toBe(300)
  })

  it('mínimo 1 pra série vazia/zerada', () => {
    expect(maxFlow([])).toBe(1)
    expect(maxFlow([{ date: '2026-07-01', in: 0, out: 0 }])).toBe(1)
  })
})
