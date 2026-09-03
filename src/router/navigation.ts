import type { RouteRecordNameGeneric, RouteRecordRaw } from 'vue-router'

export const navigationSurfaces = ['bottom', 'more', 'sidebar'] as const

export type NavigationSurface = (typeof navigationSurfaces)[number]
export type NavigationPermission = 'admin'
export type NavigationIcon =
  | 'finance'
  | 'inbox'
  | 'kanban'
  | 'orders'
  | 'partners'
  | 'people'
  | 'plus'
  | 'products'
  | 'quotes'
  | 'shield'

type NavigationIcons =
  | NavigationIcon
  | Partial<Record<NavigationSurface, NavigationIcon>>

export interface NavigationMetadata {
  label: string
  accessibleLabel?: string
  emphasis?: 'primary'
  icon: NavigationIcons
  placements: Partial<Record<NavigationSurface, number>>
  permission?: NavigationPermission
}

export interface NavigationItem extends NavigationMetadata {
  name: RouteRecordNameGeneric
  icon: NavigationIcon
}

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresAdmin?: boolean
    pageTitle?: string
    nav?: NavigationMetadata
    navHidden?: {
      reason: string
    }
  }
}

function visitRoutes(
  routes: readonly RouteRecordRaw[],
  visit: (route: RouteRecordRaw) => void,
) {
  for (const route of routes) {
    visit(route)
    if (route.children) visitRoutes(route.children, visit)
  }
}

function iconForSurface(
  icon: NavigationIcons,
  surface: NavigationSurface,
): NavigationIcon | undefined {
  return typeof icon === 'string' ? icon : icon[surface]
}

export function navigationItemsFor(
  routes: readonly RouteRecordRaw[],
  surface: NavigationSurface,
): NavigationItem[] {
  const items: NavigationItem[] = []

  visitRoutes(routes, (route) => {
    const nav = route.meta?.nav
    const order = nav?.placements[surface]
    const icon = nav && iconForSurface(nav.icon, surface)

    if (nav && order !== undefined && icon && route.name) {
      items.push({ ...nav, name: route.name, icon })
    }
  })

  return items.sort(
    (left, right) =>
      left.placements[surface]! - right.placements[surface]!,
  )
}

export function canAccessNavigationItem(
  item: NavigationItem,
  isAdmin: boolean,
) {
  return item.permission !== 'admin' || isAdmin
}

export function validateNavigationRoutes(routes: readonly RouteRecordRaw[]) {
  const errors: string[] = []

  visitRoutes(routes, (route) => {
    const routeId = route.name ? String(route.name) : route.path
    const nav = route.meta?.nav
    const hidden = route.meta?.navHidden

    if (!nav && !hidden) {
      errors.push(
        `Route "${routeId}" must explicitly declare meta.nav or meta.navHidden.`,
      )
      return
    }

    if (nav && hidden) {
      errors.push(
        `Route "${routeId}" cannot declare both meta.nav and meta.navHidden.`,
      )
    }

    if (!nav) return

    const placements = navigationSurfaces.filter(
      (surface) => nav.placements[surface] !== undefined,
    )
    if (placements.length === 0) {
      errors.push(
        `Route "${routeId}" is a user destination but is not reachable from any navigation surface.`,
      )
    }

    if (!route.name) {
      errors.push(`Navigation destination "${routeId}" must have a route name.`)
    }

    for (const surface of placements) {
      if (!iconForSurface(nav.icon, surface)) {
        errors.push(
          `Route "${routeId}" has no icon for its "${surface}" navigation placement.`,
        )
      }
    }

    if (route.meta?.requiresAdmin && nav.permission !== 'admin') {
      errors.push(
        `Route "${routeId}" requires admin access but its navigation metadata does not.`,
      )
    }
  })

  if (errors.length > 0) {
    throw new Error(`Invalid route navigation metadata:\n- ${errors.join('\n- ')}`)
  }
}
