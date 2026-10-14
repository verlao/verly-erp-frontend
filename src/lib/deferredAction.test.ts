import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushAllDeferred, installDeferredFlushListeners, scheduleDeferred } from './deferredAction'

describe('deferredAction', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(async () => {
    await flushAllDeferred()
    vi.useRealTimers()
  })

  it('commits only after 5 s', async () => {
    const commit = vi.fn().mockResolvedValue(undefined)
    const onCommitted = vi.fn()
    scheduleDeferred(commit, { onCommitted })
    await vi.advanceTimersByTimeAsync(4999)
    expect(commit).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(commit).toHaveBeenCalledTimes(1)
    expect(onCommitted).toHaveBeenCalledTimes(1)
  })

  it('undo cancels without ever calling the backend', async () => {
    const commit = vi.fn().mockResolvedValue(undefined)
    const onUndone = vi.fn()
    const handle = scheduleDeferred(commit, { onUndone })
    expect(handle.undo()).toBe(true)
    await vi.advanceTimersByTimeAsync(10000)
    expect(commit).not.toHaveBeenCalled()
    expect(onUndone).toHaveBeenCalledTimes(1)
    expect(handle.undo()).toBe(false)
  })

  it('undo after commit does nothing', async () => {
    const onUndone = vi.fn()
    const handle = scheduleDeferred(vi.fn().mockResolvedValue(undefined), { onUndone })
    await vi.advanceTimersByTimeAsync(5000)
    expect(handle.undo()).toBe(false)
    expect(onUndone).not.toHaveBeenCalled()
  })

  it('flush commits early and the timer does not commit twice', async () => {
    const commit = vi.fn().mockResolvedValue(undefined)
    const handle = scheduleDeferred(commit)
    await handle.flush()
    expect(commit).toHaveBeenCalledTimes(1)
    await handle.flush()
    await vi.advanceTimersByTimeAsync(10000)
    expect(commit).toHaveBeenCalledTimes(1)
  })

  it('flushAllDeferred commits everything pending', async () => {
    const a = vi.fn().mockResolvedValue(undefined)
    const b = vi.fn().mockResolvedValue(undefined)
    scheduleDeferred(a)
    const undone = scheduleDeferred(b)
    undone.undo()
    await flushAllDeferred()
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).not.toHaveBeenCalled()
  })

  it('calls onError when commit fails and not onCommitted', async () => {
    const boom = new Error('boom')
    const onError = vi.fn()
    const onCommitted = vi.fn()
    scheduleDeferred(() => Promise.reject(boom), { onError, onCommitted })
    await vi.advanceTimersByTimeAsync(5000)
    expect(onError).toHaveBeenCalledWith(boom)
    expect(onCommitted).not.toHaveBeenCalled()
  })

  it('honors a custom delay', async () => {
    const commit = vi.fn().mockResolvedValue(undefined)
    scheduleDeferred(commit, { delayMs: 1000 })
    await vi.advanceTimersByTimeAsync(1000)
    expect(commit).toHaveBeenCalledTimes(1)
  })

  it('flushes on pagehide and when the tab becomes hidden', async () => {
    const dispose = installDeferredFlushListeners()
    const a = vi.fn().mockResolvedValue(undefined)
    scheduleDeferred(a)
    window.dispatchEvent(new Event('pagehide'))
    await vi.advanceTimersByTimeAsync(0)
    expect(a).toHaveBeenCalledTimes(1)

    const b = vi.fn().mockResolvedValue(undefined)
    scheduleDeferred(b)
    const spy = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.advanceTimersByTimeAsync(0)
    expect(b).not.toHaveBeenCalled()
    spy.mockReturnValue('hidden')
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.advanceTimersByTimeAsync(0)
    expect(b).toHaveBeenCalledTimes(1)
    spy.mockRestore()
    dispose()
  })
})
