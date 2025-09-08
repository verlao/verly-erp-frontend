import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
      },
      {
        path: 'customers',
        name: 'Customers',
        component: () => import('../views/Customers.vue'),
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('../views/Products.vue'),
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('../views/Orders.vue'),
      },
      {
        path: 'cash-flow',
        name: 'CashFlow',
        component: () => import('../views/CashFlow.vue'),
      },
      {
        path: 'leads',
        name: 'Leads',
        component: () => import('../views/Leads.vue'),
      },
      {
        path: 'cost-selection',
        name: 'CostSelection',
        component: () => import('../views/CostSelection.vue'),
      },
      {
        path: 'costs',
        name: 'Costs',
        component: () => import('../views/Costs.vue'),
      },
      {
        path: 'credit-card-costs',
        name: 'CreditCardCosts',
        component: () => import('../views/CreditCardCosts.vue'),
      },
      {
        path: 'cart',
        name: 'Cart',
        component: () => import('../views/Cart.vue'),
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard for authentication
router.beforeEach((to, _from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = localStorage.getItem('token')
  
  // Verificar se o token existe e é válido
  const isValidToken = isAuthenticated && isAuthenticated !== 'undefined' && isAuthenticated !== 'null'
  
  if (requiresAuth && !isValidToken) {
    // Redirecionar para login se tentar acessar rota protegida sem autenticação válida
    next({ path: '/', query: { redirect: to.fullPath } })
  } else if (to.path === '/' && isValidToken) {
    // Redirecionar para dashboard se já estiver autenticado e tentar acessar login
    next('/dashboard')
  } else {
    next()
  }
})

export default router