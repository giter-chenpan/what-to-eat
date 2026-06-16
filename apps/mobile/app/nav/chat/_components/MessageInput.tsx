'use client'

import { Sender } from '@ant-design/x'
import { useState } from 'react'

interface Props {
  disabled?: boolean
  isStreaming: boolean
  onSend: (content: string) => void
  onStop: () => void
}

export function MessageInput({ disabled, isStreaming, onSend, onStop }: Props) {
  const [value, setValue] = useState('')

  return (
    <Sender
      value={value}
      onChange={setValue}
      loading={isStreaming}
      disabled={disabled}
      placeholder={disabled ? '请稍候...' : '请输入内容'}
      onCancel={onStop}
      onSubmit={(next) => {
        onSend(next)
        setValue('')
      }}
    />
  )
}
