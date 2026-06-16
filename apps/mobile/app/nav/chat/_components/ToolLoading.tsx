'use client'

export function ToolLoading() {
  return (
    <div className="mx-3 mt-2 mb-1 px-3 py-2 rounded-lg bg-amber-50 text-amber-800 text-sm flex items-center gap-2">
      <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
      正在查询菜谱库...
    </div>
  )
}
