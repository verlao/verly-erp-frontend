import http from 'node:http'

const leads = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  name: [
    'Ana Souza',
    'Bruno Lima',
    'Carla Mendes',
    'Diego Alves',
    'Elisa Rocha',
    'Felipe Costa',
    'Gabriela Luz',
    'Henrique Reis',
    'Isabela Dias',
    'João Martins',
    'Karen Freitas',
    'Lucas Nunes',
    'Marina Lopes',
    'Nicolas Silva',
    'Olívia Ramos',
    'Paulo Vieira',
    'Queila Melo',
    'Rafael Gomes',
    'Sara Pinto',
    'Tiago Moraes',
  ][index],
  phone: `(11) 99999-${String(1000 + index)}`,
  email: `lead${index + 1}@example.com`,
  description: 'Orçamento de box e espelho sob medida.',
  city: 'São Paulo',
  neighborhood: 'Centro',
  data: '{}',
  createdDate: new Date(Date.UTC(2026, 7, 31 - index)).toISOString(),
  status: index < 8 ? 'NEW' : index < 14 ? 'CONTACTED' : 'QUALIFIED',
  isRead: index % 3 !== 0,
  tier: index < 4 ? '$$$' : index < 12 ? '$$' : '$',
  totalEstimatedValue: 1800 + index * 175,
  totalEstimatedProfit: 620 + index * 60,
}))

const counts = {
  all: 232,
  new: 88,
  contacted: 70,
  qualified: 74,
  converted: 0,
  lost: 0,
  totals: {
    all: 71176.74,
    new: 25000,
    contacted: 22176.74,
    qualified: 24000,
    converted: 0,
    lost: 0,
  },
  measuredTotals: {
    all: 53245.74,
    new: 19000,
    contacted: 16245.74,
    qualified: 18000,
    converted: 0,
    lost: 0,
  },
  partners: {
    all: 12,
    totals: {
      all: 8043.21,
      new: 8043.21,
      contacted: 0,
      qualified: 0,
      converted: 0,
      lost: 0,
    },
  },
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
  if (url.pathname === '/verly-service/leads/paginated') {
    response.end(JSON.stringify({
      content: leads,
      totalElements: 232,
      totalPages: 12,
      size: 20,
      number: 0,
      first: true,
      last: false,
    }))
    return
  }

  if (url.pathname === '/verly-service/leads/counts') {
    response.end(JSON.stringify(counts))
    return
  }

  response.end(JSON.stringify([]))
})

server.listen(8080, '127.0.0.1', () => {
  console.log('evidence mock listening on http://127.0.0.1:8080')
})
