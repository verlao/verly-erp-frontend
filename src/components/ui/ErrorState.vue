<script setup lang="ts">
import { type HTMLAttributes } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import Button from './Button.vue'
import { cn } from '../../lib/utils'

const props = defineProps<{
  message: string
  loading?: boolean
  class?: HTMLAttributes['class']
}>()

defineEmits<{
  retry: []
}>()
</script>

<template>
  <div :class="cn('p-8 text-center', props.class)">
    <AlertTriangle class="w-6 h-6 text-destructive mx-auto mb-2" />
    <p class="text-sm text-foreground mb-3">{{ message }}</p>
    <Button variant="outline" size="sm" :disabled="loading" @click="$emit('retry')">Tentar de novo</Button>
  </div>
</template>
