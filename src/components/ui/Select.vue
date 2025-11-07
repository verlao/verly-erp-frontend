<script setup lang="ts">
import { ref, watch } from 'vue'
import { cn } from '../../lib/utils'

const props = defineProps<{
  modelValue?: string | number
  placeholder?: string
  disabled?: boolean
  class?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const isOpen = ref(false)
const selectedValue = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  selectedValue.value = newValue
})

const toggle = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const close = () => {
  isOpen.value = false
}

defineExpose({
  isOpen,
  close
})
</script>

<template>
  <div class="relative" v-click-outside="close">
    <button
      type="button"
      :disabled="disabled"
      @click="toggle"
      :class="cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        props.class
      )"
    >
      <slot name="trigger" :value="selectedValue">
        <span :class="selectedValue ? '' : 'text-muted-foreground'">
          {{ selectedValue || placeholder }}
        </span>
      </slot>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="ml-2 h-4 w-4 opacity-50"
        :class="{ 'rotate-180': isOpen }"
      >
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </button>

    <Transition
      enter-active-class="transition-all duration-100"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-75"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md"
      >
        <div class="p-1">
          <slot :close="close" :emit="emit" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts">
// Extended HTMLElement type for click outside directive
interface ClickOutsideElement extends HTMLElement {
  clickOutsideEvent?: (event: Event) => void
}

// Click outside directive
export default {
  directives: {
    'click-outside': {
      mounted(el: ClickOutsideElement, binding: any) {
        el.clickOutsideEvent = (event: Event) => {
          if (!(el === event.target || el.contains(event.target as Node))) {
            binding.value()
          }
        }
        document.addEventListener('click', el.clickOutsideEvent)
      },
      unmounted(el: ClickOutsideElement) {
        if (el.clickOutsideEvent) {
          document.removeEventListener('click', el.clickOutsideEvent)
        }
      }
    }
  }
}
</script>
