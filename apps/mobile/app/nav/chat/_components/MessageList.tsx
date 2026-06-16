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
