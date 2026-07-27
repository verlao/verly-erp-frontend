import { createRouter, createWebHistory } from 'vue-router'
import { postLoginRoute } from '../lib/routes'
import { isTokenExpired } from '../lib/jwt'

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
        path: 'quotes',
        name: 'Quotes',
        component: () => import('../views/Quotes.vue'),
      },
      {
        path: 'new-quote',
        name: 'NewQuote',
        component: () => import('../views/NewQuote.vue'),
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
        path: 'leads/:id/orcamento',
        name: 'LeadQuote',
        component: () => import('../views/LeadQuote.vue'),
      },
      {
        path: 'kanban',
        name: 'Kanban',
        component: () => import('../views/Kanban.vue'),
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
  const token = localStorage.getItem('token')

  // Token precisa existir E não estar expirado — antes só checava existência,
  // então um JWT expirado mantinha o usuário "logado" (o guard bouncava de
  // volta pro app) até uma chamada de API dar 401.
  const hasToken = !!token && token !== 'undefined' && token !== 'null'
  const isValidToken = hasToken && !isTokenExpired(token as string)

  // Token expirado/inválido persistido: limpa pra manter o estado consistente.
  if (hasToken && !isValidToken) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

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
          next({ path: '/ledger' })
          return
        }
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error)
        next({ path: '/ledger' })
        return
      }
    } else {
      // Sem dados do usuário, redirecionar para dashboard
      next({ path: '/ledger' })
      return
    }
  }

  if (to.path === '/' && isValidToken) {
    next(postLoginRoute)
  } else {
    next()
  }
})

export default router