import { ref, h, render } from 'vue'
import Notification from '../components/ui/Notification.vue'

interface NotificationOptions {
  title: string
  message: string
  duration?: number
  autoClose?: boolean
}

interface NotificationInstance {
  close: () => void
}

const notifications = ref<NotificationInstance[]>([])

export function useNotification() {
  const show = (
    type: 'success' | 'info' | 'warning' | 'error',
    options: NotificationOptions
  ): NotificationInstance => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const instance: NotificationInstance = {
      close: () => {
        render(null, container)
        document.body.removeChild(container)
        const index = notifications.value.indexOf(instance)
        if (index > -1) {
          notifications.value.splice(index, 1)
        }
      }
    }

    const vnode = h(Notification, {
      ...options,
      type,
      duration: options.duration || 5000,
      autoClose: options.autoClose !== false,
      onClose: instance.close
    })

    render(vnode, container)
    notifications.value.push(instance)

    return instance
  }

  const success = (title: string, message: string, duration?: number): NotificationInstance => {
    return show('success', { title, message, duration })
  }

  const error = (title: string, message: string, duration?: number): NotificationInstance => {
    return show('error', { title, message, duration })
  }

  const warning = (title: string, message: string, duration?: number): NotificationInstance => {
    return show('warning', { title, message, duration })
  }

  const info = (title: string, message: string, duration?: number): NotificationInstance => {
    return show('info', { title, message, duration })
  }

  const closeAll = () => {
    notifications.value.forEach(notification => notification.close())
    notifications.value = []
  }

  return {
    success,
    error,
    warning,
    info,
    closeAll
  }
}
