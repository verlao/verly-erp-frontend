import type { RouteRecordRaw } from 'vue-router'
import { describe, expect, it } from 'vitest'
import {
  navigationItemsFor,
  validateNavigationRoutes,
} from './navigation'
import { routes } from './routes'

describe('route navigation metadata', () => {
  it('requires every route to be a reachable destination or explicitly hidden', () => {
    expect(() => validateNavigationRoutes(routes)).not.toThrow()
  })

  it('fails with the orphan route and its cause in the message', () => {
    const orphanRoute: RouteRecordRaw = {
      path: '/orphan',
      name: 'Orphan',
      component: { template: '<div />' },
      meta: {
        nav: {
          label: 'Órfã',
          icon: 'inbox',
          placements: {},
        },
      },
    }

    expect(() => validateNavigationRoutes([...routes, orphanRoute])).toThrow(
      'Route "Orphan" is a user destination but is not reachable from any navigation surface.',
    )
  })

  it('derives the three existing navigation surfaces without changing destinations', () => {
    expect(
      navigationItemsFor(routes, 'bottom').map((item) => item.label),
    ).toEqual(['Financeiro', 'Leads', 'Novo', 'Orçamentos'])
    expect(navigationItemsFor(routes, 'more').map((item) => item.label)).toEqual([
      'Funil',
      'Clientes',
      'Parceiros',
      'Pedidos',
      'Produtos',
      'Usuários',
    ])
    expect(
      navigationItemsFor(routes, 'sidebar').map((item) => item.label),
    ).toEqual([
      'Leads',
      'Financeiro',
      'Funil',
      'Clientes',
      'Parceiros',
      'Produtos',
      'Orçamentos',
      'Pedidos',
      'Usuários',
    ])
  })
})
