<template>
  <div class="fixed top-4 right-4 z-50 space-y-4">
    <Notification
      v-for="notification in notifications"
      :key="notification.id"
      :title="notification.title"
      :message="notification.message"
      :type="notification.type"
      :duration="notification.duration"
      :auto-close="notification.autoClose"
      @close="removeNotification(notification.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '../../stores/notification'
import Notification from './Notification.vue'

const notificationStore = useNotificationStore()
const { notifications } = storeToRefs(notificationStore)

function removeNotification(id: number) {
  notificationStore.remove(id)
}
</script>