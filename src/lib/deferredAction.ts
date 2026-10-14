// Deferred actions with undo: the backend is only called when the grace period
// ends or when the action is flushed (navigation / page hide). An undone action
// never reaches the backend, so there is no "post followed by reverse".

export const DEFAULT_DEFER_MS = 5000

export interface DeferredOptions {
  delayMs?: number
  onCommitted?: () => void
  onUndone?: () => void
  onError?: (error: unknown) => void
}

export interface DeferredHandle {
  /** Cancels the action if it has not been committed yet. Returns true if it was cancelled. */
  undo: () => boolean
  /** Commits right now if still pending. Resolves once the commit settles (errors go to onError). */
  flush: () => Promise<void>
}

type Pending = () => Promise<void>

const pending = new Set<Pending>()

export function scheduleDeferred(
  commit: () => Promise<void>,
  opts: DeferredOptions = {}
): DeferredHandle {
  const { delayMs = DEFAULT_DEFER_MS, onCommitted, onUndone, onError } = opts
  let settled = false
  let timer: ReturnType<typeof setTimeout> | undefined

  const run = async (): Promise<void> => {
    if (settled) return
    settled = true
    clearTimeout(timer)
    pending.delete(run)
    try {
      await commit()
    } catch (error) {
      onError?.(error)
      return
    }
    onCommitted?.()
  }

  timer = setTimeout(() => void run(), delayMs)
  pending.add(run)

  return {
    undo() {
      if (settled) return false
      settled = true
      clearTimeout(timer)
      pending.delete(run)
      onUndone?.()
      return true
    },
    flush: run
  }
}

/** Commits every pending action immediately. */
export async function flushAllDeferred(): Promise<void> {
  await Promise.all([...pending].map(run => run()))
}

/** Flushes on tab hide / page unload. Returns a disposer. */
export function installDeferredFlushListeners(target: Window & typeof globalThis = window): () => void {
  const onHide = () => void flushAllDeferred()
  const onVisibility = () => {
    if (target.document.visibilityState === 'hidden') onHide()
  }
  target.addEventListener('pagehide', onHide)
  target.document.addEventListener('visibilitychange', onVisibility)
  return () => {
    target.removeEventListener('pagehide', onHide)
    target.document.removeEventListener('visibilitychange', onVisibility)
  }
}
