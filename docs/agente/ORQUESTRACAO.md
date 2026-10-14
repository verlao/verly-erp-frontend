# Orquestração — redesenho Verly (ERP + app no celular) · 14/10/2026

Plano de implementação com agentes em paralelo, nos dois repos (`verlao/verly-erp-frontend` e
`verlao/verly-service`). Substitui a parte de execução do `AGENT_HANDOFF.md` e corrige o que mudou
depois de 06/10:

- **Framework7 saiu.** O app no celular é o próprio ERP (Vue 3 + Tailwind v4 + shadcn-vue + lucide),
  com casca mobile e PWA. Sem `apps/mobile/` separado (revoga D6), sem origem nova no CORS.
- **Contrato real** = `PLANO.md` §3 (descoberta de 06/10), não o design: `classification` é conta de
  despesa de saída; `bridge` cria lançamento PENDING sem pedido; `/measurement` é estado da visita.
- **Design** = canvas https://claude.ai/artifact/ABvjt9rb4JDmo8oeftiHqE. Toda tela de UI é
  implementada a partir do fluxo **redesenhado e aprovado** no canvas, nunca das telas F7 antigas.

---

## 1. Papéis

| Papel | Modelo | Quantos | Faz | Não faz |
|---|---|---|---|---|
| Orquestrador | Opus 5.5 (a sessão principal) | 1 | fatia, despacha, responde escalações, revisa todo PR contra contrato e design, mantém `DECISOES.md`/`LOG.md` | escrever o código das tarefas |
| Guia | Opus 5.5, sessão persistente (SendMessage) | 1 | segunda opinião do orquestrador em decisão difícil: migração que toca o bot, semântica de dinheiro, máquina de estados da conciliação | falar com os executores; decidir pelo dono |
| Executor pleno | Sonnet 5.5 | até 10 raias | lógica com teste, migração + endpoint, componentes e telas | decidir escopo ou produto |
| Executor júnior | Haiku 5.5 | até 10 raias | tarefa mecânica e bem especificada; revisão de texto e acessibilidade | qualquer escolha fora do cartão |

Cada raia é **um agente que leva vários cartões em sequência** (mantém o contexto do domínio).
Cada cartão roda em **worktree próprio** a partir de `origin/prod` (ou da branch de que depende).

### Escada de escalação

1. Executor encontra algo fora do cartão → **para** e devolve `ESCALAR:` com a pergunta, 2–3 opções e a
   recomendação dele. Não escolhe.
2. Orquestrador responde. Se for difícil (lista abaixo), consulta o Guia antes.
3. Se for decisão do dono (§9 do handoff, `PERGUNTAS.md`), o orquestrador aplica o padrão seguro, anota
   em `PERGUNTAS.md` e segue. Nunca trava a raia por isso.

**Escala obrigatoriamente:** mudar resposta ou status que o bot consome · qualquer migração · arredondamento
ou campo de dinheiro · transição de estado de Pix/lançamento · teste da linha de base falhando · diff
passando de ~500 linhas · texto de tela que não está no canvas · qualquer coisa em `WebSecurityConfig`.

**Vai ao Guia:** B2, B3, B4, B7 antes do PR; qualquer escalação sobre dinheiro ou estado do Pix.

## 2. Regras para todo agente (vão no prompt de cada um)

- Nunca merge, nunca deploy, nunca escrita em prod. PR contra `prod`, `GH_TOKEN=$(gh auth token -u matttoledo)`.
- Migração Flyway num PR, consumidor em outro depois. O service **faz deploy sozinho no merge**: PR de
  consumidor diz "depende de #N mergeado **e** no ar" (outage de 24/08).
- Só mudança aditiva em resposta existente; campo novo opcional.
- Front: UI que depende de backend não mergeado fica atrás de flag desligada (`lib/flags.ts`).
- Gates: ERP `npx vue-tsc -b && npm run test:run && npm run build`; service `mvn -B test` (Spotless roda no validate).
- Dados sintéticos em teste, fixture e print. Nada do canvas (tem nomes reais).
- Commit no estilo do repo (inglês, imperativo, ou `fix(escopo): …`). Descrição de PR no formato do handoff §6.
- No máximo 3 `mvn test` simultâneos na máquina (RAM do Mac).

## 3. Portões que dependem do Matheus

