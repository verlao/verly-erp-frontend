import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import Agenda from './Agenda.vue'
import leadService from '../services/lead'
import leadInstallationService from '../services/lead-installation'

const notification = vi.hoisted(() => ({
  success: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
}))

vi.mock('../composables/useNotification', () => ({ useNotification: () => notification }))
vi.mock('../services/lead', () => ({
  default: { getAllNonPaginated: vi.fn(), updateMeasurement: vi.fn() },
}))
vi.mock('../services/lead-installation', () => ({
  default: { list: vi.fn(), create: vi.fn(), update: vi.fn(), cancel: vi.fn() },
}))

const lead = (over: Record<string, unknown> = {}) => ({
  id: 1,
  name: 'Ana Box',
  phone: '11999999999',
  email: '',
  description: '',
  city: 'São Paulo',
  neighborhood: 'Centro',
  data: '{}',
  createdDate: '2026-10-20T10:00:00',
  ...over,
})

const installation = (over: Record<string, unknown> = {}) => ({
  id: 5,
  leadId: 1,
  orderId: null,
  scheduledAt: '2026-10-30T14:00:00',
  address: null,
  responsible: null,
  status: 'SCHEDULED',
  createdAt: '2026-10-20T10:00:00',
  updatedAt: '2026-10-20T10:00:00',
  ...over,
})

async function mountAgenda() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/leads/:id/orcamento', component: { template: '<div />' } }],
  })
  router.push('/agenda')
  await router.isReady()
  const wrapper = mount(Agenda, {
    global: { plugins: [router], stubs: { teleport: true } },
  })
  await flushPromises()
  return wrapper
}

