'use client'

import { TextArea } from 'antd-mobile'
import { useState } from 'react'

interface Props {
  disabled?: boolean
  isStreaming: boolean
  onSend: (content: string) => void
  onStop: () => void
}

export function MessageInput({ disabled, isStreaming, onSend, onStop }: Props) {
  const [value, setValue] = useState('')

  const handleSend = () => {
    const text = value.trim()
    if (!text) return
    onSend(text)
    setValue('')
  }

  return (
    <div className="border-t bg-white p-2 flex items-end gap-2">
      <TextArea
        value={value}
        onChange={(v) => setValue(v)}
        placeholder={disabled ? '请稍候...' : '请输入内容'}
        disabled={disabled}
        autoSize={{ minRows: 1, maxRows: 4 }}
        className="flex-1"
      />
      {isStreaming ? (
        <button
          type="button"
          onClick={onStop}
          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 text-sm"
        >
          停止
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm disabled:opacity-50"
        >
          发送
        </button>
      )}
    </div>
  )
}
