import { describe, expect, it } from 'vitest'
import { columnForLead } from './kanban'

describe('columnForLead — regra pura de bucket do funil', () => {
  it('lead novo sem nada → NOVO', () => {
    expect(columnForLead({ status: 'NEW' })).toBe('NOVO')
  })

  it('medição NEEDED/SCHEDULED → PRECISA_MEDIR (mesmo NEW)', () => {
    expect(columnForLead({ status: 'NEW', measurementStatus: 'NEEDED' })).toBe('PRECISA_MEDIR')
    expect(columnForLead({ status: 'NEW', measurementStatus: 'SCHEDULED' })).toBe('PRECISA_MEDIR')
  })

  it('medição DONE ou lead trabalhado sem quote → AGUARDANDO_ORCAMENTO', () => {
    expect(columnForLead({ status: 'NEW', measurementStatus: 'DONE' })).toBe('AGUARDANDO_ORCAMENTO')
    expect(columnForLead({ status: 'QUALIFIED' })).toBe('AGUARDANDO_ORCAMENTO')
    expect(columnForLead({ status: 'CONTACTED' })).toBe('AGUARDANDO_ORCAMENTO')
  })

  it('quote VALID vence medição → FECHAMENTO', () => {
    expect(
      columnForLead({ status: 'QUALIFIED', measurementStatus: 'NEEDED' }, { status: 'VALID' })
    ).toBe('FECHAMENTO')
  })

  it('pedido com dívida → PEDIDO; quitado → PAGO (vence tudo)', () => {
    expect(
      columnForLead({ status: 'CONVERTED' }, { status: 'CONVERTED' }, { debt: 500 })
    ).toBe('PEDIDO')
    expect(
      columnForLead({ status: 'CONVERTED' }, { status: 'CONVERTED' }, { debt: 0 })
    ).toBe('PAGO')
  })

  it('LOST fica fora; CONVERTED sem rastreio fica fora', () => {
    expect(columnForLead({ status: 'LOST' })).toBeNull()
    expect(columnForLead({ status: 'CONVERTED' })).toBeNull()
  })
})
