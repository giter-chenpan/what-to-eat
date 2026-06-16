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
