<template>
  <div 
    class="border rounded-lg overflow-hidden shadow-lg transition-all duration-300"
    :class="[
      borderClass,
      isOpen ? 'shadow-xl ring-2 ' + ringClass : 'shadow-md hover:shadow-lg'
    ]"
  >
    <button
      @click="toggle"
      class="w-full px-4 md:px-6 py-4 flex items-center justify-between transition-all duration-200 text-left touch-manipulation active:scale-[0.99]"
      :class="headerClass"
      :aria-expanded="isOpen"
      :aria-controls="`accordion-content-${accordionId}`"
    >
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <!-- Ícone temático -->
        <div 
          v-if="icon"
          class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300"
          :class="iconBgClass"
        >
          <div v-html="icon" class="w-5 h-5" :class="iconColorClass"></div>
        </div>
        
        <div class="flex-1 min-w-0">
          <span class="font-semibold text-base md:text-lg truncate block" :class="titleColorClass">{{ title }}</span>
          <span v-if="subtitle" class="text-xs md:text-sm block mt-0.5" :class="subtitleColorClass">{{ subtitle }}</span>
        </div>
        
        <span 
          v-if="badge !== undefined" 
          class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 transition-all duration-200"
          :class="badgeClass"
        >
          {{ badge }}
        </span>
      </div>
      
      <div class="flex items-center gap-2 shrink-0 ml-3">
        <div 
          class="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm"
          :class="chevronBgClass"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2.5" 
            stroke-linecap="round" 
            stroke-linejoin="round"
            class="transition-transform duration-300"
            :class="[chevronColorClass, { 'rotate-180': isOpen }]"
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>
    </button>
    
    <Transition
      enter-active-class="transition-all duration-300 ease-out overflow-hidden"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in overflow-hidden"
      leave-from-class="opacity-100"
      leave-to-class="max-h-0 opacity-0"
      @enter="onEnter"
      @leave="onLeave"
    >
      <div v-show="isOpen" :id="`accordion-content-${accordionId}`" :class="contentClass">
        <div class="p-4 md:p-6 animate-fade-in">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

type ColorVariant = 'blue' | 'green' | 'purple' | 'orange' | 'default'

interface Props {
  title: string
  defaultOpen?: boolean
  badge?: number | string
  subtitle?: string
  modelValue?: boolean
  variant?: ColorVariant
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: false,
  variant: 'default'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const accordionId = `accordion-${Math.random().toString(36).substr(2, 9)}`
const isOpen = ref(props.modelValue !== undefined ? props.modelValue : props.defaultOpen)

watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined) {
    isOpen.value = newValue
  }
})

