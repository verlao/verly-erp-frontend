import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { useUndoToast } from './useUndoToast'
import { flushAllDeferred } from '../lib/deferredAction'

describe('useUndoToast', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('cancels a deferred commit on undo', () => {
    vi.useFakeTimers()
    const toast = useUndoToast()
    const commit = vi.fn(async () => {})
    const undone = vi.fn()
    const id = toast.schedule({ message: 'Movido', commit, errorMessage: 'Falha', onUndone: undone })

    expect(toast.undo(id)).toBe(true)
    vi.advanceTimersByTime(5000)
    expect(commit).not.toHaveBeenCalled()
    expect(undone).toHaveBeenCalledOnce()
    expect(toast.items.value).toHaveLength(0)
  })

  it('commits once at expiry and removes the toast', async () => {
    vi.useFakeTimers()
    const toast = useUndoToast()
    const commit = vi.fn(async () => {})
    const id = toast.schedule({ message: 'Movido', commit, errorMessage: 'Falha' })

    vi.advanceTimersByTime(5000)
    await flushPromises()
    expect(commit).toHaveBeenCalledOnce()
    expect(toast.undo(id)).toBe(false)
    expect(toast.items.value).toHaveLength(0)
  })

  it('flushes once, blocks undo while committing, and retains a safe error', async () => {
    const toast = useUndoToast()
    const commit = vi.fn(async () => { throw { response: { status: 0, data: { message: 'private backend detail' } } } })
    const id = toast.schedule({ message: 'Atualizado', commit, errorMessage: 'Não foi possível salvar' })

    const flushing = flushAllDeferred()
    expect(toast.items.value[0].state).toBe('committing')
    expect(toast.undo(id)).toBe(false)
    await flushing
    expect(commit).toHaveBeenCalledOnce()
    expect(toast.items.value[0]).toMatchObject({ state: 'error', error: 'Não foi possível salvar' })
    toast.dismissError(id)
    expect(toast.items.value).toHaveLength(0)
  })

  it('keeps simultaneous actions independent', () => {
    const toast = useUndoToast()
    const first = toast.schedule({ message: 'Primeira', commit: async () => {}, errorMessage: 'Falha' })
    const second = toast.schedule({ message: 'Segunda', commit: async () => {}, errorMessage: 'Falha' })

    toast.undo(first)
    expect(toast.items.value.map(item => item.id)).toEqual([second])
  })
})
