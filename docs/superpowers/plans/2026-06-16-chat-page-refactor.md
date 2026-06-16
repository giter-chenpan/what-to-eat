# Chat Page Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded DashScope client-side chat with a multi-session chat UI backed by `eat-be`'s `/api/chat/...` endpoints, using SSE streaming, `react-query`, and `antd-mobile` to match the rest of the app.

**Architecture:** The chat page becomes a thin composition of hooks and components. `useChatStream` encapsulates the SSE streaming logic with manual `fetch` + `ReadableStream` parsing. `react-query` handles non-streaming data (sessions, message history). The session list is a separate full-screen page reachable from a header button. Tool-role messages are filtered out; a top banner signals active tool calls.

**Tech Stack:** Next.js 14 (app router), React 18, TypeScript, `antd-mobile`, `@tanstack/react-query`, `@repo/request` (for non-streaming calls), raw `fetch` (for SSE), Vitest (new dep for unit tests).

**Spec:** `docs/superpowers/specs/2026-06-16-chat-page-refactor-design.md`

---

## File Structure

Files created (all under `apps/mobile/` unless noted):

- `app/nav/chat/_lib/types.ts` — `ChatMessage`, `ChatSession`, `SendMessageRequest` type definitions
- `app/nav/chat/_lib/sseParser.ts` — Pure SSE buffer/event parser (testable in isolation)
- `app/nav/chat/_lib/sseStream.ts` — `streamChatMessage()` — fetch + ReadableStream driver
- `app/nav/chat/_hooks/useChatStream.ts` — React hook orchestrating the stream + local state
- `app/nav/chat/_hooks/useChatSession.ts` — react-query wrapper for history load
- `app/nav/chat/_components/MessageBubble.tsx` — Single message rendering (user/assistant only)
- `app/nav/chat/_components/MessageList.tsx` — Renders a message array
- `app/nav/chat/_components/MessageInput.tsx` — TextArea + send/stop button
- `app/nav/chat/_components/ToolLoading.tsx` — "正在查询菜谱库..." banner
- `app/nav/chat/_components/ChatHeader.tsx` — Top bar with back, title, sessions button
- `app/nav/chat/_components/EmptyState.tsx` — Reusable empty state
- `app/nav/chat/_components/SessionListItem.tsx` — Single row in the session list
- `app/nav/chat/page.tsx` — Replace existing; chat main page
- `app/nav/chat/sessions/page.tsx` — Full-screen session list
- `app/nav/chat/_lib/__tests__/sseParser.test.ts` — Unit tests for SSE parser
- `vitest.config.ts` — Vitest configuration at mobile app root
- `apps/mobile/package.json` — Add `vitest` devDep and `test` script

Files modified:
- `apps/mobile/package.json` — add vitest, test script
- `apps/mobile/tsconfig.json` — add `vitest/globals` types

Each unit has one clear responsibility:
- `sseParser` parses bytes into typed events; knows nothing about fetch
- `sseStream` consumes the parser, drives a `fetch` call, returns a stream of events
- `useChatStream` is the React glue — turns events into state transitions
- Components are presentational; they take props and render

---

## Task 1: Add Vitest test framework

**Files:**
- Modify: `apps/mobile/package.json`
- Create: `apps/mobile/vitest.config.ts`

- [ ] **Step 1: Install vitest**

Run from `apps/mobile`:
```bash
cd apps/mobile && pnpm add -D vitest@^2
```
Expected: `vitest` added to `devDependencies` in `apps/mobile/package.json`.

- [ ] **Step 2: Add test script**

Edit `apps/mobile/package.json` — find the `scripts` block and add the `test` entry:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run"
}
```

- [ ] **Step 3: Create vitest config**

Create `apps/mobile/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['app/**/__tests__/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
    },
  },
})
```

- [ ] **Step 4: Verify vitest works**

Run from `apps/mobile`:
```bash
pnpm test
```
Expected: `No test files found` (exit code 0 or vitest's "no tests" message). This confirms vitest is wired up.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/package.json apps/mobile/vitest.config.ts
git commit -m "test: add vitest to mobile app"
```

