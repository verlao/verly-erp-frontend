# CI/CD Pipeline - Verly ERP Frontend

Este documento descreve o pipeline de CI/CD implementado para o projeto **Verly ERP Frontend**, uma aplicação Vue.js com TypeScript.

## 📋 Visão Geral

O pipeline automatiza:
- ✅ Build da aplicação Vue.js
- ✅ Criação de imagens Docker
- ✅ Deploy automático para diferentes ambientes
- ✅ Deploy para GitHub Pages
- ✅ Publicação no GitHub Container Registry

## 🔄 Estrutura dos Workflows

### 1. **CI/CD Principal** (`.github/workflows/ci-cd.yml`)

**Triggers:**
- Push para branches: `main`, `develop`, `prod`
- Pull requests para: `main`, `prod`
- Execução manual via `workflow_dispatch`

**Jobs:**
1. **Build Application** - Compila a aplicação Vue.js
2. **Build Docker Image** - Cria e publica imagem Docker
3. **Deploy Staging** - Deploy automático para ambiente de staging
4. **Deploy Production** - Deploy automático para ambiente de produção
5. **GitHub Pages** - Deploy para GitHub Pages

### 2. **GitHub Pages** (`.github/workflows/github-pages.yml`)
- Deploy específico para GitHub Pages
- Ativado apenas na branch `main`

## 🚀 Como Usar

### Deploy Automático

O deploy é acionado automaticamente:

- **Staging:** Push para branch `develop`
- **Produção:** Push para branches `main` ou `prod`
- **GitHub Pages:** Push para branch `main`

### Deploy Manual

```bash
# Via GitHub Actions
gh workflow run ci-cd.yml

# Via Docker local
docker-compose up --build
```

## 🐳 Imagens Docker

As seguintes imagens são geradas automaticamente:

- `ghcr.io/seu-usuario/verly-erp-frontend:staging`
- `ghcr.io/seu-usuario/verly-erp-frontend:latest`
- `ghcr.io/seu-usuario/verly-erp-frontend:production`
- `ghcr.io/seu-usuario/verly-erp-frontend:main-sha`

## ⚙️ Configuração de Ambiente

### Variáveis de Ambiente

Crie os seguintes arquivos:

```bash
# .env.production
VITE_API_URL=https://api.verlyvidracaria.com
VITE_APP_ENV=production

# .env.staging  
VITE_API_URL=https://staging-api.verlyvidracaria.com
VITE_APP_ENV=staging
```

### Secrets do GitHub

Configure os seguintes secrets no repositório:

- `GITHUB_TOKEN` - Token para publicar imagens (automático)

### Environments

Configure os environments no GitHub:

1. **staging**
   - URL: `https://staging.painel.verlyvidracaria.com`
   - Protection rules: Nenhuma

2. **production**
   - URL: `https://painel.verlyvidracaria.com`
   - Protection rules: Require reviewers

3. **github-pages**
   - URL: Gerada automaticamente
   - Source: GitHub Actions

## 🔒 Segurança

### Práticas Implementadas

- ✅ Imagens Docker multi-stage para reduzir tamanho
- ✅ Usuário não-root nos containers
- ✅ Health checks nos containers
- ✅ Dependências atualizadas automaticamente
- ✅ Secrets gerenciados pelo GitHub

### Nginx Security Headers

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## 📊 Monitoramento

### Health Checks

- **Docker:** `curl -f http://localhost/`
- **Intervalo:** 30 segundos
- **Timeout:** 3 segundos
- **Retries:** 3 tentativas

### Logs

```bash
# Logs do container
docker logs verly-erp-frontend

# Logs do nginx
docker exec verly-erp-frontend tail -f /var/log/nginx/access.log
```

## 🛠️ Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- Docker & Docker Compose
- Git

### Setup

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/verly-erp-frontend.git
cd verly-erp-frontend

# Instale dependências
npm install

# Execute em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Execute com Docker
docker-compose up --build
```

### Estrutura do Projeto

```
verly-erp-frontend/
├── .github/workflows/     # GitHub Actions
├── src/                   # Código fonte Vue.js
├── public/               # Assets públicos
├── dist/                 # Build de produção
├── Dockerfile            # Configuração Docker
├── docker-compose.yml    # Orquestração local
├── nginx.conf           # Configuração Nginx
└── package.json         # Dependências Node.js
```

## 🔧 Troubleshooting

### Problemas Comuns

**Build falha:**
```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Docker não inicia:**
```bash
# Verifique logs
docker logs verly-erp-frontend

# Reconstrua imagem
docker-compose up --build --force-recreate
```

**Deploy falha:**
- Verifique se os secrets estão configurados
- Confirme se os environments existem
- Verifique logs do GitHub Actions

### Comandos Úteis

```bash
# Verificar status do workflow
gh run list --workflow=ci-cd.yml

# Ver logs do último run
gh run view --log

# Executar workflow manualmente
gh workflow run ci-cd.yml
```

## 🚀 Próximos Passos

1. **Configurar servidor de produção**
   - Configurar domínio e SSL
   - Instalar Docker no servidor
   - Configurar reverse proxy

2. **Implementar testes**
   - Testes unitários com Vitest
   - Testes E2E com Playwright
   - Coverage reports

3. **Melhorar monitoramento**
   - Integrar com Sentry
   - Configurar alertas
   - Métricas de performance

4. **Otimizações**
   - Code splitting
   - Lazy loading
   - PWA features

## 📚 Recursos Adicionais

- [Vue.js Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Última atualização:** $(date +%Y-%m-%d)  
**Versão:** 1.0.0