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
