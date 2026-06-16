'use client'

import { useQuery } from '@tanstack/react-query'
import type { ChatMessageDto } from '@repo/request'
import request from '@/common/request'
import type { ChatMessage } from '../_lib/types'

export function useChatSession(sessionId: string | null) {
  return useQuery<ChatMessage[]>({
    queryKey: ['chat', 'messages', sessionId],
    enabled: Boolean(sessionId),
    queryFn: async () => {
      if (!sessionId) return []
      const { data } = await request.api.apiChatListMessages(sessionId, {
        page: 1,
        page_size: 200,
      })
      if (!data) return []
      return data.list
        .filter((m: ChatMessageDto) => m.role !== 'tool')
        .map<ChatMessage>((m) => ({
          id: m.id,
          role: m.role as ChatMessage['role'],
          content: m.content,
          status: m.status === 'complete' ? 'complete' : 'failed',
          toolName: m.tool_name ?? undefined,
          createdAt: m.created_at,
        }))
    },
  })
}
