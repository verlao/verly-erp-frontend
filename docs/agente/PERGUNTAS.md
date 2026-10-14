# Perguntas ao dono

Cada uma com o padrão seguro já aplicado. Nada aqui bloqueia o trabalho.

1. **`POST /products` público** (`WebSecurityConfig.java:55-59`): qualquer pessoa cria produto sem login.
   Era para a LP? *Padrão:* não mexi. *Risco:* produto falso no catálogo, preço errado em orçamento.
2. **Segredos no código do `verly-service`:** a semente do JWT está em `constant/Constants.java:5` e há um token
   de bot do Telegram como valor padrão em `application.yml:138`. *Padrão:* não mexi nem copiei os valores.
   *Risco:* quem lê o repo forja JWT de qualquer usuário. Sugestão: mover para variável de ambiente e rotacionar
   (exige deploy coordenado; todo mundo é deslogado uma vez).
3. **Juntar Leads e Clientes no menu do ERP?** *Padrão:* menu do ERP intacto; no app, aba "Clientes" com filtro
   "novos contatos / clientes".
4. **Incolor fora do catálogo (R$ 129) mais barato que no catálogo (R$ 149).** *Padrão:* dados intactos; a revisão
   de custos mostra o alerta.
5. **Taxa do cartão:** o backend já aplica `preço ÷ (1 − taxa)` só nas opções de pagamento, não no preço à vista.
   Está certo assim? *Padrão:* replico essa regra, nada novo.
6. **Sinal padrão (50%), motivos de perda e opções de adiar.** *Padrão:* valores do design, configuráveis.
7. **Quem faz a visita técnica?** *Padrão:* campo "responsável" opcional, padrão o usuário logado.
8. **"Não é pagamento" num Pix ainda não lançado:** endpoint aditivo de dispensa pendente (B4a), após V2_51
   comprovadamente no ar. *Padrão:* PR de UI só após endpoint mergeado e comprovadamente no ar (D11).
9. **Ligar o tempo real (`EVENTS_ENABLED`)?** O SSE está desligado por padrão no backend. *Padrão:* atualiza ao
   abrir a tela; consumidor SSE só após confirmação de disponibilidade no ambiente, sem flag de build (D11).
10. **R$ 267,00 do kit da porta 2 folhas:** não deu para confirmar sem acesso de leitura ao backend. *Padrão:* a tela
    de custos mostra o que `/api/accessory-costs` devolver, sem valor fixo.
11. **Dispensado é um estado novo ou filtro?** *Padrão aplicado:* filtro; a leitura padrão exclui dispensados,
    e `state=DISMISSED` lista esses comprovantes. Já lançado exige `cancel` do lançamento; dispensa retorna 409.
12. **Mostrar texto de regra de negócio do backend em 400/409?** *Padrão aplicado:* não; `friendlyError` usa o
    fallback da tela e nunca lê `message` (D10).
