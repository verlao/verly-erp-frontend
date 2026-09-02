# Evidências — higiene do contato do lead

As capturas usam `contact-mock-server.mjs`, com dois leads determinísticos:

- lead 1: JID `5521969478521@whatsapp.internal`, telefone igual ao JID, número
  órfão `564` e coordenadas;
- lead 2: e-mail real e endereço completo mockado (`Rua das Flores, 100`), além
  das coordenadas.

O segundo lead é intencionalmente mockado para provar que rua + número e o link
do mapa continuam visíveis e separados.

## Preparação

```sh
node evidencias/contact-mock-server.mjs
VITE_API_URL=http://127.0.0.1:8081/verly-service npm run dev -- --host 127.0.0.1 --port 5174
```

`contact-seed.html` instala apenas uma sessão local de evidência e seleciona o
lead indicado por `leadId`.

## Comandos das screenshots

Antes, sobre `prod` (`7c16694`):

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --virtual-time-budget=5000 --screenshot="evidencias/contact-before-synthetic-1600x1200.png" --window-size=1600,1200 "http://127.0.0.1:5174/evidencias/contact-seed.html?leadId=1"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --virtual-time-budget=5000 --screenshot="evidencias/contact-before-full-address-1600x1200.png" --window-size=1600,1200 "http://127.0.0.1:5174/evidencias/contact-seed.html?leadId=2"
```

Depois, sobre `fix/lead-contact-hygiene` (o Vite escolheu a porta 5176 porque a
5175 já estava ocupada):

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --virtual-time-budget=5000 --screenshot="evidencias/contact-after-synthetic-1600x1200.png" --window-size=1600,1200 "http://127.0.0.1:5176/evidencias/contact-seed.html?leadId=1"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-first-run --user-data-dir="/private/tmp/contact-proof-after-full" --virtual-time-budget=5000 --screenshot="evidencias/contact-after-full-address-1600x1200.png" --window-size=1600,1200 "http://127.0.0.1:5176/evidencias/contact-seed.html?leadId=2"
```

| Caso | Antes | Depois |
|---|---|---|
| JID sintético + número órfão | [PNG](contact-before-synthetic-1600x1200.png) | [PNG](contact-after-synthetic-1600x1200.png) |
| Endereço completo mockado | [PNG](contact-before-full-address-1600x1200.png) | [PNG](contact-after-full-address-1600x1200.png) |

## Resultado

- O JID continua no payload do mock, mas não aparece como e-mail no preview, no
  botão do rodapé nem na ação rápida da lista; os handlers também rejeitam a
  ação de e-mail sintético.
- A repetição visual do número desaparece junto com o falso e-mail.
- `564` não é apresentado como endereço. Como esse lead ainda tem coordenadas,
  resta o link útil `Ver no mapa`.
- Endereço completo continua como `Rua das Flores, 100`, com `Ver no mapa` na
  linha seguinte.
- A data é `createdDate`, agora rotulada como `Recebido em`.

## Gate local

```text
npm ci && npm run build  # passou
npm run test:run         # 12 arquivos, 122 testes passaram
```
