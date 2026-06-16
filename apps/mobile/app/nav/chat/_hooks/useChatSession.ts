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
