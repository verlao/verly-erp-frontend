import { defineStore } from 'pinia'
import { ref } from 'vue'

type NotificationType = 'success' | 'info' | 'warning' | 'error'

interface Notification {
  id: number
  title: string
  message: string
  type: NotificationType
  duration?: number
  autoClose?: boolean
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  let nextId = 1

  function add(notification: Omit<Notification, 'id'>) {
    const id = nextId++
    notifications.value.push({
      ...notification,
      id,
      duration: notification.duration || 5000,
      autoClose: notification.autoClose !== false
    })
    return id
  }

  function remove(id: number) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  function success(message: string, title = 'Sucesso', options = {}) {
    return add({ title, message, type: 'success', ...options })
  }

  function info(message: string, title = 'Informação', options = {}) {
    return add({ title, message, type: 'info', ...options })
  }

  function warning(message: string, title = 'Atenção', options = {}) {
    return add({ title, message, type: 'warning', ...options })
  }

  function error(message: string, title = 'Erro', options = {}) {
    return add({ title, message, type: 'error', ...options })
  }

  function clear() {
    notifications.value = []
  }

  return {
    notifications,
    add,
    remove,
    success,
    info,
    warning,
    error,
    clear
  }
})