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
  const activeId =
    typeof window !== 'undefined'
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
