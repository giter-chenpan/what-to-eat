import { SseParser } from './sseParser'
import type { SendMessageRequest, SseEvent } from './types'

export interface StreamHandle {
  abort: () => void
  finished: Promise<void>
}

export interface StreamOptions {
  baseUrl: string
  sessionId: string
  body: SendMessageRequest
  token: string | null
  onEvent: (event: SseEvent) => void
  onError: (err: unknown) => void
}

export function streamChatMessage(opts: StreamOptions): StreamHandle {
  const controller = new AbortController()
  const url = `${opts.baseUrl}/api/chat/sessions/${opts.sessionId}/messages`

  const finished = (async () => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(opts.token ? { Authorization: opts.token } : {}),
        },
        body: JSON.stringify(opts.body),
        signal: controller.signal,
      })

      if (!response.ok) {
        opts.onError(new Error(`HTTP ${response.status}`))
        return
      }
      if (!response.body) {
        opts.onError(new Error('No response body'))
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      const parser = new SseParser()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        const events = parser.feed(text)
        for (const ev of events) opts.onEvent(ev)
      }
      const tail = parser.flush()
      for (const ev of tail) opts.onEvent(ev)
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      opts.onError(err)
    }
  })()

  return {
    abort: () => controller.abort(),
    finished,
  }
}
