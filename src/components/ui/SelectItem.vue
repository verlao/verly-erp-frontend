<script setup lang="ts">
defineProps<{
  value: string | number
  disabled?: boolean
}>()
</script>

<template>
  <option 
    :value="value" 
    :disabled="disabled"
    class="py-2 text-base sm:text-sm"
  >
    <slot />
  </option>
</template>