---

## Task 2: Define chat types

**Files:**
- Create: `apps/mobile/app/nav/chat/_lib/types.ts`

- [ ] **Step 1: Write the types file**

Create `apps/mobile/app/nav/chat/_lib/types.ts`:
```ts
export type ChatRole = 'user' | 'assistant' | 'tool'

export type ChatMessageStatus = 'pending' | 'streaming' | 'complete' | 'failed'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  status: ChatMessageStatus
  toolName?: string
  createdAt: string
}

export interface ChatSession {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface SendMessageRequest {
  content: string
}

export type SseEvent =
  | { kind: 'delta'; text: string }
  | { kind: 'error'; message: string }
  | { kind: 'done' }
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/nav/chat/_lib/types.ts
git commit -m "feat(chat): add chat type definitions"
```

---

## Task 3: SSE parser (pure function with TDD)

**Files:**
- Create: `apps/mobile/app/nav/chat/_lib/sseParser.ts`
- Create: `apps/mobile/app/nav/chat/_lib/__tests__/sseParser.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/mobile/app/nav/chat/_lib/__tests__/sseParser.test.ts`:
```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run from `apps/mobile`:
```bash
pnpm test app/nav/chat/_lib/__tests__/sseParser.test.ts
```
Expected: FAIL — `Cannot find module '../sseParser'`.

- [ ] **Step 3: Implement the parser**

Create `apps/mobile/app/nav/chat/_lib/sseParser.ts`:
```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run from `apps/mobile`:
```bash
pnpm test app/nav/chat/_lib/__tests__/sseParser.test.ts
```
Expected: PASS — 10 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/app/nav/chat/_lib/sseParser.ts apps/mobile/app/nav/chat/_lib/__tests__/sseParser.test.ts
git commit -m "feat(chat): add SSE parser with tests"
```

---

## Task 4: SSE stream driver

**Files:**
- Create: `apps/mobile/app/nav/chat/_lib/sseStream.ts`

This module wraps `fetch` + `ReadableStream` and yields `SseEvent`s. It does not own React state.

- [ ] **Step 1: Write the file**

Create `apps/mobile/app/nav/chat/_lib/sseStream.ts`:
```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/nav/chat/_lib/sseStream.ts
git commit -m "feat(chat): add SSE stream driver"
```

---

## Task 5: `useChatStream` hook

**Files:**
- Create: `apps/mobile/app/nav/chat/_hooks/useChatStream.ts`

- [ ] **Step 1: Write the hook**

Create `apps/mobile/app/nav/chat/_hooks/useChatStream.ts`:
```ts
'use client'

import { useCallback, useRef, useState } from 'react'
import { streamChatMessage } from '../_lib/sseStream'
import type { ChatMessage, SseEvent } from '../_lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ''

