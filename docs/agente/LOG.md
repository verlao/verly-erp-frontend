# Log do agente

## 06/10/2026 — sessão 1: descoberta

- Li `AGENT_HANDOFF.md`, `HANDOFF-endpoints-2026-10-06.md`, `README.md` do design e o código de `prod` dos dois repos.
- Linha de base verde nos dois (PLANO §4).
- Achados que mudam o plano do design: `classification`/`bridge` não são "de quem/de qual pedido"; `/measurement`
  é estado da visita, não medida; token vencido já dá 401; SSE desligado por padrão; segredos no código do service.
- PR: este (só documentação).
- Próximo: fase 0, em ordem (0.1 sessão → 0.2 erros → 0.3 código morto → 0.4 utilitários).

## 14/10/2026 — retomada: fase 1, conciliação de Pix

- Handoff de 14/10 lido; foco retomado em B4a (dispensa) e B4b (vínculo a cliente/pedido).
- D10 registrada: service #98 fechado sem merge; backend fica como está. Proteção no front com
  `friendlyError`, sem ler `message`, inclusive em 400/409.
- D11 registrada: ERP #56 fechado sem merge; flags substituídas por sequência. PR de UI dependente só
  após endpoint mergeado e comprovadamente no ar; PR consumidor de migração só após migração no ar.
- Plano e orquestração alinhados à D9: mobile no próprio ERP/PWA, sem Framework7 nem `apps/mobile/`.
- Padrões registrados em `PERGUNTAS.md`: dispensados fora da fila padrão, listados por `state=DISMISSED`;
  erro 400/409 usa fallback da tela. G0 (push/PR) autorizado pelo handoff; nunca merge/deploy pelo agente.
- Última observação de deploy nesta retomada: pipeline do service `779aa30` ainda `in_progress`.
  V2_51/V2_52 mergeadas, mas implantação não comprovada; nenhum PR consumidor de endpoint novo aberto.
- Atualização da verificação: [run 38581918656](https://github.com/verlao/verly-service/actions/runs/38581918656)
  concluído com `success`, commit `779aa30b41128312be7a13e02cba77c173e83f45`. Às 14:47:47Z, o passo
  `Verify production deployment` confirmou task `healthy` e igualdade entre o digest esperado e o servido:
  `sha256:a515d162c8574e22697d55f76699dde383ed793648e40c288e8bfb2b054f52ac`.
  O único GET executado em produção, `/verly-service/actuator/health`, respondeu `{"status":"UP"}`.
  V2_51/V2_52 liberadas para os consumidores de backend; B4a iniciado após essa comprovação.
- A sessão usa os agentes disponíveis no Codex nos papéis de executor e guia; a ferramenta Workflow e os
  modelos Claude do roteiro não estão expostos aqui. O orquestrador também revisa os diffs integralmente.
- G1 (direção visual) e G2 (fluxo Financeiro redesenhado) ainda não aprovados; implementação de UI aguarda.
- Esta alteração contém só documentação; nenhum código de produção, teste ou dado real incluído.

### Entrega da retomada

| Cartão | PR contra prod | Head revisado | Suíte individual |
|---|---|---|---|
| B4a — dispensar/desfazer Pix | [service #104](https://github.com/verlao/verly-service/pull/104) | `d2d06fa` | 614 testes |
| B4b — vínculo do bridge com pedido/cliente | [service #105](https://github.com/verlao/verly-service/pull/105) | `6e990b5` | 622 testes; 33 focados após organização |
| B8 — adiamento/perdido com motivo | [service #106](https://github.com/verlao/verly-service/pull/106) | `6fcdc1a` | 614 testes |
| B9 — agenda de instalação | [service #107](https://github.com/verlao/verly-service/pull/107) | `e88fa7d` | 615 testes |
| Documentação — decisões, sequência e contratos | [ERP #67](https://github.com/verlao/verly-erp-frontend/pull/67) | branch `docs/redesign-sequencing-decisions` | revisão e `git diff --check` |

- Suítes acima sem falhas, erros ou testes ignorados; PostgreSQL 16 real com Flyway via Testcontainers.
  O Docker exigiu execução fora do sandbox; as falhas iniciais de acesso ao socket não foram tratadas
  como aprovação do gate nem contornadas com configuração de teste.
- Resultado combinado de B4a/B4b: 626 testes verdes. Resultado dos quatro cartões juntos: **635 testes,
  99 relatórios, zero falhas/erros/ignorados**, `mvn -B -q test` concluído com exit 0.
  Snapshot local `5a43832`, worktree `wt/orq/PIX-INTEGRATION`, sem publicação dessa branch de validação.
  Os quatro PRs continuam separados contra `prod`; B4a/B4b foram organizados para integração sem conflito.
- Guia e orquestrador revisaram os diffs. B9 tem exceção aprovada ao alvo de ~500 linhas: 528 linhas,
  oito arquivos novos, com controller/service/DTO separados e testes HTTP/FKs no mesmo PR do código.
- O primeiro CI de #107 detectou diferença de precisão: Java/Linux forneceu nanossegundos, e Postgres
  arredondou para microssegundos. Corrigido no mesmo PR (`e88fa7d`): flush/clear antes de capturar a data
  inicial, comparando valores persistidos antes/depois sem mudar código de produção ou afrouxar a asserção.
  Cinco testes focados e os 635 combinados passaram novamente; nova execução CI
  [38590305826](https://github.com/verlao/verly-service/actions/runs/38590305826) concluiu com `success`
  no head `e88fa7dd6c56513b66b324e56520b6dd2e483988`. CI de #104, #105 e #106 também verde.
- D12–D14 registram os padrões de implementação. Transferência entre contas próprias exige definição
  em U0: o bridge atual de entrada credita receita de vendas (PERGUNTAS nº 14).
- G1/G2 continuam pendentes. Nenhum PR de UI iniciado. Próximo: revisão/merge pelo Matheus, comprovar o
  commit realmente servindo antes de consumidores; G1 → U0 → G2, F10 e depois U1/F12/U2 conforme o handoff.
- Nenhum merge, deploy ou escrita em produção; checkouts principais e mudança staged do Matheus preservados.
