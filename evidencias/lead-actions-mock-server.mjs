import http from 'node:http'

const lead = {
  id: 23,
  name: 'Cliente Exemplo',
  phone: '5521969478521',
  email: '5521969478521@whatsapp.internal',
  description: 'Cliente pediu portas de vidro pelo WhatsApp.',
  city: 'Rio de Janeiro',
  neighborhood: 'Centro',
  data: '{}',
  createdDate: '2026-09-02T19:43:00.000Z',
  status: 'NEW',
  isRead: true,
  tier: '$$',
  suggestedReply: 'Pra fechar o orçamento do porta, me passa a largura × altura?',
  items: [
    { id: 1, productType: 'PORTA', quantity: 12, estimatedValue: 3600 },
    { id: 2, productType: 'PORTA', quantity: 1, estimatedValue: 300 },
  ],
  totalEstimatedValue: 3900,
  totalEstimatedProfit: 1170,
}

const counts = {
  all: 1,
  new: 1,
  contacted: 0,
  qualified: 0,
  converted: 0,
  lost: 0,
}

const server = http.createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Headers', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET,PATCH,OPTIONS')
  response.setHeader('Content-Type', 'application/json')

  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  const url = new URL(request.url ?? '/', 'http://localhost:8082')
  if (url.pathname === '/verly-service/leads/paginated') {
    response.end(JSON.stringify({
      content: [lead],
      totalElements: 1,
      totalPages: 1,
      size: 20,
      number: 0,
      first: true,
      last: true,
    }))
    return
  }

  if (url.pathname === '/verly-service/leads/counts') {
    response.end(JSON.stringify(counts))
    return
  }

  if (url.pathname === `/verly-service/leads/${lead.id}`) {
    response.end(JSON.stringify(lead))
    return
  }

  if (url.pathname === `/verly-service/leads/${lead.id}/status` && request.method === 'PATCH') {
    response.end(JSON.stringify({ ...lead, status: 'CONTACTED' }))
    return
  }

  response.end(JSON.stringify([]))
})

server.listen(8082, '127.0.0.1', () => {
  console.log('lead actions evidence mock listening on http://127.0.0.1:8082')
})
