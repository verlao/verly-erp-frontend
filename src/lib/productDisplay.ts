// Helpers de exibição de produto compartilhados entre Products.vue,
// ProductGroupRow e ProductVariantCard (evita duplicar os mapas).
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

export type ProductBadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info'

// Categorias de produto → variantes tokenizadas do ui/Badge.
const TYPE_BADGE_VARIANTS: Record<string, ProductBadgeVariant> = {
  PORTA: 'info',
  JANELA: 'success',
  SACADA: 'default',
  BASCULANTE: 'warning',
  BOX: 'outline',
  FIXO: 'secondary',
}

export function typeBadgeVariant(type?: string): ProductBadgeVariant {
  return (type && TYPE_BADGE_VARIANTS[type]) || 'secondary'
}

export function standardBadgeVariant(standard?: boolean): ProductBadgeVariant {
  return standard ? 'success' : 'secondary'
}

// Cores de vidro são cores LITERAIS do produto, não estados do tema — por isso
// swatch com hex inline (honesto e independente de claro/escuro), sempre dentro
// de <Badge variant="outline"> pra borda/texto seguirem os tokens.
const GLASS_SWATCHES: Record<string, string> = {
  INCOLOR: 'linear-gradient(135deg, rgba(148,163,184,.35), rgba(226,232,240,.7))',
  VERDE: '#15803d',
  FUME: '#475569',
  BRONZE: '#92400e',
  CANELADO: 'repeating-linear-gradient(45deg, #94a3b8 0 2px, #cbd5e1 2px 4px)',
  ESPELHO: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 45%, #f8fafc 55%, #64748b 100%)',
}

export function glassSwatchStyle(color?: string): Record<string, string> {
  return { background: (color && GLASS_SWATCHES[color]) || 'hsl(var(--muted-foreground) / 0.4)' }
}

// Lucro (preço à vista − custo) formatado, ou '—' se faltar dado.
export function calculateProfit(product: ProductDTO): string {
  if (!product.price || !product.cost) return '—'
  return `R$ ${(product.price - product.cost).toFixed(2)}`
}
