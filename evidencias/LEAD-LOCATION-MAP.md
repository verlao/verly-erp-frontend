# Evidências — mapa da localização do lead

As capturas usam `contact-mock-server.mjs`, com o mesmo lead determinístico nos
dois estados. O "antes" foi servido por um worktree detached de `prod`
(`e7ce80e`); o "depois", por `feat/lead-location-map`.

O script de captura abre Chrome headless com viewport CSS fixo, expande o
accordion antigo quando ele existe e centraliza o bloco de localização. Em
desktop, ele isola visualmente o `LeadPreview` e oculta seu rodapé somente na
captura, para que o bloco caiba em 1000×600 sem alterar a aplicação.

## Preparação

```sh
node evidencias/contact-mock-server.mjs
VITE_API_URL=http://127.0.0.1:8081/verly-service npm run dev -- --host 127.0.0.1 --port 5174
VITE_API_URL=http://127.0.0.1:8081/verly-service npm run dev -- --host 127.0.0.1 --port 5175 # worktree prod
```

## Comandos das capturas

```sh
node evidencias/capture-location.mjs evidencias/location-before-390x844.png 390x844 "http://127.0.0.1:5175/evidencias/contact-seed.html?leadId=1"
node evidencias/capture-location.mjs evidencias/location-after-390x844.png 390x844 "http://127.0.0.1:5174/evidencias/contact-seed.html?leadId=1"
node evidencias/capture-location.mjs evidencias/location-before-1000x600.png 1000x600 "http://127.0.0.1:5175/evidencias/contact-seed.html?leadId=1"
node evidencias/capture-location.mjs evidencias/location-after-1000x600.png 1000x600 "http://127.0.0.1:5174/evidencias/contact-seed.html?leadId=1"
```

| Viewport | Antes | Depois |
|---|---|---|
| 390×844 | [PNG](location-before-390x844.png) | [PNG](location-after-390x844.png) |
| 1000×600 | [PNG](location-before-1000x600.png) | [PNG](location-after-1000x600.png) |

O accordion com latitude/longitude cruas deixa de existir. Em seu lugar, o
iframe OSM mostra o pin e, abaixo, os dados que a API sustenta hoje: nome do
lead, `createdDate` e origem da captura. O link externo "Ver no mapa" continua
visível e seu `href` do Google Maps é coberto pelo teste de componente.

## OSM inacessível

```sh
node evidencias/capture-location.mjs evidencias/location-osm-offline-1000x600.png 1000x600 "http://127.0.0.1:5174/evidencias/contact-seed.html?leadId=1" offline-map
```

[Captura com OSM inacessível](location-osm-offline-1000x600.png)

Nesse modo, o Chrome resolve apenas `www.openstreetmap.org` para loopback. A
captura mostra a falha confinada à área do iframe, enquanto cabeçalho, resumo,
contato, data e o link externo continuam renderizados. Em produção o iframe
também usa `loading="lazy"` e o texto de fallback orienta a usar "Ver no mapa".

## Chaves e dependências

```sh
rg "AIza|apiKey|access_token|VITE_.*MAP" src package.json package-lock.json
```

Resultado: nenhuma ocorrência. Não foi adicionada dependência, conta, chave de
API ou billing; o embed usa somente
`https://www.openstreetmap.org/export/embed.html`.

## Limite conhecido do dado

A API não relaciona a coordenada a uma mensagem do transcript. Por isso este PR
não inventa assunto, trecho de conversa ou contexto. Exibe somente remetente do
lead, horário disponível (`createdDate`) e mecanismo de captura. Contexto
conversacional exige o backend gravar `receivedAt` e a mensagem/índice que
originou a localização.

## Gate local

```text
npm ci && npm run build  # passou
npm run test:run         # 16 arquivos, 142 testes passaram
```
