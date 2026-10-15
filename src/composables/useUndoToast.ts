import { readonly, ref } from 'vue'
import { friendlyError } from '../lib/errors'
import { scheduleDeferred, type DeferredHandle } from '../lib/deferredAction'

export interface UndoToastItem {
  id: string
  message: string
  state: 'pending' | 'committing' | 'error'
  error?: string
}

export interface UndoToastOptions {
  message: string
  commit: () => Promise<void>
  errorMessage: string
  onCommitted?: () => void
  onUndone?: () => void
}

const items = ref<UndoToastItem[]>([])
const handles = new Map<string, DeferredHandle>()
let nextId = 0

export function useUndoToast() {
  function remove(id: string) {
    items.value = items.value.filter(item => item.id !== id)
    handles.delete(id)
  }

  function schedule(options: UndoToastOptions): string {
    const id = `undo-${++nextId}`
    const item: UndoToastItem = { id, message: options.message, state: 'pending' }
    items.value = [...items.value, item]

    const handle = scheduleDeferred(async () => {
      item.state = 'committing'
      await options.commit()
    }, {
      onCommitted: () => {
        remove(id)
        options.onCommitted?.()
      },
      onUndone: () => {
        remove(id)
        options.onUndone?.()
      },
      onError: error => {
        item.state = 'error'
        item.error = friendlyError(error, options.errorMessage)
      }
    })
    handles.set(id, handle)
    return id
  }

  function undo(id: string): boolean {
    return handles.get(id)?.undo() ?? false
  }

  function dismissError(id: string): void {
    if (items.value.find(item => item.id === id)?.state === 'error') remove(id)
  }

  return { items: readonly(items), schedule, undo, dismissError }
}