| Portão | O que destrava | Status |
|---|---|---|
| **G0** push + abrir PR em `verlao/*` | tudo | em 06/10 o auto mode negou commit/push; precisa liberar |
| **G1** aprovar a direção visual (frame `Direcao.dc.html`) | S7 e toda UI | pendente |
| **G2** aprovar o redesenho de cada fluxo no canvas | a UI daquele fluxo | Financeiro é o primeiro |
| **G3** merge + deploy das migrações (B3, B7) | consumidores B4, B8, B9 e as flags da UI | por PR |
| **G4** perguntas do dono (`PERGUNTAS.md` 1–10) | nada bloqueia; padrão seguro aplicado | aberto |

## 4. Cartões

Legenda: **S** = Sonnet, **H** = Haiku. `dep` = cartão de que a branch parte.

### Onda 0 — documentação (sem dependência)
| ID | Raia | Repo | Cartão | Aceite |
|---|---|---|---|---|
| D0 | H10 | ERP | PR só de docs com `docs/agente/` (PLANO, DECISOES, PERGUNTAS, LOG, este arquivo); D6 marcada como revogada | só `docs/` no diff |

### Onda 1 — fundamentos e backend aditivo (começa já; não depende de design)
| ID | Raia | Repo | Cartão | Aceite |
|---|---|---|---|---|
| B1 | S1 | service | entry point 401 para requisição sem token | teste de integração 401 sem token; vencido segue 401; bot intocado |
| F1 | S1 | ERP | interceptor desloga em 401 e em 403 com `exp` vencido; `lead.ts` (fetch cru) igual | teste unitário dos dois casos |
| B2 | S2 | service | `GlobalExceptionHandler`: sem stack trace no `message`, `errorId` no corpo e no log | status e chaves iguais; Guia revisa antes do PR |
| F2 | S2 | ERP | `lib/errors.ts` `friendlyError(err, fallback)` que nunca lê `message` | testes |
| B3 | S3 | service | migração `V2_51+` (conferir próximo livre em `origin/prod`): dispensa de comprovante ("não é pagamento") | reversível; Guia revisa |
| B7 | S4 | service | migração: `lead.snooze_until`, `lead.lost_reason`, tabela de instalação | reversível; Guia revisa |
| F5 | S5 | ERP | `lib/money.ts` (centavos, HALF_UP, `Intl` pt-BR) | 856,35 × 1,30 = R$ 1.113,26; 150×210 verde = R$ 1.240,20 |
| F7 | S6 | ERP | `lib/deferredAction.ts` (commit adiado ~5 s, desfazer, flush ao trocar de tela) | testes com timers falsos |
| F8 | S6 | ERP | `lib/sse.ts` (fetch + ReadableStream + JWT, reconexão, heartbeat 25 s), só com flag | testes |
| F4 | H1 | ERP | apagar `kit-cost.ts`, `product-cost.ts` e funções mortas de `glass-cost.ts`/`lead.ts` | `grep` sem importador colado no PR |
| F9 | H3 | ERP | `lib/flags.ts` (`VITE_FLAG_*`, desligadas por padrão) | testes |
| F11 | H4 | ERP | services tipados: `pix-reconciliation.ts`, parceiros (`identifiers`, `resolve`, `financials`), `leads/queues` | tipos batem com DTO do service; testes com mock |
| B6 | H5 | service | `orderId` opcional em `RecordExpenseDTO` (coluna já existe) | teste de integração com e sem `orderId` |
| H9 | H9 | ERP | fixtures sintéticas (clientes, Pix, custos) para teste e print | nenhum nome do canvas |

### Onda 2 — dependentes da onda 1
| ID | Raia | Repo | dep | Cartão |
|---|---|---|---|---|
| F3 | H2 | ERP | F2 | trocar os 28 `error.response?.data?.message \|\| …` por `friendlyError` |
| F6 | H6 | ERP | F5 | `useCurrency` passa a usar `money.ts` |
| B4 | S3 | service | B3 no ar | `POST /pix-reconciliation/{id}/dismiss` + `orderId` opcional no `bridge` |
| B8 | S4 | service | B7 no ar | adiar e perdido com motivo (endpoints) |
| B9 | S4 | service | B7 no ar | agenda de instalação (visita reaproveita `measurement_status`, D5) |
| B5 | S5 | service | — | `/products/calculate` com `glassValue` explícito (aditivo) |

