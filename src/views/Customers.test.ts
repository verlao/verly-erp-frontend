import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import Customers from './Customers.vue'
import customerService from '../services/customer'

vi.mock('../services/customer', () => ({
  default: { getAll: vi.fn(), getById: vi.fn(), getAllNonPaginated: vi.fn() },
}))
vi.mock('../services/cep', () => ({ default: { validarFormatoCep: vi.fn(), buscarCep: vi.fn() } }))

async function mountAt(url: string) {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/customers', component: Customers }, { path: '/orders', component: { template: '<div/>' } }] })
  router.push(url)
  await router.isReady()
  const wrapper = mount(Customers, { global: { plugins: [router], stubs: { Pagination: true } } })
  await flushPromises()
  return { wrapper, router }
}

describe('Customers route context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(customerService.getAll).mockResolvedValue({ content: [{ id: 7, name: 'Cliente Teste' }], totalElements: 1, totalPages: 1 })
    vi.mocked(customerService.getById).mockResolvedValue({ id: 7, name: 'Cliente Teste', addresses: [] })
  })

  it('loads the customer by id from ?customerId', async () => {
    await mountAt('/customers?customerId=7')
    expect(customerService.getById).toHaveBeenCalledWith(7)
  })

  it('ignores an invalid id', async () => {
    await mountAt('/customers?customerId=abc')
    expect(customerService.getById).not.toHaveBeenCalled()
  })

  it('shows a friendly alert, not backend text, when the customer cannot be opened', async () => {
    vi.mocked(customerService.getById).mockRejectedValue({ response: { status: 400, data: { message: 'SQL boom' } } })
    const { wrapper } = await mountAt('/customers?customerId=7')
    const alert = wrapper.find('[data-testid="context-error"]')
    expect(alert.text()).toBe('Não foi possível abrir este cliente.')
  })

  it('reopens when ?customerId changes without remount', async () => {
    const { router } = await mountAt('/customers?customerId=7')
    vi.mocked(customerService.getById).mockResolvedValue({ id: 8, name: 'Outro Cliente', addresses: [] })

    await router.push('/customers?customerId=8')
    await flushPromises()
    expect(customerService.getById).toHaveBeenLastCalledWith(8)
  })

  it('closing a route-opened modal drops only the context param', async () => {
    const { wrapper, router } = await mountAt('/customers?customerId=7&x=1')
    const cancel = wrapper.findAll('button').find(b => b.text() === 'Cancelar')
    expect(cancel).toBeDefined()

    await cancel!.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({ x: '1' })
    expect(wrapper.text()).not.toContain('Editar Cliente')
  })

  describe('a late ?customerId response does not replace a modal opened by hand', () => {
    let resolveRouteCustomer: (customer: unknown) => void

    beforeEach(() => {
      vi.mocked(customerService.getAll).mockResolvedValue({
        content: [{ id: 7, name: 'Sete', addresses: [] }, { id: 9, name: 'Nove', addresses: [] }],
        totalElements: 2,
        totalPages: 1,
      })
      vi.mocked(customerService.getById).mockReturnValue(
        new Promise(resolve => { resolveRouteCustomer = resolve }) as ReturnType<typeof customerService.getById>
      )
    })

    const nameValue = (wrapper: Awaited<ReturnType<typeof mountAt>>['wrapper']) =>
      (wrapper.find('#name').element as HTMLInputElement).value

    it('keeps the customer the user chose to edit', async () => {
      const { wrapper } = await mountAt('/customers?customerId=7')
      const editButtons = wrapper.findAll('button').filter(b => /Editar/i.test((b.attributes('aria-label') ?? '') + b.text()))
      await editButtons[editButtons.length - 1].trigger('click')
      expect(nameValue(wrapper)).toBe('Nove')

      resolveRouteCustomer({ id: 7, name: 'Sete', addresses: [] })
      await flushPromises()
      expect(nameValue(wrapper)).toBe('Nove')
    })

    it('keeps the new-customer form', async () => {
      const { wrapper } = await mountAt('/customers?customerId=7')
      const newButton = wrapper.findAll('button').find(b => b.text().includes('Novo Cliente'))
      await newButton!.trigger('click')
      await wrapper.find('#name').setValue('Digitado')

      resolveRouteCustomer({ id: 7, name: 'Sete', addresses: [] })
      await flushPromises()
      expect(nameValue(wrapper)).toBe('Digitado')
      expect(wrapper.find('h3').text()).toBe('Novo Cliente')
    })
  })
})
