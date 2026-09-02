import http from 'node:http'

const common = {
  phone: '5521969478521',
  description: 'Orçamento recebido pelo WhatsApp.',
  data: '{}',
  createdDate: '2026-09-02T19:43:00.000Z',
  status: 'NEW',
  isRead: true,
  tier: '$',
  latitude: '-22.9068',
  longitude: '-43.1729',
  locationSource: 'gps_pin',
}

const leads = [
  {
    ...common,
    id: 1,
    name: 'Contato WhatsApp',
    email: '5521969478521@whatsapp.internal',
    number: '564',
  },
  {
    ...common,
    id: 2,
    name: 'Cliente com endereço completo',
    email: 'cliente@example.com',
    street: 'Rua das Flores',
    number: '100',
    neighborhood: 'Centro',
    city: 'Rio de Janeiro',
  },
]

const counts = {
  all: leads.length,
  new: leads.length,
  contacted: 0,
  qualified: 0,
  converted: 0,
  lost: 0,
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

  const url = new URL(request.url ?? '/', 'http://localhost:8081')
  if (url.pathname === '/verly-service/leads/paginated') {
    response.end(JSON.stringify({
      content: leads,
      totalElements: leads.length,
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

  const leadMatch = url.pathname.match(/^\/verly-service\/leads\/(\d+)$/)
  if (leadMatch) {
    const lead = leads.find(({ id }) => id === Number(leadMatch[1]))
    response.end(JSON.stringify(lead ?? null))
    return
  }

  response.end(JSON.stringify([]))
})

server.listen(8081, '127.0.0.1', () => {
  console.log('contact evidence mock listening on http://127.0.0.1:8081')
})
