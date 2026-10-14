import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { connectSSE, createSSEParser, type SSEStatus } from './sse'

const enc = new TextEncoder()

/** A controllable response body; abort on the request signal errors the stream. */
function controlledStream(signal?: AbortSignal | null) {
  let ctrl!: ReadableStreamDefaultController<Uint8Array>
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      ctrl = c
    },
  })
  signal?.addEventListener('abort', () => {
    try {
      ctrl.error(new DOMException('aborted', 'AbortError'))
    } catch {
      /* already closed */
    }
  })
  return {
    body,
    send: (s: string) => ctrl.enqueue(enc.encode(s)),
    end: () => ctrl.close(),
  }
}

const flush = async () => {
  for (let i = 0; i < 10; i++) await Promise.resolve()
}

describe('createSSEParser', () => {
  function collect() {
    const events: Array<[string, string]> = []
    return { events, parser: createSSEParser((t, d) => events.push([t, d])) }
  }

  it('parses event and data, ignoring comments', () => {
    const { events, parser } = collect()
    parser.push(': hb\n\nevent: lead.created\ndata: {"id":1}\n\n')
    expect(events).toEqual([['lead.created', '{"id":1}']])
  })

  it('joins multi-line data and defaults the type to message', () => {
    const { events, parser } = collect()
    parser.push('data: a\ndata: b\n\n')
    expect(events).toEqual([['message', 'a\nb']])
  })

  it('handles chunks split anywhere and CRLF', () => {
    const { events, parser } = collect()
    for (const part of ['eve', 'nt: pix.posted\r', '\ndata: x', 'yz\r\n\r', '\n']) parser.push(part)
    expect(events).toEqual([['pix.posted', 'xyz']])
  })

  it('does not dispatch an event without data', () => {
    const { events, parser } = collect()
    parser.push('event: customer.created\n\n')
    expect(events).toEqual([])
  })
})

describe('connectSSE', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  const base = (over: Partial<Parameters<typeof connectSSE>[1]> = {}) => ({
    getToken: () => 'tok-123',
    onEvent: vi.fn(),
    enabled: true,
    ...over,
  })

  it('does not connect when disabled', async () => {
    const c = connectSSE('/s', base({ enabled: false }))
    await flush()
    expect(fetchMock).not.toHaveBeenCalled()
    c.close()
  })

  it('sends the bearer token and delivers events', async () => {
    const s = controlledStream()
    fetchMock.mockResolvedValue({ ok: true, status: 200, body: s.body })
    const opts = base()
    const statuses: SSEStatus[] = []
    const c = connectSSE('/s', { ...opts, onStatus: (x) => statuses.push(x) })
    await flush()
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer tok-123')
    s.send('event: pix.recorded\ndata: {"a":1}\n\n')
    await flush()
    expect(opts.onEvent).toHaveBeenCalledWith('pix.recorded', '{"a":1}')
    expect(statuses).toEqual(['connecting', 'open'])
    c.close()
    expect(statuses[statuses.length - 1]).toBe('closed')
  })

  it('reconnects with backoff 1s, 2s, ... capped at 30s', async () => {
    fetchMock.mockRejectedValue(new Error('down'))
    const c = connectSSE('/s', base())
    await flush()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    for (const [delay, calls] of [
      [1000, 2],
      [2000, 3],
      [4000, 4],
      [8000, 5],
      [16000, 6],
      [30000, 7],
      [30000, 8],
    ] as const) {
      await vi.advanceTimersByTimeAsync(delay - 1)
      expect(fetchMock).toHaveBeenCalledTimes(calls - 1)
      await vi.advanceTimersByTimeAsync(1)
      expect(fetchMock).toHaveBeenCalledTimes(calls)
    }
    c.close()
  })

  it('retries on a 500 response with backoff', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, body: null })
    const c = connectSSE('/s', base())
    await flush()
    await vi.advanceTimersByTimeAsync(1000)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    c.close()
  })

  it.each([401, 403])('stops without retrying on %i and reports unauthorized', async (status) => {
    fetchMock.mockResolvedValue({ ok: false, status, body: null })
    const statuses: SSEStatus[] = []
    const c = connectSSE('/s', base({ onStatus: (x) => statuses.push(x) }))
    await flush()
    await vi.advanceTimersByTimeAsync(60000)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(statuses).toEqual(['connecting', 'unauthorized'])
    c.close()
  })

  it('reconnects when the watchdog sees no bytes for 35s, and heartbeats keep it alive', async () => {
    const streams: ReturnType<typeof controlledStream>[] = []
    fetchMock.mockImplementation(async (_u: string, init: RequestInit) => {
      const s = controlledStream(init.signal)
      streams.push(s)
      return { ok: true, status: 200, body: s.body }
    })
    const c = connectSSE('/s', base())
    await flush()
    await vi.advanceTimersByTimeAsync(30000)
    streams[0].send(': hb\n\n')
    await vi.advanceTimersByTimeAsync(30000) // 60s total, but only 30s since the heartbeat
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(5000) // 35s silent -> abort
    await vi.advanceTimersByTimeAsync(1000) // backoff
    expect(fetchMock).toHaveBeenCalledTimes(2)
    c.close()
  })

  it('reconnects after the server closes the stream', async () => {
    const s = controlledStream()
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, body: s.body })
    fetchMock.mockRejectedValue(new Error('down'))
    const c = connectSSE('/s', base())
    await flush()
    s.end()
    await vi.advanceTimersByTimeAsync(1000)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    c.close()
  })

  it('close() aborts the request and stops reconnecting', async () => {
    let signal: AbortSignal | null | undefined
    fetchMock.mockImplementation(async (_u: string, init: RequestInit) => {
      signal = init.signal
      return { ok: true, status: 200, body: controlledStream(init.signal).body }
    })
    const c = connectSSE('/s', base())
    await flush()
    c.close()
    expect(signal?.aborted).toBe(true)
    await vi.advanceTimersByTimeAsync(120000)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('a throwing consumer does not break the stream', async () => {
    const s = controlledStream()
    fetchMock.mockResolvedValue({ ok: true, status: 200, body: s.body })
    const onEvent = vi.fn().mockImplementationOnce(() => {
      throw new Error('boom')
    })
    const c = connectSSE('/s', base({ onEvent }))
    await flush()
    s.send('event: a\ndata: 1\n\nevent: b\ndata: 2\n\n')
    await flush()
    expect(onEvent).toHaveBeenCalledTimes(2)
    c.close()
  })
})
