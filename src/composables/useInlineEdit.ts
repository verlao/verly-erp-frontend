import { ref, nextTick } from 'vue'

export interface InlineEditOptions<T = any> {
  initialValue: T
  onSave?: (value: T) => Promise<void> | void
  onCancel?: () => void
  validator?: (value: T) => boolean | string
  formatter?: (value: T) => string
  parser?: (input: string) => T
}

export function useInlineEdit<T = any>(options: InlineEditOptions<T>) {
  const isEditing = ref(false)
  const value = ref<T>(options.initialValue)
  const inputValue = ref<string>(
    options.formatter ? options.formatter(options.initialValue) : String(options.initialValue)
  )
  const error = ref<string | null>(null)
  const isSaving = ref(false)

  const inputRef = ref<HTMLInputElement | null>(null)

  const startEdit = async () => {
    isEditing.value = true
    error.value = null
    inputValue.value = options.formatter
      ? options.formatter(value.value)
      : String(value.value)

    await nextTick()
    if (inputRef.value) {
      inputRef.value.focus()
      inputRef.value.select()
    }
  }

  const cancelEdit = () => {
    isEditing.value = false
    error.value = null
    inputValue.value = options.formatter
      ? options.formatter(value.value)
      : String(value.value)

    if (options.onCancel) {
      options.onCancel()
    }
  }

  const saveEdit = async () => {
    if (isSaving.value) return

    // Parse the input value
    const parsedValue = options.parser
      ? options.parser(inputValue.value)
      : (inputValue.value as unknown as T)

    // Validate if validator is provided
    if (options.validator) {
      const validationResult = options.validator(parsedValue)
      if (validationResult !== true) {
        error.value = typeof validationResult === 'string' ? validationResult : 'Invalid value'
        return
      }
    }

    // Save the value
    try {
      isSaving.value = true
      error.value = null

      if (options.onSave) {
        await options.onSave(parsedValue)
      }

      value.value = parsedValue
      isEditing.value = false
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save'
      console.error('Erro ao salvar:', err)
    } finally {
      isSaving.value = false
    }
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      saveEdit()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      cancelEdit()
    }
  }

  const setValue = (newValue: T) => {
    value.value = newValue
    inputValue.value = options.formatter
      ? options.formatter(newValue)
      : String(newValue)
  }

  return {
    isEditing,
    value,
    inputValue,
    error,
    isSaving,
    inputRef,
    startEdit,
    cancelEdit,
    saveEdit,
    handleKeydown,
    setValue
  }
}
