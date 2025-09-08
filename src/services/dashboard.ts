import api from './api'

export interface DashboardMetrics {
  totalCustomers: number
  totalProducts: number
  totalOrders: number
  totalLeads: number
  totalCashFlows: number
  ordersThisMonth: number
  ordersThisWeek: number
  ordersToday: number
  leadsThisMonth: number
  leadsThisWeek: number
  leadsToday: number
}

export interface RevenueMetrics {
  monthlyRevenue: number
  weeklyRevenue: number
  dailyRevenue: number
}

export interface RecentActivity {
  recentOrders: any[]
  recentLeads: any[]
}

export interface SystemHealth {
  database: string
  databaseRecords: number
  memoryFree: number
  memoryTotal: number
  memoryUsed: number
  processors: number
  databaseConnected?: boolean
  memoryUsage?: number
  availableProcessors?: number
}

export interface DashboardSummary {
  metrics: DashboardMetrics
  revenue: RevenueMetrics
  activities: RecentActivity
  health: SystemHealth
}

const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const response = await api.get('/dashboard/metrics')
    return response.data
  },

  getRevenue: async (): Promise<RevenueMetrics> => {
    const response = await api.get('/dashboard/revenue')
    return response.data
  },

  getActivities: async (): Promise<RecentActivity> => {
    const response = await api.get('/dashboard/activities')
    return response.data
  },

  getHealth: async (): Promise<SystemHealth> => {
    const response = await api.get('/dashboard/health')
    return response.data
  },

  getSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get('/dashboard/summary')
    return response.data
  }
}

export default dashboardService