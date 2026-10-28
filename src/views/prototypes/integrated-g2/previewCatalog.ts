import { ref } from 'vue'

export type ProductType = 'PORTA' | 'JANELA' | 'BOX' | 'FIXO' | 'SACADA' | 'BASCULANTE' | 'ESPELHO' | 'FORRO_PVC' | 'PORTA_ALUMINIO'
export type ProductCategory = 'VIDRO_TEMPERADO' | 'PVC' | 'ALUMINIO'
export type PricingBasis = 'PER_UNIT' | 'PER_M2'
export type Product = { id: number; category: ProductCategory; productType: ProductType; pricingBasis: PricingBasis; color: string; width: number | null; height: number | null; examplePriceCents: number | null }
export const typeLabels: Record<ProductType, string> = { PORTA: 'Porta', JANELA: 'Janela', BOX: 'Box', FIXO: 'Fixo', SACADA: 'Sacada', BASCULANTE: 'Basculante', ESPELHO: 'Espelho', FORRO_PVC: 'Forro PVC', PORTA_ALUMINIO: 'Porta de alumínio' }
export const categoryLabels: Record<ProductCategory, string> = { VIDRO_TEMPERADO: 'Vidro temperado', PVC: 'PVC', ALUMINIO: 'Alumínio' }
export const previewProducts = ref<Product[]>([
  { id: 2101, category: 'VIDRO_TEMPERADO', productType: 'BOX', pricingBasis: 'PER_UNIT', color: 'Incolor', width: 150, height: 210, examplePriceCents: 152490 },
  { id: 2102, category: 'VIDRO_TEMPERADO', productType: 'JANELA', pricingBasis: 'PER_UNIT', color: 'Verde', width: 120, height: 100, examplePriceCents: 56180 },
  { id: 2103, category: 'VIDRO_TEMPERADO', productType: 'FIXO', pricingBasis: 'PER_UNIT', color: 'Fumê', width: 180, height: 220, examplePriceCents: 181460 },
  { id: 2104, category: 'VIDRO_TEMPERADO', productType: 'ESPELHO', pricingBasis: 'PER_UNIT', color: 'Prata', width: 80, height: 120, examplePriceCents: 25740 },
])
