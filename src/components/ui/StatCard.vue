<script setup lang="ts">
import { type HTMLAttributes } from 'vue'
import { cn } from '../../lib/utils'
import Card from './Card.vue'
import Skeleton from './Skeleton.vue'

const props = defineProps<{
  label: string
  value?: string | number
  sub?: string
  loading?: boolean
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <Card :class="cn('p-4 md:p-5', props.class)">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0 space-y-1">
        <p class="text-xs md:text-sm font-medium text-muted-foreground truncate">{{ label }}</p>
        <Skeleton v-if="loading" height="2rem" width="5rem" />
        <p v-else class="text-xl md:text-2xl font-bold text-foreground leading-tight truncate">{{ value }}</p>
        <p v-if="sub && !loading" class="text-[11px] md:text-xs text-muted-foreground truncate">{{ sub }}</p>
      </div>
      <div v-if="$slots.icon" class="shrink-0 rounded-md bg-primary/10 text-primary p-2">
        <slot name="icon" />
      </div>
    </div>
  </Card>
</template>