const getVariantClasses = () => {
  const variants = {
    blue: {
      border: 'border-blue-200',
      ring: 'ring-blue-300',
      header: isOpen.value ? 'bg-gradient-to-r from-blue-50 to-blue-100' : 'bg-gradient-to-r from-blue-50/50 to-white hover:from-blue-50 hover:to-blue-100',
      iconBg: isOpen.value ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-blue-100',
      iconColor: isOpen.value ? 'text-white' : 'text-blue-600',
      titleColor: 'text-blue-900',
      subtitleColor: 'text-blue-600',
      badge: isOpen.value ? 'bg-blue-500 text-white shadow-md' : 'bg-blue-100 text-blue-700',
      chevronBg: isOpen.value ? 'bg-blue-500' : 'bg-blue-100',
      chevronColor: isOpen.value ? 'text-white' : 'text-blue-600',
      content: 'border-t border-blue-200 bg-gradient-to-b from-blue-50/30 to-white'
    },
    green: {
      border: 'border-green-200',
      ring: 'ring-green-300',
      header: isOpen.value ? 'bg-gradient-to-r from-green-50 to-green-100' : 'bg-gradient-to-r from-green-50/50 to-white hover:from-green-50 hover:to-green-100',
      iconBg: isOpen.value ? 'bg-green-500 shadow-lg shadow-green-500/30' : 'bg-green-100',
      iconColor: isOpen.value ? 'text-white' : 'text-green-600',
      titleColor: 'text-green-900',
      subtitleColor: 'text-green-600',
      badge: isOpen.value ? 'bg-green-500 text-white shadow-md' : 'bg-green-100 text-green-700',
      chevronBg: isOpen.value ? 'bg-green-500' : 'bg-green-100',
      chevronColor: isOpen.value ? 'text-white' : 'text-green-600',
      content: 'border-t border-green-200 bg-gradient-to-b from-green-50/30 to-white'
    },
    purple: {
      border: 'border-purple-200',
      ring: 'ring-purple-300',
      header: isOpen.value ? 'bg-gradient-to-r from-purple-50 to-purple-100' : 'bg-gradient-to-r from-purple-50/50 to-white hover:from-purple-50 hover:to-purple-100',
      iconBg: isOpen.value ? 'bg-purple-500 shadow-lg shadow-purple-500/30' : 'bg-purple-100',
      iconColor: isOpen.value ? 'text-white' : 'text-purple-600',
      titleColor: 'text-purple-900',
      subtitleColor: 'text-purple-600',
      badge: isOpen.value ? 'bg-purple-500 text-white shadow-md' : 'bg-purple-100 text-purple-700',
      chevronBg: isOpen.value ? 'bg-purple-500' : 'bg-purple-100',
      chevronColor: isOpen.value ? 'text-white' : 'text-purple-600',
      content: 'border-t border-purple-200 bg-gradient-to-b from-purple-50/30 to-white'
    },
    orange: {
      border: 'border-orange-200',
      ring: 'ring-orange-300',
      header: isOpen.value ? 'bg-gradient-to-r from-orange-50 to-orange-100' : 'bg-gradient-to-r from-orange-50/50 to-white hover:from-orange-50 hover:to-orange-100',
      iconBg: isOpen.value ? 'bg-orange-500 shadow-lg shadow-orange-500/30' : 'bg-orange-100',
      iconColor: isOpen.value ? 'text-white' : 'text-orange-600',
      titleColor: 'text-orange-900',
      subtitleColor: 'text-orange-600',
      badge: isOpen.value ? 'bg-orange-500 text-white shadow-md' : 'bg-orange-100 text-orange-700',
      chevronBg: isOpen.value ? 'bg-orange-500' : 'bg-orange-100',
      chevronColor: isOpen.value ? 'text-white' : 'text-orange-600',
      content: 'border-t border-orange-200 bg-gradient-to-b from-orange-50/30 to-white'
    },
    default: {
      border: 'border-border',
      ring: 'ring-primary/20',
      header: isOpen.value ? 'bg-accent' : 'bg-card hover:bg-accent/50',
      iconBg: isOpen.value ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-muted',
      iconColor: isOpen.value ? 'text-primary-foreground' : 'text-foreground',
      titleColor: 'text-foreground',
      subtitleColor: 'text-muted-foreground',
      badge: isOpen.value ? 'bg-primary text-primary-foreground shadow-md' : 'bg-primary/10 text-primary',
      chevronBg: isOpen.value ? 'bg-primary' : 'bg-muted',
      chevronColor: isOpen.value ? 'text-primary-foreground' : 'text-muted-foreground',
      content: 'border-t border-border bg-gradient-to-b from-muted/20 to-card'
    }
  }
  return variants[props.variant] || variants.default
}

const borderClass = computed(() => getVariantClasses().border)
const ringClass = computed(() => getVariantClasses().ring)
const headerClass = computed(() => getVariantClasses().header)
const iconBgClass = computed(() => getVariantClasses().iconBg)
const iconColorClass = computed(() => getVariantClasses().iconColor)
const titleColorClass = computed(() => getVariantClasses().titleColor)
const subtitleColorClass = computed(() => getVariantClasses().subtitleColor)
const badgeClass = computed(() => getVariantClasses().badge)
const chevronBgClass = computed(() => getVariantClasses().chevronBg)
const chevronColorClass = computed(() => getVariantClasses().chevronColor)
const contentClass = computed(() => getVariantClasses().content)

const toggle = () => {
  isOpen.value = !isOpen.value
  emit('update:modelValue', isOpen.value)
}

const onEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.maxHeight = '0'
  requestAnimationFrame(() => {
    element.style.maxHeight = element.scrollHeight + 'px'
  })
}

const onLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.maxHeight = element.scrollHeight + 'px'
  requestAnimationFrame(() => {
    element.style.maxHeight = '0'
  })
}
</script>




