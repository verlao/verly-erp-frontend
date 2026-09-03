import http from 'node:http'

const port = Number(process.env.PORT ?? 8080)

const names = [
  'ISABEL SIMONE DE BARROS VALIM → MAURÍCIO',
  'Claudio e Correa → Star Temper Distribuidora',
  'Matheus Toledo',
  'Luciene Silva de Souza',
  'Alexandre Francisco de Oliveira → ELAINE',
  'Juliana',
  'CONDOMÍNIO PARQUE RESIDENCIAL 31 JULHO',
  'Darli Bento do Nascimento → Matheus da Silva',
  'Andre @. Rio',
  'Marcia Tenório',
  'Roosevelt Vieira de Oliveira Neto → THIAGO',
  'Camila Fernandes',
]

const amounts = [1000, 1000, 100, 100, 400, 300, 280, 21.6, 117, 400, 120, 250]

const pending = names.map((name, index) => ({
  id: index + 1,
  transactionId: `PIX-PROOF-${index + 1}`,
  entryDate: '2026-09-03',
  description: `PIX comprovante — ${name}`,
  customerName: index > 1 ? name : `PIX comprovante — ${name}`,
  documentType: 'INCOME',
  paymentMethod: 'PIX',
  source: 'WHATSAPP',
  hasReceipt: true,
  totalAmount: amounts[index],
  status: 'PENDING',
  createdAt: new Date(Date.UTC(2026, 8, 3, 18 - index * 4)).toISOString(),
  createdBy: 'whatsapp',
  entries: [],
}))

const summary = {
  totalRevenue: 3718.6,
  totalExpenses: 843.2,
  balance: 2875.4,
  count: 18,
  pixIn: 3518.6,
  pixOut: 620,
  pendingCount: 12,
  pendingAmount: 4088.6,
  byMethod: [
    { paymentMethod: 'PIX', in: 3518.6, out: 620 },
    { paymentMethod: 'DINHEIRO', in: 200, out: 0 },
    { paymentMethod: 'CARTAO_CREDITO', in: 0, out: 223.2 },
  ],
  byCounterparty: [
    { counterpartyType: 'CUSTOMER', in: 3718.6, out: 0 },
    { counterpartyType: 'SUPPLIER', in: 0, out: 843.2 },
  ],
}

const server = http.createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Headers', '*')
  response.setHeader('Content-Type', 'application/json')

  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  const url = new URL(request.url ?? '/', 'http://localhost:8080')
  if (url.pathname === '/verly-service/ledgers/pending') {
    response.end(JSON.stringify(pending))
    return
  }
  if (url.pathname === '/verly-service/ledgers/summary') {
    response.end(JSON.stringify(summary))
    return
  }
  if (url.pathname === '/verly-service/ledgers/daily') {
    response.end(JSON.stringify([]))
    return
  }
  if (url.pathname === '/verly-service/ledgers/period/paginated') {
    response.end(JSON.stringify({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0,
      first: true,
      last: true,
    }))
    return
  }

  response.writeHead(404)
  response.end(JSON.stringify({ message: 'Not found' }))
})

server.listen(port, '127.0.0.1', () => {
  console.log(`ledger evidence mock listening on http://127.0.0.1:${port}`)
})
