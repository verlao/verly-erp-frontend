// Authenticated Server-Sent Events client. The native EventSource cannot send an
// Authorization header, so this reads the stream with fetch + ReadableStream.
// Backend: GET /dashboard/stream (events lead.created, pix.recorded, pix.posted,
// customer.created; a ':' heartbeat comment every 25 s).

export type SSEStatus = 'connecting' | 'open' | 'reconnecting' | 'closed' | 'unauthorized'

export interface SSEOptions {
  getToken: () => string | null | undefined | Promise<string | null | undefined>
  onEvent: (type: string, data: string) => void
  onStatus?: (status: SSEStatus) => void
  /** When false nothing is connected. */
  enabled: boolean
}

export interface SSEConnection {
  close: () => void
}

export const SSE_INITIAL_BACKOFF_MS = 1000
export const SSE_MAX_BACKOFF_MS = 30000
// The backend heartbeats every 25 s; 35 s without a single byte means a dead socket.
export const SSE_WATCHDOG_MS = 35000

/** Incremental parser for the text/event-stream format. */
export function createSSEParser(emit: (type: string, data: string) => void) {
  let buffer = ''
  let eventType = ''
  let dataLines: string[] = []
  let first = true
  let skipLf = false

  function dispatch() {
    if (dataLines.length > 0) emit(eventType || 'message', dataLines.join('\n'))
    eventType = ''
    dataLines = []
  }

  function handleLine(line: string) {
    if (line === '') return dispatch()
    if (line.startsWith(':')) return // comment / heartbeat
    const colon = line.indexOf(':')
    const field = colon === -1 ? line : line.slice(0, colon)
    let value = colon === -1 ? '' : line.slice(colon + 1)
    if (value.startsWith(' ')) value = value.slice(1)
    if (field === 'event') eventType = value
    else if (field === 'data') dataLines.push(value)
    // id / retry are not used by this client
  }

  return {
    push(chunk: string) {
      if (first) {
        first = false
        if (chunk.startsWith('﻿')) chunk = chunk.slice(1)
      }
      if (skipLf && chunk.startsWith('\n')) chunk = chunk.slice(1)
      skipLf = false
      buffer += chunk
      let start = 0
      for (let i = 0; i < buffer.length; i++) {
        const c = buffer[i]
        if (c !== '\n' && c !== '\r') continue
        handleLine(buffer.slice(start, i))
        if (c === '\r') {
          if (i + 1 < buffer.length) {
            if (buffer[i + 1] === '\n') i++
          } else {
            skipLf = true // CRLF split across chunks
          }
        }
        start = i + 1
      }
      buffer = buffer.slice(start)
    },
  }
}

export function connectSSE(url: string, options: SSEOptions): SSEConnection {
  const { getToken, onEvent, onStatus, enabled } = options
  if (!enabled) return { close() {} }

  let closed = false
  let backoff = SSE_INITIAL_BACKOFF_MS
  let controller: AbortController | null = null
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  let watchdog: ReturnType<typeof setTimeout> | undefined

  const setStatus = (s: SSEStatus) => onStatus?.(s)
  const clearWatchdog = () => {
    if (watchdog !== undefined) clearTimeout(watchdog)
    watchdog = undefined
  }

  function scheduleRetry() {
    if (closed) return
    setStatus('reconnecting')
    const delay = backoff
    backoff = Math.min(backoff * 2, SSE_MAX_BACKOFF_MS)
    retryTimer = setTimeout(() => void run(), delay)
  }

  async function run() {
    if (closed) return
    const ctrl = new AbortController()
    controller = ctrl
    const armWatchdog = () => {
      clearWatchdog()
      watchdog = setTimeout(() => ctrl.abort(), SSE_WATCHDOG_MS)
    }
    try {
      const token = await getToken()
      if (closed) return
      armWatchdog()
      const headers: Record<string, string> = { Accept: 'text/event-stream' }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch(url, { headers, signal: ctrl.signal, cache: 'no-store' })
      if (res.status === 401 || res.status === 403) {
        // Expired/invalid credentials: retrying only hammers the server. Stop and
        // report; the logout/refresh decision belongs to the auth interceptor.
        closed = true
        setStatus('unauthorized')
        return
      }
      if (!res.ok || !res.body) throw new Error(`SSE HTTP ${res.status}`)
      setStatus('open')
      armWatchdog()
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      const parser = createSSEParser((type, data) => {
        try {
          onEvent(type, data)
        } catch {
          // a consumer bug must not kill the stream
        }
      })
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        backoff = SSE_INITIAL_BACKOFF_MS // bytes are flowing: the link is healthy
        armWatchdog()
        parser.push(decoder.decode(value, { stream: true }))
      }
    } catch {
      // fall through to reconnect (network error, HTTP error, watchdog abort)
    } finally {
      clearWatchdog()
    }
    scheduleRetry()
  }

  setStatus('connecting')
  void run()

  return {
    close() {
      if (closed) return
      closed = true
      clearWatchdog()
      if (retryTimer !== undefined) clearTimeout(retryTimer)
      controller?.abort()
      setStatus('closed')
    },
  }
}
