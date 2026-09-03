# Provas — navegação derivada do router

## Rotas × superfícies, antes e depois

| Rota | Antes | Depois |
|---|---|---|
| `/` (`Login`) | Nenhuma | Nenhuma — `navHidden`: entrada de autenticação |
| `/` (`MainLayout`) | Nenhuma | Nenhuma — `navHidden`: rota de layout |
| `/dashboard` | **Nenhuma, órfã** | Nenhuma — `navHidden`: diagnóstico técnico de JVM |
| `/customers` | Sidebar, Mais | Sidebar, Mais |
| `/products` | Sidebar, Mais | Sidebar, Mais |
| `/quotes` | Bottom nav, Sidebar | Bottom nav, Sidebar |
| `/new-quote` | Bottom nav (`Novo`) | Bottom nav (`Novo`) |
| `/orders` | Sidebar, Mais | Sidebar, Mais |
| `/ledger` | Bottom nav, Sidebar | Bottom nav, Sidebar |
| `/leads` | Bottom nav, Sidebar | Bottom nav, Sidebar |
| `/leads/:id/orcamento` | Nenhuma; fluxo contextual | Nenhuma — `navHidden`: detalhe contextual |
| `/leads/:id/quotes` | Nenhuma; redirect | Nenhuma — `navHidden`: redirect de compatibilidade |
| `/partners` | Sidebar, Mais | Sidebar, Mais |
| `/kanban` | Sidebar, Mais | Sidebar, Mais |
| `/users` | Sidebar, Mais; somente admin | Sidebar, Mais; permissão `admin` declarada |

**Diff de destinos visíveis: nenhum.** Ordem, rótulos e ícones também foram preservados. O botão estrutural `Mais` continua como o quinto lugar da bottom nav, e `Sair` continua ancorado fora das listas roláveis.

`/dashboard` foi mantida e não foi exposta. Ela mostra memória da JVM e número de processadores; manter, refazer ou remover essa tela continua sendo decisão do dono do produto.

## Guard visto falhando

Foi adicionada temporariamente a rota `OrphanProof`, com `meta.nav` e sem nenhuma placement, e executado:

```text
npm run test:run -- src/router/navigation.test.ts
```

Resultado vermelho antes de reverter a rota temporária:

```text
FAIL  src/router/navigation.test.ts > route navigation metadata > requires every route to be a reachable destination or explicitly hidden
Error: Invalid route navigation metadata:
- Route "OrphanProof" is a user destination but is not reachable from any navigation surface.

Test Files  1 failed (1)
Tests       1 failed | 2 passed (3)
```

## Screenshots via headless Chrome

Com o app em `npm run dev -- --host 127.0.0.1`, o comando reproduzível foi:

```text
node scripts/capture-navigation-screenshots.mjs proofs/navigation/before
node scripts/capture-navigation-screenshots.mjs proofs/navigation/after
```

| Viewport | Antes | Depois |
|---|---|---|
| 390×844 | [bottom nav](before/mobile-390x844.png) | [bottom nav](after/mobile-390x844.png) |
| 1000×600 | [sidebar/rail](before/sidebar-1000x600.png) | [sidebar/rail](after/sidebar-1000x600.png) |

## Gate local

Os comandos obrigatórios foram executados após a reversão da rota de prova:

```text
npm ci && npm run build
npm run test:run
```

Ambos passaram; o resultado completo também consta no corpo do PR.