### Onda 3 — design system e casca do celular (depois de G1)
| ID | Raia | Repo | Cartão |
|---|---|---|---|
| F10 | S7 | ERP | tokens de `ui/verly.css` no `@theme` do Tailwind; fontes; primitivos: Button (desabilitado com motivo), Chip, StatusPill, MoneyInput, Toast com Desfazer, desenho da peça com cota |
| F12 | S7 | ERP | casca mobile: barra inferior (Hoje · Clientes · Financeiro · Pedidos · Mais), cabeçalho, safe-area, transição de tela; desktop mantém o menu |

### Onda 4 — telas, um fluxo por vez (cada um depois do seu G2)
| Ordem | Fluxo | Raia | Cartões | Usa |
|---|---|---|---|---|
| 1 | Financeiro: resumo, Confirmar Pix, depois de confirmar | S8 | U1 ERP desktop · U2 celular | F7, F11, B4 (flag) |
| 2 | Parceiros e despesa | S10 | U3 parceiros · U4 despesa | B6, F11 |
| 3 | Hoje | S10 | U5 | F8 (flag), `/dashboard/*` |
| 4 | Clientes (fila) e jornada | S9 | U6 fila · U7 ficha/jornada · U8 medição por peça | B8, B9, D4 |
| 5 | Custos e "como fica o preço" | S5 | U9 | B5, F5 |
| — | Vitrine iPad | — | fora desta rodada (falta armazenar fotos) | — |

Em toda tela, H7 confere o texto contra o glossário do canvas (Clientes, Cobrar resposta, Funil, Confirmar
recebimento, Não é pagamento; nomes únicos das etapas) e H8 confere a acessibilidade (rótulo em todo
botão, 44 px, contraste 4,5:1, foco visível). Os dois **comentam**, não commitam.

## 5. Distribuição das raias

| Raia | Modelo | Cartões |
|---|---|---|
| S1 | Sonnet | B1, F1 |
| S2 | Sonnet | B2, F2 |
| S3 | Sonnet | B3, B4 |
| S4 | Sonnet | B7, B8, B9 |
| S5 | Sonnet | F5, B5, U9 |
| S6 | Sonnet | F7, F8 |
| S7 | Sonnet | F10, F12 |
| S8 | Sonnet | U1, U2 |
| S9 | Sonnet | U6, U7, U8 |
| S10 | Sonnet | U3, U4, U5 |
| H1–H6 | Haiku | F4, F3, F9, F11, B6, F6 |
| H7 | Haiku | revisão de texto em todo PR de UI |
| H8 | Haiku | revisão de acessibilidade em todo PR de UI |
| H9 | Haiku | fixtures sintéticas |
| H10 | Haiku | D0, `LOG.md` ao fim de cada onda |
| Guia | Opus | consultas do orquestrador |

Pico de paralelismo: onda 1, com 14 cartões em 13 raias.

## 6. Revisão do orquestrador (todo PR, antes de ir para o Matheus)

1. **Contrato:** diff lido no PR (não o relatório do agente); nada incompatível para o bot; migração antes do consumidor.
2. **Design:** print da tela com dados sintéticos lado a lado com o frame aprovado no canvas; divergência de
   comportamento → volta para a raia.
3. **Heurísticas da avaliação de 14/10:** T1 desabilitado com motivo · T2 sem "R$ 0,00" de placeholder ·
   T4 escolha visível · T5 nomes únicos das etapas · T7 sem jargão do sistema · e os achados do frame.
4. **Dinheiro:** teste de 1.113,26 passando; nenhum `toFixed` novo.
5. **Gates verdes, ≤ ~500 linhas, flag desligada quando depende de backend, descrição no formato §6.**

Reprovou → volta para a mesma raia com o achado em `arquivo:linha`. Na terceira volta, o orquestrador
consulta o Guia ou assume o cartão.

## 7. Riscos

| Risco | Mitigação |
|---|---|
| Consumidor mergeado antes da migração derruba o service | G3 explícito; PR consumidor diz "depende de #N no ar" |
| Agente ler texto ou dado real do canvas | prompts apontam só para os frames aprovados e para `H9` |
| Raia Haiku "decidir" fora do cartão | cartão fechado + `ESCALAR:` obrigatório; revisão do orquestrador |
| Muitos PRs para o Matheus revisar | onda 1 sai em lotes de até 5 PRs; LOG com a ordem de merge sugerida |
| Mac sem RAM com Maven em paralelo | no máximo 3 `mvn test` simultâneos |
| UI antes do redesenho | onda 4 só começa por fluxo, depois do G2 |
