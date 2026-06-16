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
