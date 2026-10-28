export type Movement = 'in' | 'out' | 'own' | 'reference' | 'unknown'

export interface PreviewReceipt {
  id: number
  movement: Movement
  /** Null means no measured amount is available; it must never be displayed or posted as zero. */
  amountCents: number | null
  date: string
  contact: string
  payer: string
  payee: string
  customerId?: number
  orderId?: number
  partnerId?: number
  candidateCustomerIds?: number[]
  suggestedPurpose?: string
  title: string
  subtitle: string
  widthCm?: number
  heightCm?: number
  evidence: {
    conversation: string
    receipt: string
    support: string
    receivedAt: string
    sources: string[]
    warning?: string
  }
}

export const receipts: PreviewReceipt[] = [
  {
    id: 101,
    movement: 'in',
    amountCents: 48000,
    date: '2026-10-15',
    contact: 'Ana Box',
    payer: 'Carlos',
    payee: 'Verly Vidros',
    customerId: 1,
    orderId: 1048,
    title: 'Ana Exemplo · pedido 1048',
    subtitle: 'Pix de Carlos · finalidade a conferir para o pedido 1048',
    widthCm: 120,
    heightCm: 80,
    evidence: {
      conversation: 'Ana Box (11 99999-4421): “Carlos vai fazer o Pix do sinal da janela hoje.”',
      receipt: 'Pix recebido de Carlos para a conta da Verly Vidros.',
      support: 'Pedido 1048 de Ana Exemplo · saldo R$ 960,00 · sinal previsto R$ 380,00',
      receivedAt: '15/10/2026 às 10:42',
      sources: ['Comprovante Pix simulado · valor/data/direção', 'Conversa simulada · remetente', 'Pedido de exemplo · saldo e cliente'],
      warning: 'O valor recebido difere do sinal previsto. Confira a finalidade antes de confirmar.'
    }
  },
  {
    id: 102,
    movement: 'out',
    amountCents: 12490,
    date: '2026-10-15',
    contact: 'Rui',
    payer: 'Verly Vidros',
    payee: 'Posto Exemplo',
    partnerId: 10,
    suggestedPurpose: 'Combustível',
    title: 'Pix enviado · Posto Exemplo',
    subtitle: 'Rui enviou para abastecimento',
    evidence: {
      conversation: 'Rui: “Abasteci a Fiorino para as instalações de hoje.”',
      receipt: 'Pix enviado pela conta da Verly Vidros para Posto Exemplo.',
      support: 'Comprovante identifica Posto Exemplo como recebedor; Rui é o funcionário que encaminhou a informação.',
      receivedAt: '15/10/2026 às 11:18',
      sources: ['Comprovante Pix simulado · valor/data/direção/recebedor', 'Conversa simulada · funcionário remetente']
    }
  },
  {
    id: 103,
    movement: 'out',
    amountCents: 85000,
    date: '2026-10-15',
    contact: 'Bruno Prestador',
    payer: 'Verly Vidros',
    payee: 'Bruno Prestador',
    partnerId: 11,
    suggestedPurpose: 'Serviço',
    title: 'Pix enviado · Bruno Prestador',
    subtitle: 'Serviço sem pedido associado',
    evidence: {
      conversation: 'Bruno: “Recebi o pagamento da instalação avulsa.”',
      receipt: 'Pix enviado para Bruno Prestador.',
      support: 'Não há pedido associado a este serviço.',
      receivedAt: '15/10/2026 às 14:06',
      sources: ['Comprovante Pix simulado · valor/data/direção/recebedor', 'Conversa simulada · confirmação do prestador']
    }
  },
  {
    id: 104,
    movement: 'reference',
    amountCents: 23000,
    date: '2026-10-15',
    contact: 'Pessoa Exemplo',
    payer: 'Pessoa Exemplo',
    payee: 'Terceiro Exemplo',
    title: 'Comprovante encaminhado · Pessoa Exemplo',
    subtitle: 'Referência de pagamento sem confirmação de crédito',
    evidence: {
      conversation: 'Pessoa Exemplo: “Esse é o modelo do comprovante para você conferir.”',
      receipt: 'Imagem de exemplo entre terceiros · sem confirmação de transação',
      support: 'Mensagem identifica o arquivo como modelo.',
      receivedAt: '15/10/2026 às 15:20',
      sources: ['Imagem de exemplo simulada · não comprova transação', 'Conversa simulada · finalidade do envio']
    }
  },
  {
    id: 105,
    movement: 'own',
    amountCents: 90000,
    date: '2026-10-15',
    contact: 'Verly Vidros',
    payer: 'Verly Vidros · conta principal',
    payee: 'Verly Vidros · conta reserva',
    title: 'Transferência entre contas próprias',
    subtitle: 'Origem e destino pertencem à loja',
    evidence: {
      conversation: 'Registro interno: “Transferir para a conta reserva da loja.”',
      receipt: 'Transferência entre duas contas da loja.',
      support: 'As duas contas estão identificadas como contas da Verly Vidros.',
      receivedAt: '15/10/2026 às 16:03',
      sources: ['Registro de exemplo simulado · origem/destino', 'Conversa interna simulada']
    }
  },
  {
    id: 106,
    movement: 'unknown',
    amountCents: 51000,
    date: '2026-09-30',
    contact: 'Contato sem identificação',
    payer: 'Desconhecido',
    payee: 'Verly Vidros',
    candidateCustomerIds: [1, 2],
    title: 'Comprovante de Pix · origem incerta',
    subtitle: 'As evidências apontam para naturezas diferentes',
    evidence: {
      conversation: 'Mensagem: “Foi o pagamento do serviço.” Em seguida: “Só encaminhei o comprovante, ainda não paguei.”',
      receipt: 'Comprovante menciona um valor, mas não identifica status de liquidação.',
      support: 'O comprovante e a conversa não identificam com segurança o pagador ou a finalidade.',
      receivedAt: '30/09/2026 às 09:12',
      sources: ['Comprovante Pix simulado · valor/data, liquidação incerta', 'Conversa simulada · versões contraditórias'],
      warning: 'Escolha a natureza, o destino e a categoria; informe o motivo da correção antes de confirmar.'
    }
  },
  {
    id: 107,
    movement: 'unknown',
    amountCents: null,
    date: '2026-10-16',
    contact: 'Contato sem identificação',
    payer: 'Não identificado',
    payee: 'Não identificado',
    title: 'Comprovante sem valor medido',
    subtitle: 'O valor ainda não foi extraído do comprovante',
    candidateCustomerIds: [1, 2],
    evidence: {
      conversation: 'Mensagem simulada: “Encaminhei o comprovante, veja se consegue identificar.”',
      receipt: 'Imagem simulada recebida · valor não legível nesta prévia',
      support: 'Há dois pedidos recentes possíveis; o destino não foi escolhido e o valor segue sem medição.',
      receivedAt: '16/10/2026 às 08:47',
      sources: ['Imagem de exemplo simulada · valor ausente', 'Contexto de exemplo · dois pedidos candidatos'],
      warning: 'Sem valor medido, mantenha na fila. Não é possível confirmar ou lançar este movimento.'
    }
  }
]

export const customers = [
  { id: 1, name: 'Ana Exemplo', alias: 'Ana Box', phone: '11999994421', orderId: 1048, orderBalanceCents: 96000, signalCents: 38000 },
  { id: 2, name: 'Beatriz Teste', alias: 'Bia Janela', phone: '11999994422', orderId: 1052, orderBalanceCents: 48000, signalCents: 24000 }
]

export const partners = [
  { id: 10, name: 'Posto Exemplo', type: 'fornecedor' },
  { id: 11, name: 'Bruno Prestador', type: 'prestador' }
]
