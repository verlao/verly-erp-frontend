# Evidências — ações do painel do lead

As capturas usam `lead-actions-mock-server.mjs` com o mesmo lead determinístico
na base `prod` e nesta branch. O lead reproduz a extração problemática
(`12x PORTA` + `1x PORTA`) e a próxima pergunta calculada pelo backend.

## Preparação

```sh
node evidencias/lead-actions-mock-server.mjs
VITE_API_URL=http://127.0.0.1:8082/verly-service npm run dev -- --host 127.0.0.1 --port 5173
VITE_API_URL=http://127.0.0.1:8082/verly-service npm run dev -- --host 127.0.0.1 --port 5175
```

A branch foi servida em `5173`; um worktree detached de `prod` foi servido em
`5175`. `contact-seed.html` instala somente a sessão local de evidência e abre
`/leads?leadId=23`.

## Comandos das screenshots

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-first-run --user-data-dir="/private/tmp/lead-actions-proof-before" --virtual-time-budget=5000 --screenshot="evidencias/lead-actions-before-1600x1200.png" --window-size=1600,1200 "http://127.0.0.1:5175/evidencias/contact-seed.html?leadId=23"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-first-run --user-data-dir="/private/tmp/lead-actions-proof-after" --virtual-time-budget=5000 --screenshot="evidencias/lead-actions-after-1600x1200.png" --window-size=1600,1200 "http://127.0.0.1:5173/evidencias/contact-seed.html?leadId=23"
```

| Estado | Captura |
|---|---|
| Antes: card só com Copiar e sem entrada de conferência | [PNG](lead-actions-before-1600x1200.png) |
| Depois: Enviar no WhatsApp, Copiar e entradas de conferência | [PNG](lead-actions-after-1600x1200.png) |

## Mensagem exata do WhatsApp

O texto vem de `lead.suggestedReply`, já calculado pelo backend. O frontend não
acrescenta saudação nem reescreve a mensagem:

```text
Pra fechar o orçamento do porta, me passa a largura × altura?
```

URL desktop gerada por `buildWhatsAppUrl` para o telefone do lead de evidência:

```text
https://web.whatsapp.com/send?phone=5521969478521&text=Pra%20fechar%20o%20or%C3%A7amento%20do%20porta%2C%20me%20passa%20a%20largura%20%C3%97%20altura%3F
```

## Caminho até a conferência

As três entradas do painel — aviso da extração, `Conferir/corrigir` em Produtos
e `Conferir extração` no rodapé — chamam `goToQuote()` com o ID selecionado:

```text
/leads?leadId=23 → /leads/23/orcamento
```

A ação rápida da lista emite `review-extraction`; `Leads.vue` usa o ID daquela
linha e abre a mesma rota. Os quatro caminhos e o ID `42` de teste são cobertos
por `LeadPanelActions.test.ts`.

## Gate local

```text
npm ci && npm run build  # passou
npm run test:run         # 15 arquivos, 134 testes passaram
```
