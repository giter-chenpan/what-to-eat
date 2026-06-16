import { describe, it, expect } from 'vitest'
import { SseParser } from '../sseParser'

describe('SseParser', () => {
  it('parses a single complete event from a single chunk', () => {
    const p = new SseParser()
    const events = p.feed('data: {"delta":"hi"}\n\n')
    expect(events).toEqual([{ kind: 'delta', text: 'hi' }])
  })

  it('returns empty array when chunk has no complete event', () => {
    const p = new SseParser()
    const events = p.feed('data: {"delta":"par')
    expect(events).toEqual([])
  })

  it('parses an event split across two chunks', () => {
    const p = new SseParser()
    const e1 = p.feed('data: {"delta":"hel')
    const e2 = p.feed('lo"}\n\n')
    expect(e1).toEqual([])
    expect(e2).toEqual([{ kind: 'delta', text: 'hello' }])
  })

  it('parses multiple events from a single chunk', () => {
    const p = new SseParser()
    const events = p.feed('data: {"delta":"a"}\n\ndata: {"delta":"b"}\n\n')
    expect(events).toEqual([
      { kind: 'delta', text: 'a' },
      { kind: 'delta', text: 'b' },
    ])
  })

  it('emits done event for [DONE] payload', () => {
    const p = new SseParser()
    const events = p.feed('data: [DONE]\n\n')
    expect(events).toEqual([{ kind: 'done' }])
  })

  it('emits error event', () => {
    const p = new SseParser()
    const events = p.feed('data: {"error":"boom"}\n\n')
    expect(events).toEqual([{ kind: 'error', message: 'boom' }])
  })

  it('skips malformed JSON without throwing', () => {
    const p = new SseParser()
    const events = p.feed('data: not-json\n\ndata: {"delta":"ok"}\n\n')
    expect(events).toEqual([{ kind: 'delta', text: 'ok' }])
  })

  it('ignores non-data lines within an event', () => {
    const p = new SseParser()
    const events = p.feed('event: foo\ndata: {"delta":"x"}\n\n')
    expect(events).toEqual([{ kind: 'delta', text: 'x' }])
  })

  it('flush() emits any remaining buffered event', () => {
    const p = new SseParser()
    p.feed('data: {"delta":"leftover"}')
    const events = p.flush()
    expect(events).toEqual([{ kind: 'delta', text: 'leftover' }])
  })

  it('flush() after complete event returns empty', () => {
    const p = new SseParser()
    p.feed('data: {"delta":"x"}\n\n')
    const events = p.flush()
    expect(events).toEqual([])
  })
})
