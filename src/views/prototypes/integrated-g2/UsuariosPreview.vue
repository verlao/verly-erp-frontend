<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { UserPlus, ShieldCheck, UserRound, Search, X, Check, Trash2 } from 'lucide-vue-next'
const users = ref([{ id: 1, login: 'equipe.exemplo', role: 'Administrador', current: true }, { id: 2, login: 'marina.exemplo', role: 'Acesso padrão', current: false }, { id: 3, login: 'joao.teste', role: 'Acesso padrão', current: false }])
const query = ref('')
const filtered = computed(() => users.value.filter(user => user.login.toLocaleLowerCase('pt-BR').includes(query.value.toLocaleLowerCase('pt-BR'))))
const createDialog = ref<HTMLDialogElement>()
const removeDialog = ref<HTMLDialogElement>()
const removing = ref<(typeof users.value)[number]>()
const form = reactive({ login: '', password: '', role: 'Acesso padrão' })
const notice = ref('')
const formError = ref('')
const valid = computed(() => form.login.trim().length > 2 && form.password.length >= 6)
function openCreate() { formError.value = ''; Object.assign(form, { login: '', password: '', role: 'Acesso padrão' }); createDialog.value?.showModal() }
function create() {
 formError.value = ''
 if (!valid.value) return
 if (users.value.some(u => u.login === form.login.trim())) { formError.value = 'Esse nome de acesso já está em uso. Escolha outro.'; return }
 users.value.push({ id: Date.now(), login: form.login.trim(), role: form.role, current: false })
 form.password = ''; createDialog.value?.close(); notice.value = `${form.login.trim()} adicionado nesta prévia. Nenhum acesso real foi criado.`
}
function askRemove(user: (typeof users.value)[number]) { removing.value = user; removeDialog.value?.showModal() }
function remove() { if (!removing.value || removing.value.current) return; users.value = users.value.filter(u => u.id !== removing.value!.id); notice.value = `Acesso de ${removing.value.login} removido nesta prévia.`; removeDialog.value?.close() }
</script>

