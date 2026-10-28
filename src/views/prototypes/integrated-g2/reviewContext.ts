// Contrato de apresentação descartável: dados sintéticos, sem API e sem persistência.
import { ref } from 'vue'

export type FieldOrigin = 'record' | 'extracted' | 'default' | 'calculated' | 'confirmed' | 'unknown'
export interface ReviewField<T> { value: T | null; origin: FieldOrigin; sourceLabel: string; quote?: string }
export const field = <T>(value: T | null, origin: FieldOrigin, sourceLabel: string, quote?: string): ReviewField<T> => ({ value, origin, sourceLabel, quote })
export const originLabels: Record<FieldOrigin, string> = { record: 'Do cadastro', extracted: 'Da conversa · conferir', default: 'Padrão · conferir', calculated: 'Calculado', confirmed: 'Conferido por você', unknown: 'Ainda falta' }
export interface ReviewPiece {
 id: number
 productType: 'JANELA' | 'BOX' | 'ESPELHO' | 'FORRO_PVC' | 'PORTA_ALUMINIO'
 category: 'VIDRO_TEMPERADO' | 'PVC' | 'ALUMINIO'
 pricingBasis: 'PER_UNIT' | 'PER_M2'
 name: string
 widthCm: ReviewField<number>
 heightCm: ReviewField<number>
 areaM2: ReviewField<number>
 sheets: ReviewField<number>
 color: ReviewField<string>
 quantity: ReviewField<number>
 pendingMeasurement: boolean
 variantGroup?: string
 variantSelected: boolean
 estimatedUnitCents: number | null
}
export interface ReviewLead {
 id: number
 revision: number
 name: ReviewField<string>
 phone: ReviewField<string>
 address: ReviewField<string>
 items: ReviewPiece[]
 visitDay: ReviewField<string>
 visitTime: ReviewField<string>
 candidateCustomerIds: number[]
 linkedCustomerId: number | null
 transcript: string
}
export interface ReviewCustomer {
 id: number
 name: string
 alias: string
 phone: string
 secondPhone: string
 document: string
 addresses: Array<{ id: number; label: string; value: string }>
}
export const reviewCustomers = ref<ReviewCustomer[]>([
 { id: 1, name: 'Ana Exemplo', alias: 'Ana Box', phone: '11999994421', secondPhone: '', document: '', addresses: [{ id: 11, label: 'Obra da janela', value: 'Rua Exemplo, 1048 · Bairro Modelo, São Paulo' }] },
 { id: 2, name: 'Beatriz Teste', alias: 'Bia Janela', phone: '11999994422', secondPhone: '', document: '', addresses: [{ id: 21, label: 'Endereço do cadastro', value: 'Av. Exemplo, 2052 · Vila Teste, São Paulo' }] },
 { id: 3, name: 'Ana Teste', alias: 'Ana reforma', phone: '21999994421', secondPhone: '', document: '', addresses: [{ id: 31, label: 'Outro cadastro', value: 'Rua Modelo, 31 · Bairro Teste, Rio de Janeiro' }] },
 { id: 4, name: 'Mariana Exemplo', alias: '', phone: '21988421603', secondPhone: '', document: '', addresses: [] },
 { id: 5, name: 'Estúdio Exemplo', alias: '', phone: '21991084412', secondPhone: '', document: '', addresses: [] },
 { id: 6, name: 'Rafael Teste', alias: '', phone: '21997720834', secondPhone: '', document: '', addresses: [] },
 { id: 7, name: 'Clínica Exemplo', alias: '', phone: '21982107741', secondPhone: '', document: '', addresses: [] },
])
const emptyNumber = () => field<number>(null, 'unknown', 'Não informado na conversa')
const glassPiece = (id: number, name: string, type: ReviewPiece['productType'], width: number | null, height: number | null, color: string | null, price: number | null): ReviewPiece => ({
 id, productType: type, category: 'VIDRO_TEMPERADO', pricingBasis: 'PER_UNIT', name,
 widthCm: width === null ? emptyNumber() : field(width, 'extracted', 'Mensagem do cliente · 15 out', `${width} por ${height ?? 'altura a confirmar'} cm`),
 heightCm: height === null ? emptyNumber() : field(height, 'extracted', 'Mensagem do cliente · 15 out'),
 areaM2: emptyNumber(), sheets: field(1, 'default', 'Padrão do extrator; a conversa não informou folhas'),
 color: color ? field(color, 'extracted', 'Mensagem do cliente · 15 out') : field('INCOLOR', 'default', 'Padrão do extrator; a conversa não informou cor'),
 quantity: field(1, 'extracted', 'Pedido de uma peça na conversa'), pendingMeasurement: width === null || height === null,
 variantSelected: true, estimatedUnitCents: price,
})
export const reviewLeads = ref<ReviewLead[]>([
 { id: 1, revision: 1, name: field('Ana Box', 'extracted', 'Nome de perfil no WhatsApp'), phone: field('11999994421', 'extracted', 'Número da conversa'), address: field('Rua Exemplo, 1048 · Bairro Modelo, São Paulo', 'record', 'Cadastro · obra da janela'), items: [glassPiece(101, 'Janela temperada', 'JANELA', 120, 80, 'INCOLOR', 134000)], visitDay: field('2026-10-17', 'extracted', 'Conversa · 15 out', 'Podem vir no sábado para conferir a janela?'), visitTime: field<string>(null, 'unknown', 'Horário ainda não combinado'), candidateCustomerIds: [1], linkedCustomerId: null, transcript: 'Ana Box: Quero uma janela incolor, 120 por 80 cm. Podem vir no sábado para conferir a medida? Carlos vai fazer o Pix do sinal.' },
 { id: 2, revision: 1, name: field('Bia Janela', 'extracted', 'Nome de perfil no WhatsApp'), phone: field('11999994422', 'extracted', 'Número da conversa'), address: field('Moema, São Paulo', 'extracted', 'Localização parcial da conversa'), items: [glassPiece(201, 'Box de correr', 'BOX', 150, null, null, null)], visitDay: field<string>(null, 'unknown', 'Visita ainda não combinada'), visitTime: field<string>(null, 'unknown', 'Horário ainda não combinado'), candidateCustomerIds: [2], linkedCustomerId: null, transcript: 'Bia Janela: Preciso de um box de correr. O vão tem 150 cm de largura; ainda vou medir a altura. É para a obra em Moema.' },
 { id: 232, revision: 1, name: field('Paula Exemplo', 'extracted', 'Nome de perfil no WhatsApp'), phone: field('11981225400', 'extracted', 'Número da conversa'), address: field<string>(null, 'unknown', 'Endereço da obra não informado'), items: [{ ...glassPiece(2321, 'Janela · opção incolor', 'JANELA', 180, 210, 'INCOLOR', 247500), variantGroup: 'janela-paula', variantSelected: false }, { ...glassPiece(2322, 'Janela · opção verde', 'JANELA', 180, 210, 'VERDE', 268000), variantGroup: 'janela-paula', variantSelected: false }], visitDay: field<string>(null, 'unknown', 'Visita ainda não combinada'), visitTime: field<string>(null, 'unknown', 'Horário ainda não combinado'), candidateCustomerIds: [], linkedCustomerId: null, transcript: 'Paula Exemplo: Para a janela de 180 por 210, quanto fica incolor ou verde? Quero comparar antes de escolher.' },
 { id: 219, revision: 1, name: field('Caio Teste', 'extracted', 'Nome de perfil no WhatsApp'), phone: field('11983916108', 'extracted', 'Número da conversa'), address: field('Bairro Modelo, São Paulo', 'extracted', 'Localização parcial'), items: [{ ...glassPiece(2191, 'Forro PVC', 'FORRO_PVC', null, null, null, null), category: 'PVC', pricingBasis: 'PER_M2', areaM2: field(12, 'extracted', 'Mensagem do cliente', 'São 12 m² de forro'), color: field('BRANCO', 'extracted', 'Mensagem do cliente'), sheets: emptyNumber(), pendingMeasurement: false, estimatedUnitCents: 96000 }], visitDay: field<string>(null, 'unknown', 'Não combinada'), visitTime: field<string>(null, 'unknown', 'Não combinado'), candidateCustomerIds: [], linkedCustomerId: null, transcript: 'Caio Teste: São 12 m² de forro PVC branco. Quero saber o preço instalado.' },
])
export const findReviewLead = (id: unknown) => reviewLeads.value.find(lead => lead.id === Number(id))
export const findReviewCustomer = (id: unknown) => reviewCustomers.value.find(customer => customer.id === Number(id))
export function resolveReviewCustomer(id: number | null) { return id === null ? undefined : findReviewCustomer(id) }
