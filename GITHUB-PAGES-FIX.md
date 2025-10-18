# 🔧 GUIA DE CORREÇÃO: GitHub Pages Environment Protection

**Problema Identificado:** Branch `prod` não tem permissão para fazer deploy no environment `github-pages`

**Erro Atual:**
```
Branch 'prod' is not allowed to deploy to github-pages due to environment protection rules.
```

---

## 📋 SOLUÇÃO PASSO-A-PASSO

### Opção 1: Adicionar Branch `prod` aos Deployment Branches (✅ RECOMENDADO)

Esta é a solução mais segura e mantém as protection rules ativas.

#### Passo 1: Acessar Environment Settings

1. Acesse o repositório no GitHub:
   ```
   https://github.com/verlao/verly-erp-frontend
   ```

2. Clique em **Settings** (no menu superior do repositório)

3. No menu lateral esquerdo, clique em **Environments**

4. Você verá uma lista de environments. Clique em **`github-pages`**

#### Passo 2: Configurar Deployment Branches

1. Na seção **"Deployment branches and tags"**, você verá atualmente algo como:
   - ✅ Selected branches and tags
   - Lista de branches permitidas (provavelmente só `main`)

2. Clique no botão **"Add deployment branch or tag rule"**

3. No campo que aparecer:
   - **Type:** Branch
   - **Name pattern:** `prod`

4. Clique em **"Add rule"**

5. Agora você deve ver duas regras:
   ```
   ✅ main
   ✅ prod
   ```

#### Passo 3: Salvar e Testar

1. As mudanças são salvas automaticamente

2. Faça um novo push para a branch `prod` para testar:
   ```bash
   cd /home/matt/verly-admin-erp
   git checkout prod
   echo "# Test GitHub Pages" >> README.md
   git add README.md
   git commit -m "test: verificar deploy após configurar environment"
   git push origin prod
   ```

3. Verifique o workflow em:
   ```
   https://github.com/verlao/verly-erp-frontend/actions
   ```

---

### Opção 2: Permitir Todas as Branches (⚠️ MENOS SEGURO)

Se você quiser permitir qualquer branch fazer deploy:

#### Passos:

1. Acesse: `Settings → Environments → github-pages`

2. Na seção **"Deployment branches and tags"**:
   - Selecione: **"All branches"**
   - Isso permite que QUALQUER branch faça deploy

3. **Atenção:** Isso é menos seguro porque qualquer branch poderá fazer deploy para produção

---

### Opção 3: Remover Protection Rules (❌ NÃO RECOMENDADO)

**Só faça isso se realmente não precisar de nenhuma proteção.**

#### Passos:

1. Acesse: `Settings → Environments → github-pages`

2. Role até o final da página

3. Clique em **"Delete environment"**

4. Confirme a exclusão

5. O GitHub Pages continuará funcionando, mas sem protection rules

**Nota:** Você perderá qualquer proteção e aprovações configuradas.

---

## 🎯 VERIFICAÇÃO APÓS CONFIGURAÇÃO

### 1. Verificar Settings

Confirme que a branch `prod` está listada em:
```
Settings → Environments → github-pages → Deployment branches
```

Deve aparecer:
```
✅ prod
```

### 2. Testar o Deploy

Faça um push para a branch `prod`:

```bash
cd /home/matt/verly-admin-erp
git checkout prod

# Fazer uma pequena mudança
echo "# Deploy Test $(date)" >> README.md
git add README.md
git commit -m "test: verificar deploy automático"
git push origin prod
```

### 3. Monitorar o Workflow

Acesse:
```
https://github.com/verlao/verly-erp-frontend/actions
```

Você deve ver:
- ✅ Workflow "Deploy to GitHub Pages" **rodando** ou **completado**
- Status: ✅ Success (verde)
- Tempo estimado: 2-5 minutos

### 4. Verificar o Site Publicado

Após o workflow completar com sucesso, acesse:

**URL Padrão:**
```
https://verlao.github.io/verly-erp-frontend/
```

**URL Customizada (se configurado CNAME):**
```
https://painel.verlyvidracaria.com
```

---

## 🔍 TROUBLESHOOTING

### Erro: "Environment not found"

**Causa:** O environment `github-pages` não existe no repositório

**Solução:**
1. Acesse: `Settings → Environments`
2. Clique em **"New environment"**
3. Nome: `github-pages`
4. Clique em **"Configure environment"**
5. Em **"Deployment branches"**, adicione: `prod`

---

### Erro: "You don't have permission to access environments"

**Causa:** Você não tem permissões de admin no repositório

**Solução:**
1. Peça ao dono do repositório para:
   - Adicionar você como admin, OU
   - Configurar o environment seguindo este guia

---

### Workflow Continua Falhando

**Passos de diagnóstico:**

1. **Verificar logs completos:**
   ```
   https://github.com/verlao/verly-erp-frontend/actions
   ```
   - Clique no workflow que falhou
   - Clique em cada step para ver logs detalhados

2. **Verificar se GitHub Pages está habilitado:**
   - `Settings → Pages`
   - **Source:** GitHub Actions (deve estar selecionado)
   - **Branch:** Não precisa selecionar (Actions gerencia)

3. **Verificar permissões do workflow:**
   - `Settings → Actions → General`
   - **Workflow permissions:** Read and write permissions ✅
   - **Allow GitHub Actions to create and approve pull requests:** ✅

---

## 📚 REFERÊNCIAS

### URLs Úteis

- **Repository Settings:**
  ```
  https://github.com/verlao/verly-erp-frontend/settings
  ```

- **Environments:**
  ```
  https://github.com/verlao/verly-erp-frontend/settings/environments
  ```

- **GitHub Pages Settings:**
  ```
  https://github.com/verlao/verly-erp-frontend/settings/pages
  ```

- **Actions:**
  ```
  https://github.com/verlao/verly-erp-frontend/actions
  ```

### Documentação Oficial

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [deploy-pages Action](https://github.com/actions/deploy-pages)

---

## ✅ CHECKLIST FINAL

Após seguir os passos acima, confirme:

- [ ] Branch `prod` está listada em: `Settings → Environments → github-pages → Deployment branches`
- [ ] Push para branch `prod` foi feito com sucesso
- [ ] Workflow "Deploy to GitHub Pages" completou com status ✅ Success
- [ ] Site está acessível em: `https://verlao.github.io/verly-erp-frontend/`
- [ ] Não há erros nos logs do workflow

---

## 🎉 SUCESSO!

Se todos os itens do checklist acima estão ✅, seu GitHub Pages está configurado e funcionando!

**Próximos deploys:**

Agora, sempre que você fizer push para a branch `prod`, o site será atualizado automaticamente:

```bash
# Fazer alterações
git checkout prod
# ... editar arquivos ...
git add .
git commit -m "feat: nova funcionalidade"
git push origin prod
# → GitHub Pages será atualizado automaticamente! 🚀
```

---

**Última atualização:** 18/10/2025 - 21:22 UTC
**Criado por:** Claude Code - DevOps Architect
