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
