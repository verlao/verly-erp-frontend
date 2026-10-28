# Execução overnight HITL — 28→29/10/2026

Orquestrador: Claude Opus 5.5 (sessão noturna, sem humano). Prompt: `PROMPT_OVERNIGHT_HITL_2026-10-28.md` (G2_APROVADO=SIM).
Checkpoint vivo: atualizado a cada cartão. Nenhum merge/deploy/escrita em produção pelo agente.

## N0 — preflight (00:42–01:20)

| Item | Estado |
|---|---|
| ERP `origin/prod` | `c7b4e968549fc25ce5c976a984441506d078d7f4` — Pages run 38779758575 success; nenhum PR aberto |
| Service `origin/prod` | `1dbd0039b693d9976303af435074eb001ac7dab7` — **CI VERMELHO** (run 40162648807): dois `V2_54` (#112 stage_jobs + #113 portfolio_photos) → "Found more than one migration with version 2.54"; imagem/deploy pulados |
| Service servindo | **`b65f56a`** (#112) — run 40162613381, deploy prod success 25/10 04:43:35Z. #113 nunca foi ao ar |
| Runner `orangepi-backend` | online, idle (00:50) |
| Bot `origin/dev` | `7cf350caa5b0329d21814e713ee84291dd298ec7` — não tocado |
| PRs abertos | service #97 (outra frente); bot #95/#102/#104/#105 (outras frentes). Não tocados |
| Prévia P01–P03 | commit local `7998d6e` em `prototype/financeiro-integrated-g2` (vue-tsc/build/diff-check ok). Sem push |
| Máquina | bateria 59% descarregando (~4h) às 00:42 — risco de a noite parar antes das 07:00 |

## Cartões

| Cartão | Estado | Worktree / branch | Head | Gates | PR |
|---|---|---|---|---|---|
| C01-S | **concluído** (contrato revisado) | G2-INTEGRATED `CONTRATO_HITL_BACKEND_2026-10-28.md` | `2286f44` | revisão adversarial do Guia | — |
| S01 | **concluído** (draft) | HITL-S01 `feat/hitl-s01-lead-review-context` | `ec7f7d9` | 691 testes / 106 classes | service **#120** |
| F01 | **concluído com lacuna** (draft) | HITL-F01 `feat/hitl-f01-context-navigation` | `bf819bd` | 310 testes / 41 arquivos + build + diff-check | ERP **#74** |
| S02–S07 | não iniciados (corte de escopo) | — | — | — | — |
| M01/M02 | não iniciados (corte de escopo) | — | — | — | — |
| F02–F07 | não iniciados (corte de escopo) | — | — | — | — |
| B01/B02 | não iniciados (corte de escopo) | — | — | — | — |

## C01-S — contrato do backend HITL (checkpoint 01:4x)

- Contrato escrito e revisado por oráculo independente (`gpt-6.1-sol`), que devolveu **NAO_APTO** com 9 achados (G01–G09).
- Todos os achados foram endereçados no próprio contrato (§10), com padrões conservadores onde havia decisão de produto em aberto.
- **G01 confirmado por inspeção própria:** `whatsapp_bot.v_address_consolidated` **não existe**; a fonte real é `whatsapp_bot.addresses`. O contrato foi corrigido para a tabela real.
- **G05 fica como dívida explícita** (não há endpoint humano que grave `extraction_confirmed_at`); registrada em `PERGUNTAS.md` nº16.
- Veredito final: **APTO_COM_RESSALVA**.
- Nenhum código de produção foi escrito neste cartão.

## S01 — `GET /leads/{id}/review-context` (checkpoint 02:0x)

- Branch `feat/hitl-s01-lead-review-context`, 2 commits, 7 arquivos (controller, DTO, service, SQL, token, 2 testes).
- Gates locais: `spotless:apply` + `mvn -B -q test` → **691 testes, 0 falhas, 106 classes**.
- Payload de evidência capturado em teste (`/private/tmp/verly-S01-evidence.log`): `address.source=MIXED`, `leadCustomerLink=UNAVAILABLE`, `reviewToken` determinístico.
- Correções aplicadas após revisão adversarial: `detected` obrigatório; `availability` de signals cobre payment/closed/objection; `at` limitado a 64; truncamento seguro de surrogate; token normaliza datas a segundos; `SELECT_CONTACT` com `ORDER BY updated_at`; handler de erro próprio (`INVALID_LEAD_ID` 400 / `INTERNAL` 500) sem tocar o `GlobalExceptionHandler`.
- **PR #120 publicado como draft** contra `prod`. CI `Run Tests` vermelho por ambiente: `Could not find a valid Docker environment` (Testcontainers) — 244 erros em cascata, nenhum teste de negócio executado. Somado a isso, `prod` segue com dois `V2_54`.
- **Não promovido a ready**: só depois de `prod` voltar a ter CI verde.

## F01 — contexto entre telas do ERP (checkpoint 02:1x)

- Branch `feat/hitl-f01-context-navigation`, head `bf819bd`, **432 inserções / 8 arquivos** (produção ~240 linhas).
- Entrega: `?customerId=` abre o cliente por ID e mantém no reload; "Ver pedidos" leva a `/orders?customerId=`; pedidos filtram **no servidor** (`GET /orders/customer/{id}`) com chip e limpeza; rota de revisão do lead construída por helper validado.
- Bug latente corrigido: `/orders` devolve `List` puro; a tela agora aceita lista e `Page`, paginando a lista no cliente.
- Correções da rodada 1 de review: corrida entre cargas (token de requisição), erro de filtro não é sobrescrito por lista vazia, fechar modal remove só o parâmetro, `text-destructive`.
- **Corte de escopo feito em revisão própria:** `leadReview.ts` (185 linhas) não tinha consumidor — pertence ao cartão da tela de revisão (F02). Removido junto com os campos de DTO que só ele usava, para não publicar código morto.
- Gates: `vue-tsc -b`, **310 testes / 41 arquivos**, `vite build`, `git diff --check`.
- Evidências antes/depois (393 e 1440) em `hitl-overnight-2026-10-28/F01/`, publicadas na branch órfã `pr-assets`; todas as capturas com `errors=0`, `external=0`, `overflow=false`.
- **PR #74 publicado como draft** contra `prod`. Lacuna declarada: **parceiro → financeiro** não é implementável hoje (ver `PERGUNTAS.md` nº18).
- `gh pr checks` do ERP: nenhum workflow roda em PR (todos são `push` para `dev`/`main`/`prod`), então não há CI a esperar.

## Corte de escopo (declarado, não silencioso)

A noite foi limitada a **C01-S → S01 → F01**. S02–S07, M01/M02, F02–F07 e B01/B02 **não foram iniciados**; continuam no contrato e no prompt, sem trabalho parcial em worktree.


## Ferramentas

- Harness antes/depois: `~/Documents/repositories/verly/hitl-overnight-2026-10-28/harness/` (Vite com API em host inalcançável,
  Playwright `page.route` com fixtures sintéticas, aborta qualquer host externo). Antes de prod: `hitl-overnight-2026-10-28/BASE/`.
- Maven: `/private/tmp/verly-mvn-slot.sh <wt> <log>` (≤3 simultâneos; renomeia V2_54 de fotos → V2_55 só no working tree).

## Para o Matheus mergear, nesta ordem

1. **Nada nesta noite.** Os dois PRs estão em **draft** de propósito: o service está com CI vermelho por ambiente e o ERP tem lacuna de aceite declarada.
2. Quando `prod` do service estiver verde: **verly-service#120** — `GET /leads/{id}/review-context` (read-only, 691 testes locais, 1 endpoint + DTO/serviço/SQL; risco baixo, sem migração). Depois de ready e CI verde, o merge em `prod` dispara deploy — decisão do Matheus.
3. **verly-erp-frontend#74** — navegação de contexto (432 linhas, 310 testes, sem dependência de backend novo). Pode ir a ready assim que o Matheus aceitar a lacuna "parceiro → financeiro" (não implementável sem contrato).

## Preparados aguardando merge/deploy

| Cartão | Precisa de | Comando para publicar |
|---|---|---|
| S01 | `prod` do service com CI verde (dois `V2_54` resolvidos pela frente de fotos) | `gh pr ready 120 --repo verlao/verly-service` |
| F01 | decisão sobre a lacuna parceiro→financeiro (não bloqueia o resto) | `gh pr ready 74 --repo verlao/verly-erp-frontend` |
| S02–S07, M01/M02, F02–F07, B01/B02 | não iniciados por corte de escopo | — |

## Decisões tomadas sozinho (com reversão)

- **D-S01-1:** handler de erro próprio (`LeadReviewContextExceptionHandler`) em vez de editar o `GlobalExceptionHandler`. Reverter = apagar a classe e registrar os dois `@ExceptionHandler` no handler global (afeta outras rotas).
- **D-S01-2:** `reviewToken` normaliza datas para segundos e ordena blocos, para ser estável entre chamadas. Reverter = voltar a hashear o JSON cru (token muda a cada milissegundo e nunca casa).
- **D-F01-1:** `/orders` pode vir como lista pura ou `Page`; a tela pagina no cliente no primeiro caso. Reverter = assumir `Page` e voltar ao bug de lista vazia.
- **D-F01-2:** `leadReview.ts` removido do F01 (sem consumidor até F02). Reverter = `git show 97a0e27 -- src/lib/leadReview.ts`.
- **D-F01-3:** fechar modal aberto por `?customerId=` remove só esse parâmetro. Reverter = deixar a URL como está.

## Estado no fim da noite

| Item | Início | Fim |
|---|---|---|
| Runner `orangepi-backend` | online/idle | online/idle (nenhum job disparado por nós) |
| `verly-service` `prod` | `1dbd003` (CI vermelho, serve `b65f56a`) | `1dbd003` — intocado |
| `verly-erp-frontend` `prod` | `c7b4e96` | `c7b4e96` — intocado |
| PRs novos | — | service #120 (draft), ERP #74 (draft) |
| Branch de assets | — | `pr-assets` no ERP (só PNGs, nunca merge) |

## O que falhou ou foi interrompido

- **CI do service:** `Run Tests` falhou com `Could not find a valid Docker environment` (Testcontainers) no runner `ubuntu-latest`; 244 erros em cascata. Não é o diff do S01 — nenhum teste de negócio chegou a rodar. Somado ao `prod` quebrado (dois `V2_54`), não há como provar CI verde hoje.
- **Revisão adversarial do F01, rodada 2:** `opus` indisponível por cota até 02:20; `gpt-6.1-sol` devolveu 4 FALSO_POSITIVO e 3 INCONCLUSIVO por falta de contexto no prompt (não por defeito). Os três INCONCLUSIVO foram conferidos por inspeção própria no repo (`withoutContextKey` copia a query; template condiciona vazio a `!filterError`; `variantGroups` não tinha consumidor — daí a remoção do lib).
- **Lacuna de aceite do F01:** parceiro → financeiro sem contrato; declarada, não simulada.
- **Escopo:** a noite cobriu 3 dos 15+ cartões do mapa; o restante não foi iniciado (registrado acima).
