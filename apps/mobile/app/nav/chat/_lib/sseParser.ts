import type { SseEvent } from './types'

const SEPARATOR = '\n\n'
const DATA_PREFIX = 'data:'

export class SseParser {
  private buffer = ''

  feed(chunk: string): SseEvent[] {
    this.buffer += chunk
    const events: SseEvent[] = []
    let idx: number
    while ((idx = this.buffer.indexOf(SEPARATOR)) !== -1) {
      const raw = this.buffer.slice(0, idx)
      this.buffer = this.buffer.slice(idx + SEPARATOR.length)
      const event = this.parseEvent(raw)
      if (event) events.push(event)
    }
    return events
  }

  flush(): SseEvent[] {
    if (this.buffer.trim().length === 0) return []
    const event = this.parseEvent(this.buffer)
    this.buffer = ''
    return event ? [event] : []
  }

  private parseEvent(raw: string): SseEvent | null {
    const dataLine = raw
      .split('\n')
      .find((line) => line.startsWith(DATA_PREFIX))
    if (!dataLine) return null
    const payload = dataLine.slice(DATA_PREFIX.length).trim()
    if (payload === '[DONE]') return { kind: 'done' }
    try {
      const json = JSON.parse(payload) as Record<string, unknown>
      if (typeof json.delta === 'string') {
        return { kind: 'delta', text: json.delta }
      }
      if (typeof json.error === 'string') {
        return { kind: 'error', message: json.error }
      }
      return null
    } catch {
      return null
    }
  }
}