<template>
 <main class="preview-page">
  <header class="users-heading"><div><p class="preview-eyebrow">Quem pode entrar no ERP</p><h1 class="preview-heading">Usuários</h1></div><button class="preview-button-primary" @click="openCreate"><UserPlus :size="20" aria-hidden="true" />Adicionar usuário</button></header>
  <p class="preview-subtitle">Cada pessoa tem seu próprio acesso. As permissões definem o que ela pode fazer.</p>
  <div v-if="notice" class="preview-notice" role="status"><Check :size="20" aria-hidden="true" />{{ notice }}</div>
  <div class="access-note"><ShieldCheck :size="24" aria-hidden="true" /><div><strong>Administradores gerenciam os acessos</strong><p>O perfil administrador não concede acesso a recursos de IA. As permissões controlam apenas os recursos do ERP.</p></div></div>
  <div class="preview-toolbar"><label class="search-wrap"><Search :size="20" aria-hidden="true" /><input v-model="query" class="preview-search" aria-label="Buscar nome de acesso" placeholder="Buscar por nome de acesso" /></label><span>{{ filtered.length }} usuários</span></div>
  <div class="preview-surface users-list">
   <article v-for="user in filtered" :key="user.id" class="user-row">
    <span class="person-mark"><UserRound :size="23" aria-hidden="true" /></span>
    <div class="user-identity"><strong>{{ user.login }}</strong><span v-if="user.current">Seu acesso</span><span v-else>Nome de acesso</span></div>
    <span class="role-chip" :class="{ admin: user.role === 'Administrador' }"><ShieldCheck v-if="user.role === 'Administrador'" :size="16" aria-hidden="true" />{{ user.role }}</span>
    <button v-if="!user.current" class="preview-button" :aria-label="`Remover acesso de ${user.login}`" @click="askRemove(user)"><Trash2 :size="18" aria-hidden="true" /><span>Remover</span></button>
    <span v-else class="own-access">Seu acesso está protegido</span>
   </article>
   <p v-if="!filtered.length" class="preview-empty">Nenhum usuário encontrado. Tente outro nome.</p>
  </div>
  <dialog ref="createDialog" class="preview-dialog" aria-labelledby="create-user-title">
   <header><h2 id="create-user-title">Adicionar usuário</h2><button class="preview-button" aria-label="Fechar cadastro de usuário" @click="createDialog?.close()"><X :size="20" aria-hidden="true" /></button></header>
   <p>Cadastre um acesso individual para a pessoa da equipe.</p>
   <form @submit.prevent="create">
    <label class="preview-form-field">Nome de acesso<input v-model="form.login" required minlength="3" autocomplete="off" placeholder="Ex.: equipe.teste" /></label>
    <label class="preview-form-field">Senha fictícia para a prévia<input v-model="form.password" type="password" required minlength="6" autocomplete="new-password" placeholder="Mínimo de 6 caracteres" /><small>Esta senha só valida a interação local. Não use uma senha real.</small></label>
    <label class="preview-form-field">Permissão<select v-model="form.role"><option>Acesso padrão</option><option>Administrador</option></select></label>
    <p v-if="form.role === 'Administrador'" class="permission-warning"><ShieldCheck :size="20" aria-hidden="true" />Poderá adicionar e remover acessos de outras pessoas.</p>
    <p v-if="formError" class="permission-warning" role="alert">{{ formError }}</p>
    <p v-if="!valid" class="required-reason">Informe um nome de acesso e uma senha fictícia de pelo menos 6 caracteres.</p>
    <footer><button type="button" class="preview-button" @click="createDialog?.close()">Cancelar</button><button class="preview-button-primary" :disabled="!valid" type="submit">Adicionar usuário</button></footer>
   </form>
  </dialog>
  <dialog ref="removeDialog" class="preview-dialog" aria-labelledby="remove-user-title">
   <h2 id="remove-user-title">Remover este acesso?</h2><p><strong>{{ removing?.login }}</strong> deixará de entrar no ERP nesta prévia.</p>
   <footer><button class="preview-button" @click="removeDialog?.close()">Manter acesso</button><button class="preview-button-primary" @click="remove">Remover acesso</button></footer>
  </dialog>
 </main>
</template>

<style scoped>
.users-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}.access-note{display:flex;align-items:flex-start;gap:14px;padding:20px;background:#EAF3F1;border:1px solid #BCD7D1;border-radius:16px;color:#225D59}.access-note svg{flex-shrink:0;margin-top:3px}.access-note p{color:#53615F;margin:4px 0 0;font-size:15px}.search-wrap{position:relative;display:flex;align-items:center;flex:1;min-width:240px}.search-wrap>svg{position:absolute;left:14px;color:#53615F}.search-wrap input{padding-left:44px}.users-list{padding:0 22px}.user-row{display:flex;align-items:center;gap:16px;padding:22px 0;flex-wrap:wrap}.user-row+.user-row{border-top:1px solid #DFE6E2}.person-mark{display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:12px;background:#F0F5F2;color:#2E7D7A}.user-identity{display:flex;flex:1;min-width:150px;flex-direction:column}.user-identity>span,.own-access{font-size:15px;color:#53615F}.role-chip{display:inline-flex;align-items:center;gap:6px;background:#F0F3F2;border-radius:999px;padding:5px 12px;font-size:15px;color:#53615F}.role-chip.admin{background:#E5F2EF;color:#245F59}.permission-warning{display:flex;gap:8px;align-items:center;border-radius:12px;padding:14px;background:#FBE8CF;color:#854008}.required-reason{font-size:15px;color:#53615F}@media(max-width:600px){.user-row{gap:12px}.role-chip{margin-left:60px}.user-row>.preview-button,.own-access{margin-left:60px}}
</style>
