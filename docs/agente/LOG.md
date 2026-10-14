# Log do agente

## 06/10/2026 — sessão 1: descoberta

- Li `AGENT_HANDOFF.md`, `HANDOFF-endpoints-2026-10-06.md`, `README.md` do design e o código de `prod` dos dois repos.
- Linha de base verde nos dois (PLANO §4).
- Achados que mudam o plano do design: `classification`/`bridge` não são "de quem/de qual pedido"; `/measurement`
  é estado da visita, não medida; token vencido já dá 401; SSE desligado por padrão; segredos no código do service.
- PR: este (só documentação).
- Próximo: fase 0, em ordem (0.1 sessão → 0.2 erros → 0.3 código morto → 0.4 utilitários).
