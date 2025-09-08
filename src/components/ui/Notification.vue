<template>
  <Teleport to="body">
    <div 
      v-if="isVisible" 
      class="fixed top-4 right-4 z-50 max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5"
      :class="{
        'border-l-4 border-green-500': type === 'success',
        'border-l-4 border-blue-500': type === 'info',
        'border-l-4 border-yellow-500': type === 'warning',
        'border-l-4 border-red-500': type === 'error'
      }"
    >
      <div class="flex-1 w-0 p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0 pt-0.5">
            <div v-if="type === 'success'" class="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div v-else-if="type === 'info'" class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div v-else-if="type === 'warning'" class="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div v-else-if="type === 'error'" class="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ title }}</p>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ message }}</p>
          </div>
        </div>
      </div>
      <div class="flex border-l border-gray-200 dark:border-gray-700">
        <button
          @click="close"
          class="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  title: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  duration?: number
  autoClose?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const isVisible = ref(false)
let timer: number | null = null

function close() {
  isVisible.value = false
  emit('close')
}

function startTimer() {
  if (props.autoClose !== false && props.duration) {
    timer = window.setTimeout(() => {
      close()
    }, props.duration)
  }
}

watch(() => props.message, () => {
  if (timer) {
    clearTimeout(timer)
  }
  if (props.message) {
    isVisible.value = true
    startTimer()
  }
})

onMounted(() => {
  isVisible.value = true
  startTimer()
})

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
  }
})
</script>