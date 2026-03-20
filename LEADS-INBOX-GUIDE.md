# 📧 Guia da Página de Leads - Inbox Style

## 🎯 Visão Geral

A nova página de Leads foi redesenhada com um layout estilo **inbox** (similar a Gmail/Outlook) para melhorar a gestão e priorização de leads. O design transmite urgência e facilita a triagem e ação rápida.

## ✨ Principais Features

### 1. **Layout Split View (Master-Detail)**
- **Desktop**: Lista de leads à esquerda (35%) + Preview de detalhes à direita (65%)
- **Tablet**: Proporção 40/60
- **Mobile**: Stack vertical com transição fullscreen

### 2. **Sistema de Estados**
Os leads podem ter os seguintes status:

| Status | Badge | Descrição |
|--------|-------|-----------|
| **NEW** | Azul | Lead novo que ainda não foi contatado |
| **CONTACTED** | Amarelo | Lead que já recebeu contato inicial |
| **QUALIFIED** | Verde | Lead qualificado e com potencial |
| **CONVERTED** | Roxo | Lead convertido em cliente |
| **LOST** | Cinza | Lead perdido ou desqualificado |

### 3. **Indicadores Visuais**
- **Não lido**: Fundo destacado + ponto azul + negrito
- **Lido**: Fundo normal
- **Alta prioridade**: Borda vermelha à esquerda

### 4. **Filtros Inteligentes**
- **Tabs rápidas**: Todos, Novos, Contatados, Qualificados, Convertidos
- **Busca**: Nome, email, telefone ou descrição
- **Contadores**: Cada tab mostra o número de leads
- **Indicador**: Ponto azul em "Novos" quando há novos leads

## ⌨️ Atalhos de Teclado

### Navegação
| Tecla | Ação |
|-------|------|
| `j` ou `↓` | Próximo lead |
| `k` ou `↑` | Lead anterior |
| `Enter` | Abrir lead selecionado |
| `Esc` | Fechar preview |

### Ações
| Tecla | Ação |
|-------|------|
| `r` | Marcar como lido |
| `c` | Converter em cliente |
| `e` | Enviar email |
| `w` | Abrir WhatsApp |
| `a` | Arquivar/Marcar como perdido |

### Filtros
| Tecla | Ação |
|-------|------|
| `t` | Mostrar todos |
| `n` | Mostrar apenas novos |
| `q` | Mostrar qualificados |

## 🖱️ Ações Rápidas

### No Hover (Desktop)
Ao passar o mouse sobre um lead, aparecem botões de ação rápida:
- ✓ Marcar como lido
- 📞 Ligar
- ✉️ Enviar email

### Ações Principais
No painel de preview, você pode:
- **Converter em Cliente**: Transforma o lead em cliente no sistema
- **Marcar como Contatado**: Muda status para CONTACTED
- **Marcar como Qualificado**: Muda status para QUALIFIED
- **Abrir WhatsApp**: Abre conversa no WhatsApp Web
- **Enviar Email**: Abre cliente de email padrão
- **Marcar como Perdido**: Move para status LOST

## 📱 Responsividade

### Desktop (>1024px)
- Split view completo
- Ações aparecem no hover
- Atalhos de teclado ativos
- Melhor para triagem rápida

### Tablet (768-1024px)
- Split view ajustado
- Ações sempre visíveis
- Touch-friendly

### Mobile (<768px)
- Lista fullscreen
- Preview em tela separada
- Botão "Voltar" para retornar à lista
- Otimizado para uso com uma mão

## 🔄 Fluxo de Trabalho Recomendado

1. **Triagem Inicial** (Tab "Novos")
   - Abrir cada lead novo
   - Ler descrição e informações
   - Decidir se é qualificado
   - Usar atalho `k`/`j` para navegar

2. **Contato**
   - Usar botões WhatsApp ou Email
   - Marcar como "Contatado" após contato
   - Adicionar observações (futura feature)

3. **Qualificação** (Tab "Contatados")
   - Avaliar potencial do lead
   - Marcar como "Qualificado" se tiver fit
   - Ou "Perdido" se não houver interesse

4. **Conversão** (Tab "Qualificados")
   - Negociar com o lead
   - Quando fechar, usar "Converter em Cliente"
   - Lead vira cliente automaticamente

## 🎨 Personalização Visual

### Cores por Status
As cores seguem o design system do shadcn:
- **Azul**: Novo (urgente)
- **Amarelo**: Contatado (em progresso)
- **Verde**: Qualificado (positivo)
- **Roxo**: Convertido (sucesso)
- **Cinza**: Perdido (inativo)

## 🔧 Configuração Backend

### Novos Endpoints Necessários

```typescript
// Atualizar status
PATCH /leads/{id}/status
Body: { status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST' }

// Marcar como lido/não lido
PATCH /leads/{id}/read
Body: { isRead: boolean }

// Converter em cliente
POST /leads/{id}/convert

// Obter contadores
GET /leads/counts
Response: { all: number, new: number, contacted: number, qualified: number, converted: number, lost: number }

// Ações em lote
POST /leads/bulk
Body: { ids: number[], action: string, data?: any }
```

### Novos Campos no DTO

```typescript
interface LeadDTO {
  // Campos existentes...

  // Novos campos
  status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST'
  isRead?: boolean
  priority?: 'HIGH' | 'MEDIUM' | 'LOW'
  tags?: string[]
  lastContactDate?: string
  assignedTo?: string
  notes?: string[]
}
```

## 📊 Métricas e Analytics

A nova interface permite rastrear:
- Taxa de conversão por status
- Tempo médio de resposta
- Leads por origem (UTM)
- Performance por dispositivo
- Taxa de qualificação

## 🚀 Próximas Melhorias

- [ ] Sistema de tags personalizadas
- [ ] Notas e histórico de interações
- [ ] Atribuição de leads para usuários
- [ ] Integração com CRM
- [ ] Email direto pela plataforma
- [ ] Templates de resposta rápida
- [ ] Dashboard de métricas
- [ ] Exportação de relatórios
- [ ] Notificações push para novos leads
- [ ] Score de qualificação automático

## 💡 Dicas de Uso

1. **Use os atalhos de teclado** para triagem rápida
2. **Marque como lido** para não perder o controle
3. **Use a busca** para encontrar leads específicos
4. **Mantenha os status atualizados** para métricas precisas
5. **Responda rápido aos leads novos** (ponto azul indica urgência)

## 🐛 Troubleshooting

### Lead não aparece?
- Verifique os filtros ativos
- Use o botão "Limpar" para resetar filtros
- Verifique se há paginação ativa

### Ações não funcionam?
- Verifique console do navegador
- Confirme que o backend está respondendo
- Veja se há erros de permissão

### Layout quebrado no mobile?
- Limpe o cache do navegador
- Verifique se o Tailwind foi compilado
- Teste em modo anônimo

## 📞 Suporte

Para problemas ou sugestões:
- Abra uma issue no repositório
- Contate o time de desenvolvimento
- Consulte a documentação do projeto

---

**Versão**: 1.0.0
**Última atualização**: 2025-10-19
**Desenvolvido com**: Vue 3 + TypeScript + Shadcn-vue + Tailwind CSS
