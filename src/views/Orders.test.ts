import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import Orders from './Orders.vue'
import orderService from '../services/order'

vi.mock('../services/order', () => ({
  default: { getAll: vi.fn(), getAllNonPaginated: vi.fn(), getByCustomer: vi.fn() },
}))
vi.mock('../services/customer', () => ({
  // Dois clientes com o MESMO nome: só o ID distingue.
  default: { getAll: vi.fn().mockResolvedValue([{ id: 1, name: 'Cliente Teste' }, { id: 2, name: 'Cliente Teste' }]) },
}))
vi.mock('../services/product', () => ({ default: { getAll: vi.fn().mockResolvedValue([]) } }))

const order = (id: number, customerId: number) => ({
  id, customerId, products: {}, status: 'PENDENTE', cost: 0, price: 10, debt: 0, profit: 0,
})

async function mountAt(url: string) {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/orders', component: Orders }] })
  router.push(url)
  await router.isReady()
  const wrapper = mount(Orders, { global: { plugins: [router], stubs: { Pagination: true } } })
  await flushPromises()
  return { wrapper, router }
}

describe('Orders customer filter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(orderService.getAll).mockResolvedValue({ content: [order(10, 1), order(11, 2)], totalElements: 2, totalPages: 1 })
    vi.mocked(orderService.getByCustomer).mockResolvedValue([order(11, 2), order(12, 2)])
  })

  it('without the param shows the paginated list and no chip', async () => {
    const { wrapper } = await mountAt('/orders')
    expect(wrapper.find('[data-testid="customer-filter-chip"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('#10')
    expect(wrapper.text()).toContain('#11')
  })

  it('filters on the server by customer id, not by name, and shows a chip', async () => {
    const { wrapper } = await mountAt('/orders?customerId=2')
    expect(orderService.getByCustomer).toHaveBeenCalledWith(2)
    expect(orderService.getAllNonPaginated).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="customer-filter-chip"]').text()).toContain('Pedidos de Cliente Teste')
    expect(wrapper.text()).not.toContain('#10')
    expect(wrapper.text()).toContain('#11')
    expect(wrapper.text()).toContain('#12')
  })

  it('ignores an invalid id instead of filtering', async () => {
    const { wrapper } = await mountAt('/orders?customerId=abc')
    expect(wrapper.find('[data-testid="customer-filter-chip"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('#10')
  })

  it('clear button removes only the param and reloads the full list', async () => {
    const { wrapper, router } = await mountAt('/orders?customerId=2&x=1')
    await wrapper.find('[data-testid="customer-filter-clear"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({ x: '1' })
    expect(wrapper.find('[data-testid="customer-filter-chip"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('#10')
  })

  it('shows no rows when the response is not an array', async () => {
    vi.mocked(orderService.getByCustomer).mockResolvedValue({ content: [order(10, 1)], totalElements: 9 })
    const { wrapper } = await mountAt('/orders?customerId=1')
    expect(wrapper.find('[data-testid="filter-error"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('#10')
  })

  it('shows a friendly error, never backend text', async () => {
    vi.mocked(orderService.getByCustomer).mockRejectedValue({ response: { status: 500, data: { message: 'SQL boom' } } })
    const { wrapper } = await mountAt('/orders?customerId=1')
    expect(wrapper.find('[data-testid="filter-error"]').text()).not.toContain('SQL')
  })

  it('accepts the plain list /orders really returns (no Page wrapper)', async () => {
    vi.mocked(orderService.getAll).mockResolvedValue([order(20, 1), order(21, 1)])
    const { wrapper } = await mountAt('/orders')
    expect(wrapper.text()).toContain('#20')
    expect(wrapper.text()).toContain('#21')
    expect(wrapper.text()).not.toContain('Nenhum pedido encontrado')
  })

  it('discards a stale list response when the filter changes mid-flight', async () => {
    let resolveStale: (value: unknown) => void = () => {}
    vi.mocked(orderService.getAll).mockReturnValue(new Promise(r => (resolveStale = r)))
    const { wrapper, router } = await mountAt('/orders')

    await router.push('/orders?customerId=2')
    await flushPromises()
    expect(wrapper.text()).toContain('#11')

    resolveStale({ content: [order(10, 1)], totalElements: 1, totalPages: 1 })
    await flushPromises()
    expect(wrapper.text()).not.toContain('#10')
  })
})
