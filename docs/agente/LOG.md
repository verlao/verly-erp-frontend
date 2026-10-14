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
