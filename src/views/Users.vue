<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header com botão "Novo Usuário" -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
      <Button @click="openCreateModal" class="flex items-center gap-2">
        <UserPlus class="w-4 h-4" />
        Novo Usuário
      </Button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Tabela de usuários -->
    <Card v-else>
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuário
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Roles
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ user.username }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span
                v-for="role in user.roles"
                :key="role"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2"
                :class="getRoleClass(role)"
              >
                {{ formatRole(role) }}
              </span>
            </td>
            <td class="px-6 py-4 text-right text-sm font-medium">
              <Button variant="ghost" size="sm" class="text-red-600 hover:text-red-800">
                <Trash2 class="w-4 h-4" />
              </Button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty state -->
      <div v-if="users.length === 0" class="text-center py-12">
        <Users class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">Nenhum usuário encontrado</p>
      </div>

      <!-- Pagination -->
      <Pagination
        v-if="totalElements > 0"
        :current-page="currentPage"
        :total-items="totalElements"
        :page-size="pageSize"
        @page-changed="handlePageChange"
        @page-size-changed="handlePageSizeChange"
      />
    </Card>

    <!-- Modal de criação -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeCreateModal"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-xl font-bold text-gray-900">Criar Novo Usuário</h3>
          <button @click="closeCreateModal" class="text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="createUser" class="p-6 space-y-4">
          <!-- Username -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Usuário *
            </label>
            <input
              v-model="newUser.username"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Digite o nome de usuário"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Senha *
            </label>
            <input
              v-model="newUser.password"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Digite a senha (mínimo 6 caracteres)"
            />
          </div>

          <!-- Roles (Checkboxes) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Permissões *
            </label>
            <div class="space-y-2 bg-gray-50 p-4 rounded-lg">
              <label class="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value="ROLE_USER"
                  v-model="newUser.roles"
                  class="mr-2 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span class="text-sm text-gray-700">Usuário (acesso padrão)</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value="ROLE_ADMIN"
                  v-model="newUser.roles"
                  class="mr-2 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span class="text-sm text-gray-700">Administrador (acesso total)</span>
              </label>
            </div>
            <p v-if="newUser.roles.length === 0" class="text-xs text-red-600 mt-1">
              Selecione ao menos uma permissão
            </p>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              @click="closeCreateModal"
              :disabled="saving"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              :disabled="saving || newUser.roles.length === 0"
            >
              <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
              Criar Usuário
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Pagination from '@/components/ui/Pagination.vue'
import { UserPlus, Loader2, Users, Trash2, X } from 'lucide-vue-next'
import userService, { type UserDTO, type CreateUserRequest } from '@/services/user'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()

// State
const users = ref<UserDTO[]>([])
const loading = ref(false)
const saving = ref(false)
const showCreateModal = ref(false)

// Pagination
const currentPage = ref(0)
const pageSize = ref(10)
const totalElements = ref(0)

// Form
const newUser = ref<CreateUserRequest>({
  username: '',
  password: '',
  roles: []
})

// Methods
const loadUsers = async () => {
  loading.value = true
  try {
    const response = await userService.getAll({
      page: currentPage.value,
      size: pageSize.value,
      sort: 'username'
    })
    users.value = response.content
    totalElements.value = response.totalElements
  } catch (error: any) {
    console.error('Erro ao carregar usuários:', error)
    const message = error.response?.data?.message || 'Falha ao carregar usuários'
    notificationStore.error('Erro', message)
  } finally {
    loading.value = false
  }
}

const createUser = async () => {
  if (!newUser.value.username || !newUser.value.password || newUser.value.roles.length === 0) {
    notificationStore.warning('Atenção', 'Preencha todos os campos e selecione ao menos uma permissão')
    return
  }

  saving.value = true
  try {
    await userService.create(newUser.value)
    notificationStore.success('Sucesso', 'Usuário criado com sucesso!')
    closeCreateModal()
    loadUsers()
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error)
    const message = error.response?.data?.message || 'Erro ao criar usuário'
    notificationStore.error('Erro', message)
  } finally {
    saving.value = false
  }
}

const openCreateModal = () => {
  newUser.value = { username: '', password: '', roles: [] }
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadUsers()
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 0
  loadUsers()
}

const formatRole = (role: string) => {
  return role.replace('ROLE_', '')
}

const getRoleClass = (role: string) => {
  return role === 'ROLE_ADMIN'
    ? 'bg-red-100 text-red-800'
    : 'bg-blue-100 text-blue-800'
}

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>
