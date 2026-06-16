'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import type { ChatSessionDto } from '@repo/request'
import request from '@/common/request'
import { EmptyState } from '../_components/EmptyState'
import { SessionListItem } from '../_components/SessionListItem'
import type { ChatSession } from '../_lib/types'

function toChatSession(s: ChatSessionDto): ChatSession {
  return {
    id: s.id,
    title: s.title,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  }
}

export default function SessionsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const activeId =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('chat:activeSessionId')
      : null

  const { data: sessions = [] } = useQuery({
    queryKey: ['chat', 'sessions'],
    queryFn: async () => {
      const { data } = await request.api.apiChatListSessions({
        page: 1,
        page_size: 100,
      })
      return data?.list.map(toChatSession) ?? []
    },
  })

  const create = useMutation({
    mutationFn: async () => {
      const { data } = await request.api.apiChatCreateSession({})
      if (!data) throw new Error('create session failed')
      return toChatSession(data)
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'sessions'] })
      sessionStorage.setItem('chat:activeSessionId', session.id)
      router.push(`/nav/chat?session=${session.id}`)
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => request.api.apiChatDeleteSession(id),
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
