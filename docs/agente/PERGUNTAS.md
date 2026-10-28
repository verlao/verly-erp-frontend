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
13. **Cancelar ou apagar instalação da agenda?** *Padrão aplicado:* cancelar e preservar histórico;
    correção por PUT pode reagendar. Cancelados continuam consultáveis com filtro por status (D14).
14. **Como registrar "É meu dinheiro (transferência entre minhas contas)"?** O bridge atual de uma entrada
    cria PAYMENT com crédito em receita de vendas; `customerId`/`orderId` opcionais não mudam essa matriz.
    *Padrão seguro:* não confirmar transferência própria por esse caminho como receita. Definir o tratamento
    no redesenho U0 antes de implementar essa opção; dispensa de comprovante não equivale a registrar
    transferência contábil. Isso não bloqueia B4a/B4b para recebimentos de clientes.

15. **Mascarar `payerDoc` na resposta de evidência do Pix (S02)?** O contrato C01-S manda devolver CPF com só os 6
    dígitos centrais e CNPJ só a raiz de 8. *Padrão aplicado:* mascarar no servidor; a tela nunca precisa do documento
    completo para conferir. *Risco:* se o Matheus quiser o número completo para bater com o comprovante, é uma linha
    a reverter. S02 não foi iniciado nesta noite (corte de escopo).
16. **Quem valida `reviewToken` na confirmação de extração?** Não existe endpoint humano que grave
    `extraction_confirmed_at`; quem grava hoje é a síntese do bot. S01 (read-only) expõe o token; S04 valida nas
    escritas de vínculo. *Padrão aplicado:* a validação na confirmação de extração fica para o cartão que criar essa
    escrita (B02/S06). *Risco:* até lá, uma extração pode mudar entre a revisão e a confirmação vinda do bot sem 409 —
    o token não protege esse caminho ainda. Registrado, não escondido.
17. **`POST /products` público, segredos JWT/Telegram, menu Leads×Clientes** (nº1–3) continuam abertos e intocados;
    a frente HITL não os toca nesta noite.
