import type { RouteLocationGeneric, RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      requiresAuth: false,
      navHidden: { reason: 'Authentication entry point.' },
    },
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: {
      requiresAuth: true,
      navHidden: { reason: 'Layout route; its children are the destinations.' },
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: {
          pageTitle: 'Dashboard',
          navHidden: {
            reason:
              'Technical JVM diagnostics; product owner must decide whether to keep, replace, or remove it.',
          },
        },
      },
      {
        path: 'customers',
        name: 'Customers',
        component: () => import('../views/Customers.vue'),
        meta: {
          nav: {
            label: 'Clientes',
            icon: 'people',
            placements: { sidebar: 4, more: 2 },
          },
        },
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('../views/Products.vue'),
        meta: {
          nav: {
            label: 'Produtos',
            icon: 'products',
            placements: { sidebar: 6, more: 5 },
          },
        },
      },
      {
        path: 'quotes',
        name: 'Quotes',
        component: () => import('../views/Quotes.vue'),
        meta: {
          nav: {
            label: 'Orçamentos',
            icon: 'quotes',
            placements: { sidebar: 7, bottom: 4 },
          },
        },
      },
      {
        path: 'new-quote',
        name: 'NewQuote',
        component: () => import('../views/NewQuote.vue'),
        meta: {
          nav: {
            label: 'Novo',
            accessibleLabel: 'Novo Orçamento',
            emphasis: 'primary',
            icon: 'plus',
            placements: { bottom: 3 },
          },
        },
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('../views/Orders.vue'),
        meta: {
          nav: {
            label: 'Pedidos',
            icon: 'orders',
            placements: { sidebar: 8, more: 4 },
          },
        },
      },
      {
        path: 'ledger',
        name: 'Ledger',
        component: () => import('../views/Ledger.vue'),
        meta: {
          nav: {
            label: 'Financeiro',
            icon: 'finance',
            placements: { sidebar: 2, bottom: 1 },
          },
        },
      },
      {
        path: 'leads',
        name: 'Leads',
        component: () => import('../views/Leads.vue'),
        meta: {
          nav: {
            label: 'Leads',
            icon: { sidebar: 'people', bottom: 'inbox' },
            placements: { sidebar: 1, bottom: 2 },
          },
        },
      },
      {
        path: 'leads/:id/orcamento',
        name: 'LeadQuote',
        component: () => import('../views/LeadQuote.vue'),
        meta: {
          navHidden: {
            reason: 'Nested lead detail reached from a lead workflow.',
          },
        },
      },
      {
        // Redirect for a URL shape users naturally try (/leads/:id/quotes) that never
        // had a matching route, so it fell through to a blank/broken screen instead of
        // the existing quote-review screen at leads/:id/orcamento.
        path: 'leads/:id/quotes',
        redirect: (to: RouteLocationGeneric) => ({
          name: 'LeadQuote',
          params: to.params,
        }),
        meta: {
          navHidden: { reason: 'Compatibility redirect to the lead quote detail.' },
        },
      },
      {
        path: 'partners',
        name: 'Partners',
        component: () => import('../views/Partners.vue'),
        meta: {
          nav: {
            label: 'Parceiros',
            icon: 'partners',
            placements: { sidebar: 5, more: 3 },
          },
        },
      },
      {
        path: 'kanban',
        name: 'Kanban',
        component: () => import('../views/Kanban.vue'),
        meta: {
          nav: {
            label: 'Funil',
            icon: 'kanban',
            placements: { sidebar: 3, more: 1 },
          },
        },
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/Users.vue'),
        meta: {
          requiresAdmin: true,
          nav: {
            label: 'Usuários',
            icon: 'shield',
            placements: { sidebar: 9, more: 6 },
            permission: 'admin',
          },
        },
      },
    ],
  },
]
