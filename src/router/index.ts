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
        path: 'ledger',
        name: 'Ledger',
        component: () => import('../views/Ledger.vue'),
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
        path: 'users',
        name: 'Users',
        component: () => import('../views/Users.vue'),
        meta: { requiresAdmin: true }
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard for authentication and authorization
router.beforeEach((to, _from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const isAuthenticated = localStorage.getItem('token')

  // Verificar se o token existe e é válido
  const isValidToken = isAuthenticated && isAuthenticated !== 'undefined' && isAuthenticated !== 'null'

  if (requiresAuth && !isValidToken) {
    // Redirecionar para login se tentar acessar rota protegida sem autenticação válida
    next({ path: '/', query: { redirect: to.fullPath } })
    return
  }

  // Verificar se a rota requer ADMIN
  if (requiresAdmin && isValidToken) {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        const isAdmin = user.roles && Array.isArray(user.roles) && user.roles.includes('ROLE_ADMIN')

        if (!isAdmin) {
          // Usuário não tem permissão ADMIN, redirecionar para dashboard
          next({ path: '/dashboard' })
          return
        }
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error)
        next({ path: '/dashboard' })
        return
      }
    } else {
      // Sem dados do usuário, redirecionar para dashboard
      next({ path: '/dashboard' })
      return
    }
  }

  if (to.path === '/' && isValidToken) {
    // Redirecionar para dashboard se já estiver autenticado e tentar acessar login
    next('/dashboard')
  } else {
    next()
  }
})

export default router