function tempId(): string {
  return `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export interface UseChatStream {
  messages: ChatMessage[]
  isStreaming: boolean
  isToolLoading: boolean
  send: (content: string) => void
  stop: () => void
  retry: () => void
  reset: (initial: ChatMessage[]) => void
}

export function useChatStream(sessionId: string): UseChatStream {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isToolLoading, setIsToolLoading] = useState(false)
  const handleRef = useRef<ReturnType<typeof streamChatMessage> | null>(null)
  const lastContentRef = useRef<string | null>(null)
  const assistantIdRef = useRef<string | null>(null)

  const updateAssistant = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }, [])

  const handleEvent = useCallback(
    (id: string, ev: SseEvent) => {
      if (ev.kind === 'delta') {
        setIsToolLoading(false)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id
              ? { ...m, content: m.content + ev.text, status: 'streaming' }
              : m,
          ),
        )
      } else if (ev.kind === 'error') {
        setIsToolLoading(false)
        updateAssistant(id, { status: 'failed' })
      } else if (ev.kind === 'done') {
        setIsToolLoading(false)
        updateAssistant(id, { status: 'complete' })
      }
    },
    [updateAssistant],
  )

  const stop = useCallback(() => {
    handleRef.current?.abort()
    handleRef.current = null
    setIsStreaming(false)
    setIsToolLoading(false)
    if (assistantIdRef.current) {
      updateAssistant(assistantIdRef.current, { status: 'complete' })
      assistantIdRef.current = null
    }
  }, [updateAssistant])

  const send = useCallback(
    (content: string) => {
      if (!content.trim() || !sessionId) return
      lastContentRef.current = content

      const userId = tempId()
      const assistantId = tempId()
      assistantIdRef.current = assistantId
      setMessages((prev) => [
        ...prev,
        { id: userId, role: 'user', content, status: 'complete', createdAt: new Date().toISOString() },
        { id: assistantId, role: 'assistant', content: '', status: 'streaming', createdAt: new Date().toISOString() },
      ])
      setIsStreaming(true)
      setIsToolLoading(true)

      const handle = streamChatMessage({
        baseUrl: API_BASE,
        sessionId,
        body: { content },
        token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
        onEvent: (ev) => {
          if (ev.kind === 'delta') setIsToolLoading(false)
          handleEvent(assistantId, ev)
        },
        onError: () => {
          updateAssistant(assistantId, { status: 'failed' })
        },
      })

      handle.finished.finally(() => {
        handleRef.current = null
        setIsStreaming(false)
        setIsToolLoading(false)
        assistantIdRef.current = null
      })
      handleRef.current = handle
    },
    [sessionId, handleEvent, updateAssistant],
  )

  const retry = useCallback(() => {
    if (lastContentRef.current) send(lastContentRef.current)
  }, [send])

  const reset = useCallback((initial: ChatMessage[]) => {
    stop()
    setMessages(initial)
  }, [stop])

  return { messages, isStreaming, isToolLoading, send, stop, retry, reset }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/nav/chat/_hooks/useChatStream.ts
git commit -m "feat(chat): add useChatStream hook"
```

---

## Task 6: `useChatSession` hook (history loader)

**Files:**
- Create: `apps/mobile/app/nav/chat/_hooks/useChatSession.ts`

- [ ] **Step 1: Write the hook**

Create `apps/mobile/app/nav/chat/_hooks/useChatSession.ts`:
```ts
'use client'

import { useQuery } from '@tanstack/react-query'
import request from '@/common/request'
import type { ChatMessage } from '../_lib/types'

interface MessageListRep {
  page: number
  total: number
  list: Array<{
    id: string
    role: 'user' | 'assistant' | 'tool'
    content: string
    status: 'complete' | 'failed'
    tool_name?: string | null
    created_at: string
  }>
}

export function useChatSession(sessionId: string | null) {
  return useQuery<ChatMessage[]>({
    queryKey: ['chat', 'messages', sessionId],
    enabled: Boolean(sessionId),
    queryFn: async () => {
      if (!sessionId) return []
      const { data } = await request.instance.post<MessageListRep>(
        `/api/chat/sessions/${sessionId}/messages/list`,
        { page: 1, page_size: 200 },
      )
      return data.list
        .filter((m) => m.role !== 'tool')
        .map<ChatMessage>((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          status: m.status === 'complete' ? 'complete' : 'failed',
          toolName: m.tool_name ?? undefined,
          createdAt: m.created_at,
        }))
    },
  })
}
```

Note: we bypass `request.api.*` (the generated client) and call the endpoint via the underlying axios instance because chat endpoints are not yet in `server.ts`. After the user regenerates `server.ts` from OpenAPI, this can be migrated to the typed method.

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/nav/chat/_hooks/useChatSession.ts
git commit -m "feat(chat): add useChatSession history loader"
```

---

## Task 7: `MessageBubble` component

**Files:**
- Create: `apps/mobile/app/nav/chat/_components/MessageBubble.tsx`

- [ ] **Step 1: Write the component**

Create `apps/mobile/app/nav/chat/_components/MessageBubble.tsx`:
```tsx
'use client'

import type { ChatMessage } from '../_lib/types'

interface Props {
  message: ChatMessage
  onRetry?: () => void
}

export function MessageBubble({ message, onRetry }: Props) {
  const isUser = message.role === 'user'
  const isFailed = message.status === 'failed'

  const wrapperClass = `flex w-full mb-3 ${isUser ? 'justify-end' : 'justify-start'}`

  const bubbleClass = isUser
    ? 'max-w-[75%] px-3 py-2 rounded-2xl bg-blue-500 text-white whitespace-pre-wrap break-words'
    : 'max-w-[75%] px-3 py-2 rounded-2xl bg-gray-100 text-gray-900 whitespace-pre-wrap break-words'

  return (
    <div className={wrapperClass}>
      <div>
        <div className={bubbleClass}>{message.content}</div>
        {isFailed && !isUser && (
          <button
            type="button"
            onClick={onRetry}
            className="text-xs text-blue-500 mt-1 px-1"
          >
            重试
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/nav/chat/_components/MessageBubble.tsx
git commit -m "feat(chat): add MessageBubble component"
```

---

## Task 8: `MessageList` component

**Files:**
- Create: `apps/mobile/app/nav/chat/_components/MessageList.tsx`

- [ ] **Step 1: Write the component**

Create `apps/mobile/app/nav/chat/_components/MessageList.tsx`:
```tsx
'use client'

import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../_lib/types'
import { MessageBubble } from './MessageBubble'

interface Props {
  messages: ChatMessage[]
  onRetry?: (messageId: string) => void
}

export function MessageList({ messages, onRetry }: Props) {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto px-3 py-2">
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          message={m}
          onRetry={onRetry ? () => onRetry(m.id) : undefined}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/nav/chat/_components/MessageList.tsx
git commit -m "feat(chat): add MessageList with auto-scroll"
```

---

## Task 9: `ToolLoading` component

**Files:**
- Create: `apps/mobile/app/nav/chat/_components/ToolLoading.tsx`

- [ ] **Step 1: Write the component**

Create `apps/mobile/app/nav/chat/_components/ToolLoading.tsx`:
```tsx
'use client'

export function ToolLoading() {
  return (
    <div className="mx-3 mt-2 mb-1 px-3 py-2 rounded-lg bg-amber-50 text-amber-800 text-sm flex items-center gap-2">
      <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
      正在查询菜谱库...
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/nav/chat/_components/ToolLoading.tsx
git commit -m "feat(chat): add ToolLoading banner"
```

---

## Task 10: `MessageInput` component

**Files:**
- Create: `apps/mobile/app/nav/chat/_components/MessageInput.tsx`

- [ ] **Step 1: Write the component**

Create `apps/mobile/app/nav/chat/_components/MessageInput.tsx`:
```tsx
'use client'

import { TextArea } from 'antd-mobile'
import { useState } from 'react'

interface Props {
  disabled?: boolean
  isStreaming: boolean
  onSend: (content: string) => void
  onStop: () => void
}

export function MessageInput({ disabled, isStreaming, onSend, onStop }: Props) {
  const [value, setValue] = useState('')

  const handleSend = () => {
    const text = value.trim()
    if (!text) return
    onSend(text)
    setValue('')
  }

  return (
    <div className="border-t bg-white p-2 flex items-end gap-2">
      <TextArea
        value={value}
        onChange={(v) => setValue(v)}
        placeholder={disabled ? '请稍候...' : '请输入内容'}
        disabled={disabled}
        autoSize={{ minRows: 1, maxRows: 4 }}
        className="flex-1"
      />
      {isStreaming ? (
        <button
          type="button"
          onClick={onStop}
          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 text-sm"
        >
          停止
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm disabled:opacity-50"
        >
          发送
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/nav/chat/_components/MessageInput.tsx
git commit -m "feat(chat): add MessageInput with send/stop"
```

---

## Task 11: `ChatHeader` component

**Files:**
- Create: `apps/mobile/app/nav/chat/_components/ChatHeader.tsx`

- [ ] **Step 1: Write the component**

Create `apps/mobile/app/nav/chat/_components/ChatHeader.tsx`:
```tsx
'use client'

import { useRouter } from 'next/navigation'

export function ChatHeader() {
  const router = useRouter()
  return (
    <div className="flex items-center justify-between px-3 h-12 border-b bg-white">
      <button
        type="button"
        onClick={() => router.push('/')}
        className="text-sm text-gray-700 px-2 py-1"
        aria-label="back"
      >
        ←
      </button>
      <div className="font-semibold text-base">chat</div>
      <button
        type="button"
        onClick={() => router.push('/nav/chat/sessions')}
        className="text-sm text-gray-700 px-2 py-1"
        aria-label="sessions"
      >
        ☰
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/nav/chat/_components/ChatHeader.tsx
git commit -m "feat(chat): add ChatHeader"
```

---

## Task 12: `EmptyState` component

**Files:**
- Create: `apps/mobile/app/nav/chat/_components/EmptyState.tsx`

- [ ] **Step 1: Write the component**

Create `apps/mobile/app/nav/chat/_components/EmptyState.tsx`:
```tsx
'use client'

interface Props {
  message: string
}

export function EmptyState({ message }: Props) {
  return (
    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
      {message}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/nav/chat/_components/EmptyState.tsx
git commit -m "feat(chat): add EmptyState component"
```

---

## Task 13: `SessionListItem` component

**Files:**
- Create: `apps/mobile/app/nav/chat/_components/SessionListItem.tsx`

- [ ] **Step 1: Write the component**

Create `apps/mobile/app/nav/chat/_components/SessionListItem.tsx`:
```tsx
'use client'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import type { ChatSession } from '../_lib/types'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

interface Props {
  session: ChatSession
  active?: boolean
  onClick: () => void
  onDelete: () => void
}

function formatTime(iso: string): string {
  const d = dayjs(iso)
  const now = dayjs()
  if (now.diff(d, 'day') < 1) return d.format('HH:mm')
  if (now.diff(d, 'day') < 7) return d.fromNow()
  return d.format('YYYY-MM-DD')
}

export function SessionListItem({ session, active, onClick, onDelete }: Props) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 border-b cursor-pointer ${
        active ? 'bg-blue-50' : 'bg-white'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm text-gray-900">{session.title || '新会话'}</div>
        <div className="text-xs text-gray-400 mt-1">{formatTime(session.updatedAt)}</div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="ml-3 text-gray-400 text-sm px-2"
        aria-label="delete"
      >
        ×
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/nav/chat/_components/SessionListItem.tsx
git commit -m "feat(chat): add SessionListItem with relative time"
```

---

## Task 14: Chat main page composition

**Files:**
- Replace: `apps/mobile/app/nav/chat/page.tsx`

- [ ] **Step 1: Read existing page for reference**

Read `apps/mobile/app/nav/chat/page.tsx` and confirm structure. (Skip if no need.)

- [ ] **Step 2: Write the new page**

Replace `apps/mobile/app/nav/chat/page.tsx`:
```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChatHeader } from './_components/ChatHeader'
import { EmptyState } from './_components/EmptyState'
import { MessageInput } from './_components/MessageInput'
import { MessageList } from './_components/MessageList'
import { ToolLoading } from './_components/ToolLoading'
import { useChatSession } from './_hooks/useChatSession'
import { useChatStream } from './_hooks/useChatStream'
import type { ChatMessage } from './_lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ''

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryId = searchParams.get('session')
  const [sessionId, setSessionId] = useState<string | null>(queryId)

  // Persist + restore active session
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (queryId) {
      sessionStorage.setItem('chat:activeSessionId', queryId)
      setSessionId(queryId)
      return
    }
    const stored = sessionStorage.getItem('chat:activeSessionId')
    if (stored) {
      router.replace(`/nav/chat?session=${stored}`)
      return
    }
    void createSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryId])

  async function createSession() {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_BASE}/api/chat/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify({}),
    })
    const json = await res.json()
    if (json?.data?.id) {
      sessionStorage.setItem('chat:activeSessionId', json.data.id)
      router.replace(`/nav/chat?session=${json.data.id}`)
    }
  }

  const history = useChatSession(sessionId)
  const { messages, isStreaming, isToolLoading, send, stop, retry, reset } = useChatStream(sessionId ?? '')

  // Hydrate local stream state when history loads
  useEffect(() => {
    if (history.data && messages.length === 0) {
      reset(history.data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.data])

  const handleRetry = (_id: string) => retry()

  return (
    <div className="flex flex-col h-full bg-white">
      <ChatHeader />
      {isToolLoading && <ToolLoading />}
      {messages.length === 0 ? (
        <EmptyState message="开始聊天吧" />
      ) : (
        <MessageList messages={messages} onRetry={handleRetry} />
      )}
      <MessageInput
        disabled={!sessionId}
        isStreaming={isStreaming}
        onSend={send}
        onStop={stop}
      />
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run from `apps/mobile`:
```bash
pnpm tsc --noEmit
```
Expected: no errors related to the new files. Fix any reported issues.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/app/nav/chat/page.tsx
git commit -m "feat(chat): rewrite chat page to use backend API"
```

---

## Task 15: Sessions list page

**Files:**
- Create: `apps/mobile/app/nav/chat/sessions/page.tsx`

- [ ] **Step 1: Write the page**

Create `apps/mobile/app/nav/chat/sessions/page.tsx`:
```tsx
'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { EmptyState } from '../_components/EmptyState'
import { SessionListItem } from '../_components/SessionListItem'
import type { ChatSession } from '../_lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ''

interface SessionListRep {
  page: number
  total: number
  list: Array<{
    id: string
    title: string
    created_at: string
    updated_at: string
  }>
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

async function fetchSessions(): Promise<ChatSession[]> {
  const res = await fetch(`${API_BASE}/api/chat/sessions/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: getToken()! } : {}),
    },
    body: JSON.stringify({ page: 1, page_size: 100 }),
  })
  const json = await res.json()
  const rep = json.data as SessionListRep
  return rep.list.map((s) => ({
    id: s.id,
    title: s.title,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  }))
}

async function createSessionApi(): Promise<ChatSession> {
  const res = await fetch(`${API_BASE}/api/chat/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: getToken()! } : {}),
    },
    body: JSON.stringify({}),
  })
  const json = await res.json()
  return {
    id: json.data.id,
    title: json.data.title,
    createdAt: json.data.created_at,
    updatedAt: json.data.updated_at,
  }
}

async function deleteSessionApi(id: string): Promise<void> {
  await fetch(`${API_BASE}/api/chat/sessions/${id}`, {
    method: 'DELETE',
    headers: {
      ...(getToken() ? { Authorization: getToken()! } : {}),
    },
  })
}

export default function SessionsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const activeId = typeof window !== 'undefined'
    ? sessionStorage.getItem('chat:activeSessionId')
    : null

  const { data: sessions = [] } = useQuery({
    queryKey: ['chat', 'sessions'],
    queryFn: fetchSessions,
  })

  const create = useMutation({
    mutationFn: createSessionApi,
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'sessions'] })
      sessionStorage.setItem('chat:activeSessionId', session.id)
      router.push(`/nav/chat?session=${session.id}`)
    },
  })

  const remove = useMutation({
    mutationFn: deleteSessionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'sessions'] })
    },
  })

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center px-3 h-12 border-b">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-700 px-2 py-1"
        >
          ←
        </button>
        <div className="flex-1 text-center font-semibold">会话</div>
        <div className="w-10" />
      </div>

      {sessions.length === 0 ? (
        <EmptyState message="暂无会话" />
      ) : (
        <div className="flex-1 overflow-y-auto">
          {sessions.map((s) => (
            <SessionListItem
              key={s.id}
              session={s}
              active={s.id === activeId}
              onClick={() => {
                sessionStorage.setItem('chat:activeSessionId', s.id)
                router.push(`/nav/chat?session=${s.id}`)
              }}
              onDelete={() => remove.mutate(s.id)}
            />
          ))}
        </div>
      )}

      <div className="p-3 border-t">
        <button
          type="button"
          onClick={() => create.mutate()}
          className="w-full py-3 rounded-lg bg-blue-500 text-white"
        >
          + 新建会话
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run from `apps/mobile`:
```bash
pnpm tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/app/nav/chat/sessions/page.tsx
git commit -m "feat(chat): add sessions list page"
```

---

## Task 16: Delete old `@ant-design/x` chat deps and run all checks

**Files:**
- Modify: `apps/mobile/package.json` (remove unused deps if any)
- Verify: existing tests still pass

- [ ] **Step 1: Run all unit tests**

From `apps/mobile`:
```bash
pnpm test
```
Expected: all 10 SSE parser tests pass.

- [ ] **Step 2: Type check**

From `apps/mobile`:
```bash
pnpm tsc --noEmit
```
Expected: clean exit.

- [ ] **Step 3: Lint**

From `apps/mobile`:
```bash
pnpm lint
```
Expected: no new errors. Fix any reported issues.

- [ ] **Step 4: Build**

From `apps/mobile`:
```bash
pnpm build
```
Expected: successful Next.js build. Address any new errors.

- [ ] **Step 5: Commit any fixes**

If you made any changes in this task, commit them.

---

## Task 17: Manual end-to-end smoke test

**Files:** none (verification only)

- [ ] **Step 1: Start backend**

In `eat-be/`:
```bash
cargo run
```
Expected: backend listening on the port configured in `Rocket.toml` (likely 8088).

- [ ] **Step 2: Start mobile app**

In `apps/mobile/`:
```bash
pnpm dev
```
Expected: Next.js dev server on `http://localhost:3000`.

- [ ] **Step 3: Open the chat page**

Navigate to `http://localhost:3000/nav/chat`. Verify:
- Page loads without errors
- A session is auto-created and the URL updates to `?session=...`
- The chat input is enabled and the header is rendered

- [ ] **Step 4: Send a message**

Type "你好" and click send. Verify:
- The user message appears
- The "正在查询菜谱库..." banner may flash (if a tool is called)
- The assistant message streams in character-by-character (or in chunks)
- The message ends and the send button re-appears

- [ ] **Step 5: Open sessions list**

Click the ☰ button in the header. Verify:
- The new session appears in the list
- Clicking it returns to the chat and loads the history
- Delete (×) removes the session and the list updates

- [ ] **Step 6: Refresh the page**

Hard refresh on the chat URL `?session=...`. Verify:
- The page reloads with the existing session
- The history is loaded from the backend
- The streaming state is reset (not actively sending)

- [ ] **Step 7: Commit final fixes**

If you found and fixed any issues during smoke testing, commit them with `fix:` prefix.

---

## Self-Review

**Spec coverage:**
- ✅ Replace DashScope with `/api/chat/...` → Tasks 5, 14, 15
- ✅ Multi-session support → Tasks 6, 13, 15
- ✅ SSE streaming → Tasks 3, 4, 5
- ✅ Tool messages hidden + ToolLoading banner → Tasks 5, 9, 14
- ✅ Full-screen sessions list → Task 15
- ✅ Remove hardcoded API key → Tasks 14, 15 (no key in client code)
- ✅ antd-mobile + react-query style → Tasks 6, 7–13
- ✅ Routing with `?session={id}` and `sessionStorage` → Task 14
- ✅ Error handling (network/401/abort/parse) → Tasks 5, 14
- ✅ Unit tests for SSE parser → Task 3
- ✅ Manual e2e → Task 17

**Placeholder scan:** No "TBD" / "TODO" / "fill in later" / "similar to" in any task.

**Type consistency:** `ChatMessage`, `ChatRole`, `ChatMessageStatus`, `ChatSession`, `SendMessageRequest`, `SseEvent` are defined once in Task 2 and used unchanged in Tasks 3–7, 14–15. `useChatStream` returns `{ messages, isStreaming, isToolLoading, send, stop, retry, reset }` — the page consumes the same names.