describe('Agenda', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 28, 9, 0, 0)) // quarta, 28/10/2026
    localStorage.setItem('user', JSON.stringify({ username: 'vendedor' }))
    vi.mocked(leadInstallationService.list).mockResolvedValue([])
    vi.mocked(leadService.getAllNonPaginated).mockResolvedValue([lead()] as never)
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('asks the backend for the inclusive local week', async () => {
    await mountAgenda()

    expect(leadInstallationService.list).toHaveBeenCalledWith({
      start: '2026-10-26T00:00:00',
      end: '2026-11-01T23:59:59',
    })
  })

  it('ignores a stale week response that arrives after the current week', async () => {
    let resolveStale: (rows: never) => void = () => {}
    vi.mocked(leadInstallationService.list)
      .mockImplementationOnce(() => Promise.resolve([]))
      .mockImplementationOnce(() => new Promise((resolve) => (resolveStale = resolve as never)))
      .mockImplementationOnce(() =>
        Promise.resolve([installation({ id: 9, scheduledAt: '2026-11-11T10:00:00' })] as never),
      )
    const wrapper = await mountAgenda()

    await wrapper.find('[aria-label="Próxima semana"]').trigger('click')
    await wrapper.find('[aria-label="Próxima semana"]').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('11/11 10:00')

    resolveStale([installation({ id: 8, scheduledAt: '2026-11-04T10:00:00' })] as never)
    await flushPromises()
    expect(wrapper.text()).toContain('11/11 10:00')
    expect(wrapper.text()).not.toContain('Nenhuma instalação agendada nesta semana')
    expect(wrapper.text()).not.toContain('04/11 10:00')
  })

  it('does not keep the previous week installations when the next week fails to load', async () => {
    vi.mocked(leadInstallationService.list)
      .mockResolvedValueOnce([installation()] as never)
      .mockRejectedValueOnce(Object.assign(new Error('boom'), { response: { status: 500 } }))
    const wrapper = await mountAgenda()
    expect(wrapper.text()).toContain('30/10 14:00')

    await wrapper.find('[aria-label="Próxima semana"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('02/11 – 08/11')
    expect(wrapper.text()).not.toContain('30/10 14:00')
    // Erro não pode parecer agenda livre: nada de "Nenhuma instalação agendada".
    expect(wrapper.text()).not.toContain('Nenhuma instalação agendada nesta semana')
    expect(wrapper.text()).toContain('Instalações desta semana indisponíveis.')
    const banner = wrapper.find('p.text-destructive')
    expect(banner.exists()).toBe(true)
    expect(banner.text()).not.toBe('')
    expect(wrapper.text()).not.toContain('boom')
  })

  it('shows a visit as a day, never inventing a time', async () => {
    vi.mocked(leadService.getAllNonPaginated).mockResolvedValue([
      lead({ measurementStatus: 'SCHEDULED', measurementDate: '2026-10-29T00:00:00' }),
    ] as never)

    const wrapper = await mountAgenda()

    expect(wrapper.text()).toContain('29/10')
    expect(wrapper.text()).toContain('horário não confirmado')
    expect(wrapper.text()).not.toContain('00:00')
  })

  it('shows missing address and responsible explicitly', async () => {
    vi.mocked(leadInstallationService.list).mockResolvedValue([installation()] as never)

    const wrapper = await mountAgenda()

    expect(wrapper.text()).toContain('30/10 14:00')
    expect(wrapper.text()).toContain('Endereço não confirmado')
    expect(wrapper.text()).toContain('Sem responsável definido')
  })

  it('schedules an installation without inventing an address and never touches the lead stage', async () => {
    vi.mocked(leadInstallationService.create).mockResolvedValue(installation() as never)
    const wrapper = await mountAgenda()

    await wrapper.findAll('button').find((b) => b.text() === 'Novo agendamento')!.trigger('click')
    await wrapper.find('#agenda-lead').setValue('Ana')
    await wrapper.findAll('button').find((b) => b.text().includes('Ana Box'))!.trigger('click')
    await wrapper.find('#agenda-date').setValue('2026-11-02')
    await wrapper.find('#agenda-time').setValue('09:30')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(leadInstallationService.create).toHaveBeenCalledWith(1, {
      scheduledAt: '2026-11-02T09:30:00',
      address: null,
      responsible: 'vendedor',
    })
    expect(leadService.updateMeasurement).not.toHaveBeenCalled()
  })

  it('lets the lead search pick a different lead after one was chosen', async () => {
    vi.mocked(leadService.getAllNonPaginated).mockResolvedValue([
      lead(),
      lead({ id: 2, name: 'Bruno Vidro', phone: '11888888888' }),
    ] as never)
    vi.mocked(leadInstallationService.create).mockResolvedValue(installation() as never)
    const wrapper = await mountAgenda()

    await wrapper.findAll('button').find((b) => b.text() === 'Novo agendamento')!.trigger('click')
    await wrapper.find('#agenda-lead').setValue('Ana')
    await wrapper.findAll('button').find((b) => b.text().includes('Ana Box'))!.trigger('click')
    await wrapper.find('#agenda-lead').setValue('Bruno')

    const bruno = wrapper.findAll('button').find((b) => b.text().includes('Bruno Vidro'))
    expect(bruno).toBeDefined()
    expect(submitButton(wrapper).attributes('disabled')).toBeDefined()

    await bruno!.trigger('click')
    await wrapper.find('#agenda-date').setValue('2026-11-02')
    await wrapper.find('#agenda-time').setValue('09:30')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(leadInstallationService.create).toHaveBeenCalledTimes(1)
    expect(vi.mocked(leadInstallationService.create).mock.calls[0][0]).toBe(2)
  })

  it('keeps order, address and responsible when rescheduling, and preserves the commercial stage', async () => {
    vi.mocked(leadInstallationService.list).mockResolvedValue([
      installation({ orderId: 77, address: 'Rua A, 10', responsible: 'Carlos' }),
    ] as never)
    vi.mocked(leadInstallationService.update).mockResolvedValue(installation() as never)
    const wrapper = await mountAgenda()

    await wrapper.findAll('button').find((b) => b.text() === 'Reagendar')!.trigger('click')
    await wrapper.find('#reschedule-time').setValue('15:00')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(leadInstallationService.update).toHaveBeenCalledWith(1, 5, {
      scheduledAt: '2026-10-30T15:00:00',
      orderId: 77,
      address: 'Rua A, 10',
      responsible: 'Carlos',
    })
    expect(leadService.updateMeasurement).not.toHaveBeenCalled()
  })

  it('prefills only the suggested day of a visit, never a time', async () => {
    vi.mocked(leadService.getAllNonPaginated).mockResolvedValue([
      lead({ data: JSON.stringify({ signals: { visit: { detected: true, date: '2026-11-03' } } }) }),
    ] as never)
    vi.mocked(leadService.updateMeasurement).mockResolvedValue({} as never)
    const wrapper = await mountAgenda()

    await wrapper.findAll('button').find((b) => b.text() === 'Novo agendamento')!.trigger('click')
    await wrapper.find('#agenda-lead').setValue('Ana')
    await wrapper.findAll('button').find((b) => b.text().includes('Ana Box'))!.trigger('click')
    await wrapper.findAll('button').find((b) => b.text() === 'Visita técnica')!.trigger('click')

    expect((wrapper.find('#agenda-date').element as HTMLInputElement).value).toBe('2026-11-03')
    expect(wrapper.text()).toContain('É sugestão, não confirmação')
    expect(wrapper.find('#agenda-time').exists()).toBe(false)

    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(leadService.updateMeasurement).toHaveBeenCalledWith(1, 'SCHEDULED', '2026-11-03T00:00:00')
  })

  it('asks before cancelling an installation', async () => {
    vi.mocked(leadInstallationService.list).mockResolvedValue([installation()] as never)
    const wrapper = await mountAgenda()

    await wrapper.findAll('button').find((b) => b.text() === 'Cancelar')!.trigger('click')
    expect(leadInstallationService.cancel).not.toHaveBeenCalled()

    await wrapper.findAll('button').find((b) => b.text() === 'Sim, cancelar')!.trigger('click')
    await flushPromises()
    expect(leadInstallationService.cancel).toHaveBeenCalledWith(1, 5)
  })

  it('schedules a visit with the day only', async () => {
    vi.mocked(leadService.updateMeasurement).mockResolvedValue({} as never)
    const wrapper = await mountAgenda()

    await wrapper.findAll('button').find((b) => b.text() === 'Novo agendamento')!.trigger('click')
    await wrapper.find('#agenda-lead').setValue('Ana')
    await wrapper.findAll('button').find((b) => b.text().includes('Ana Box'))!.trigger('click')
    await wrapper.findAll('button').find((b) => b.text() === 'Visita técnica')!.trigger('click')
    await wrapper.find('#agenda-date').setValue('2026-11-03')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(leadService.updateMeasurement).toHaveBeenCalledWith(1, 'SCHEDULED', '2026-11-03T00:00:00')
    expect(leadInstallationService.create).not.toHaveBeenCalled()
  })

  async function openVisitFor(day: string) {
    const wrapper = await mountAgenda()
    await wrapper.findAll('button').find((b) => b.text() === 'Novo agendamento')!.trigger('click')
    await wrapper.find('#agenda-lead').setValue('Ana')
    await wrapper.findAll('button').find((b) => b.text().includes('Ana Box'))!.trigger('click')
    await wrapper.findAll('button').find((b) => b.text() === 'Visita técnica')!.trigger('click')
    await wrapper.find('#agenda-date').setValue(day)
    return wrapper
  }

  const submitButton = (wrapper: Awaited<ReturnType<typeof mountAgenda>>) =>
    wrapper.findAll('button').find((b) => b.text() === 'Agendar')!

  it('asks before replacing a visit already scheduled on another day', async () => {
    vi.mocked(leadService.getAllNonPaginated).mockResolvedValue([
      lead({ measurementStatus: 'SCHEDULED', measurementDate: '2026-11-05T00:00:00' }),
    ] as never)
    vi.mocked(leadService.updateMeasurement).mockResolvedValue({} as never)
    const wrapper = await openVisitFor('2026-11-03')

    expect(wrapper.text()).toContain('já tem visita marcada em 05/11')
    expect(submitButton(wrapper).attributes('disabled')).toBeDefined()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(leadService.updateMeasurement).not.toHaveBeenCalled()

    await wrapper.find('#agenda-confirm-overwrite').setValue(true)
    expect(submitButton(wrapper).attributes('disabled')).toBeUndefined()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(leadService.updateMeasurement).toHaveBeenCalledWith(1, 'SCHEDULED', '2026-11-03T00:00:00')
  })

  it('asks before reopening a measurement that is already done', async () => {
    vi.mocked(leadService.getAllNonPaginated).mockResolvedValue([
      lead({ measurementStatus: 'DONE', measurementDate: '2026-10-27T00:00:00' }),
    ] as never)
    vi.mocked(leadService.updateMeasurement).mockResolvedValue({} as never)
    const wrapper = await openVisitFor('2026-11-03')

    expect(wrapper.text()).toContain('Medição já concluída em 27/10')
    expect(submitButton(wrapper).attributes('disabled')).toBeDefined()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(leadService.updateMeasurement).not.toHaveBeenCalled()

    await wrapper.find('#agenda-confirm-overwrite').setValue(true)
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(leadService.updateMeasurement).toHaveBeenCalledWith(1, 'SCHEDULED', '2026-11-03T00:00:00')
  })

  it('does not warn when the visit is already scheduled on the same day', async () => {
    vi.mocked(leadService.getAllNonPaginated).mockResolvedValue([
      lead({ measurementStatus: 'SCHEDULED', measurementDate: '2026-11-03T00:00:00' }),
    ] as never)
    vi.mocked(leadService.updateMeasurement).mockResolvedValue({} as never)
    const wrapper = await openVisitFor('2026-11-03')

    expect(wrapper.text()).not.toContain('já tem visita marcada')
    expect(wrapper.find('#agenda-confirm-overwrite').exists()).toBe(false)
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(leadService.updateMeasurement).toHaveBeenCalledWith(1, 'SCHEDULED', '2026-11-03T00:00:00')
  })
})
