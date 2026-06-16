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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ''

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryId = searchParams.get('session')
  const [sessionId, setSessionId] = useState<string | null>(queryId)

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
  const { messages, isStreaming, isToolLoading, send, stop, retry, reset } =
    useChatStream(sessionId ?? '')

  useEffect(() => {
    if (history.data && messages.length === 0) {
      reset(history.data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.data])

  const handleRetry = () => retry()

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
