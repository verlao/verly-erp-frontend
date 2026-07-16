// Helpers de exibição de produto compartilhados entre Products.vue,
// ProductGroupRow e ProductVariantCard (evita duplicar os mapas de classe).
import type { ProductDTO } from '../services/product'

// Um grupo agrega as variantes de cor de um mesmo produto (tipo+folhas+dimensões).
export interface ProductGroup {
  key: string
  type?: string
  sheets?: number
  width?: number
  height?: number
  measure?: number
  standard?: boolean
  variants: ProductDTO[]
  colorCount: number
  priceMin: number
  priceMax: number
}

export function typeBadgeClass(type?: string): Record<string, boolean> {
  return {
    'bg-blue-100 text-blue-800': type === 'PORTA',
    'bg-green-100 text-green-800': type === 'JANELA',
    'bg-purple-100 text-purple-800': type === 'SACADA',
    'bg-orange-100 text-orange-800': type === 'BASCULANTE',
    'bg-cyan-100 text-cyan-800': type === 'BOX',
    'bg-gray-100 text-gray-800': type === 'FIXO',
    'bg-gray-100 text-gray-500': !type,
  }
}

export function colorBadgeClass(color?: string): Record<string, boolean> {
  return {
    'bg-indigo-100 text-indigo-800': color === 'INCOLOR',
    'bg-emerald-100 text-emerald-800': color === 'VERDE',
    'bg-slate-100 text-slate-800': color === 'FUME',
    'bg-yellow-100 text-yellow-800': color === 'BRONZE',
    'bg-gray-100 text-gray-500': !color,
  }
}

export function standardBadgeClass(standard?: boolean): Record<string, boolean> {
  return {
    'bg-green-100 text-green-700': standard === true,
    'bg-gray-100 text-gray-600': standard === false,
  }
}

// Lucro (preço à vista − custo) formatado, ou '—' se faltar dado.
export function calculateProfit(product: ProductDTO): string {
  if (!product.price || !product.cost) return '—'
  return `R$ ${(product.price - product.cost).toFixed(2)}`
}
