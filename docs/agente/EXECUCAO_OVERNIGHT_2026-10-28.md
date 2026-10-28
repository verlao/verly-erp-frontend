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
| C01-S | contrato escrito; Guia revisando | G2-INTEGRATED `CONTRATO_HITL_BACKEND_2026-10-28.md` | — | — | — |
| F01 | em correção (rodada 1) | HITL-F01 `feat/hitl-f01-context-navigation` | `97a0e27` | 322 testes ok | — |
| F02 | a disparar | | | | |
| F03a/F03b | a disparar | | | | |
| F04 | a disparar | | | | |
| S01/S02/M01/S05 | aguardam Guia | | | | |
| S03/S04 | PREPARADO (dependem de M01 no ar) | | | | |
| S07 | PREPARADO se sobrar tempo | | | | |
| M02/S06 | M02 dispensada nesta fase (contrato §8); S06 não iniciado | | | | |
| B01/B02 | não tocados (dependem de S06 no ar) | | | | |

## Ferramentas

- Harness antes/depois: `~/Documents/repositories/verly/hitl-overnight-2026-10-28/harness/` (Vite com API em host inalcançável,
  Playwright `page.route` com fixtures sintéticas, aborta qualquer host externo). Antes de prod: `hitl-overnight-2026-10-28/BASE/`.
- Maven: `/private/tmp/verly-mvn-slot.sh <wt> <log>` (≤3 simultâneos; renomeia V2_54 de fotos → V2_55 só no working tree).
