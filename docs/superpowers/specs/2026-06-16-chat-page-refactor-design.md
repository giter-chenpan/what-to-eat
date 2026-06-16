# Chat Page Refactor — Design Spec

**Date**: 2026-06-16
**Status**: Approved (pending user spec review)
**Author**: Brainstorming session

## Background

The current chat page (`apps/mobile/app/nav/chat/page.tsx`) calls the DashScope API directly from the client with a hardcoded API key. The backend (`eat-be`) now exposes a full chat API with session persistence, message history, and SSE streaming with tool calls. The page must be redesigned to use the new backend.

## Goals

- Replace the direct DashScope integration with calls to `/api/chat/...`
- Support multiple chat sessions with persistent history
- Use SSE streaming for assistant responses (`delta` chunks)
- Hide intermediate `tool` messages but show a "正在查询菜谱库..." indicator
- Provide a full-screen session list page (modal-style)
- Remove the hardcoded API key from client code (security fix)
- Match the existing `antd-mobile` + `@tanstack/react-query` style used elsewhere in the app

## Non-Goals

- Real-time multi-device sync (out of scope)
- Voice / image input (out of scope — TextArea only)
- Re-generating `packages/request/server.ts` (handled separately; the page will call fetch directly to consume the SSE stream, since the generated client is not streaming-friendly)
- Replacing the current home/mine/translation pages

## Backend API (from `eat-be/src/api/chat.rs`)

### Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/chat/sessions` | Create session (body: `{title?}`) |
| POST | `/api/chat/sessions/list` | List sessions (body: `{page?, page_size?}`) |
| GET | `/api/chat/sessions/{id}` | Get one session |
| DELETE | `/api/chat/sessions/{id}` | Delete session |
| POST | `/api/chat/sessions/{id}/messages/list` | List messages in session (body: `{page?, page_size?}`) |
| POST | `/api/chat/sessions/{id}/messages` | SSE stream send (body: `{content}`) |

### SSE Event Format

The streaming endpoint emits text/event-stream with payloads of three shapes:

| Payload | Meaning |
|---------|---------|
| `data: {"delta":"..."}` | Append `delta` to current assistant message |
| `data: {"error":"..."}` | Stream error; mark current message as failed |
| `data: [DONE]` | End of stream |

### DTOs

```ts
type ChatSessionDto = {
  id: string
  title: string
  created_at: string  // ISO 8601
  updated_at: string
}

type ChatMessageDto = {
  id: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  status: 'complete' | 'failed'  // (and 'pending'/'streaming' for client-side state)
  tool_call_id?: string
  tool_name?: string
  tool_args?: string
  created_at: string
}
```

## Architecture

### File Layout

```
apps/mobile/app/nav/chat/
├── page.tsx                       # Chat main page (replaces current)
├── sessions/
│   └── page.tsx                   # Full-screen session list
└── _components/
    ├── ChatHeader.tsx
    ├── MessageList.tsx
    ├── MessageBubble.tsx
    ├── MessageInput.tsx
    ├── ToolLoading.tsx
    ├── SessionListItem.tsx
    └── EmptyState.tsx
└── _hooks/
    ├── useChatStream.ts           # SSE streaming core
    └── useChatSession.ts          # Current session local state
```

The `_components/` and `_hooks/` folders use the underscore prefix so Next.js does not treat them as routes.

### Component Responsibilities

- **page.tsx (chat)**: combines `useChatStream`, `useChatSession`, and the components; no data work
- **page.tsx (sessions)**: list of sessions, new/delete actions
- **ChatHeader**: back button (chat → home), title, sessions button
- **MessageList**: renders all messages for the current session; v1 does not use virtualization (acceptable for ≤200 messages)
- **MessageBubble**: user/assistant bubble; tool messages are filtered out
- **MessageInput**: `TextArea` + send/stop button
- **ToolLoading**: small banner "正在查询菜谱库..." — shown when SSE sent a tool-related event but no `delta` yet
- **SessionListItem**: title, relative time, delete action
- **EmptyState**: used when no messages / no sessions

### Hook Responsibilities

- **useChatStream(sessionId)**: encapsulates SSE streaming, exposes `{ messages, isStreaming, isToolLoading, send, stop, retry }`
- **useChatSession**: thin wrapper around `useQuery` to load history for the active session

## Data Flow

### Routing

- `/nav/chat?session={id}` — chat page; if no `session` query param, auto-create on mount and replace URL
- `/nav/chat/sessions` — full-screen session list
- Active session id persisted in `sessionStorage` under key `chat:activeSessionId`

### State Management

- **Sessions list** → `useQuery(['chat', 'sessions'])` (cached 30s, refetch on focus)
- **Messages for a session** → `useQuery(['chat', 'messages', sessionId])` — initial history load
- **Live streaming messages** → local `useState` in `useChatStream`, **not** in react-query (transient)
- After stream completes, refetch `['chat', 'messages', sessionId]` to sync server state
- After session created/deleted, refetch `['chat', 'sessions']`

### Streaming Flow

1. User types in `MessageInput` and clicks send
2. `useChatStream.send(content)`:
   - Append optimistic `user` message to local state
   - Append empty `assistant` message with `status: 'streaming'`
   - `fetch('/api/chat/sessions/{id}/messages', { method: 'POST', body: {content}, signal })` with `AbortController`
   - Read response body via `response.body.getReader()`, decode UTF-8 chunks
   - Buffer chunks, split on `\n\n` to get events
   - For each `data: <json>` line, parse and:
     - `delta` → append to current assistant message
     - `error` → set message `status: 'failed'`, surface Toast
     - `[DONE]` → close stream
   - On end: set `isStreaming: false`, mark assistant as `complete` (or `failed` if error)
3. User can click stop → `abortRef.current.abort()`; partial content is preserved

## SSE Parsing Detail

```ts
// pseudo-code
const reader = response.body!.getReader()
const decoder = new TextDecoder()
let buffer = ''

while (true) {
  const { value, done } = await reader.read()
  if (done) break
  buffer += decoder.decode(value, { stream: true })
  let idx
  while ((idx = buffer.indexOf('\n\n')) !== -1) {
    const event = buffer.slice(0, idx)
    buffer = buffer.slice(idx + 2)
    handleEvent(event)
  }
}

function handleEvent(event: string) {
  const line = event.split('\n').find(l => l.startsWith('data:'))
  if (!line) return
  const payload = line.slice(5).trim()
  if (payload === '[DONE]') { closeStream(); return }
  try {
    const json = JSON.parse(payload)
    if (json.delta) appendToAssistant(json.delta)
    else if (json.error) failAssistant(json.error)
  } catch { /* ignore malformed */ }
}
```

## UI Details

### Chat Page Layout

```
┌─────────────────────────┐
│ [←] chat       [≡]      │  ChatHeader
├─────────────────────────┤
│ ┌─ ToolLoading ───────┐ │  (only visible when tool in flight)
│ │ 正在查询菜谱库...    │ │
│ └────────────────────┘ │
│                         │
│         [user msg]      │
│ [assistant msg...]      │
│                         │
│                         │
├─────────────────────────┤
│ [textarea]      [send]  │  MessageInput
└─────────────────────────┘
```

### Sessions Page Layout

```
┌─────────────────────────┐
│ [←] 会话                │  NavBar
├─────────────────────────┤
│ 会话 A    今天 14:30 [×]│  SessionListItem
│ 会话 B    昨天 10:00 [×]│
│ 会话 C    3 天前   [×] │
│                         │
│     + 新建会话          │  CTA at bottom
└─────────────────────────┘
```

### Message Bubble Styles

- **user**: right-aligned, primary color background
- **assistant**: left-aligned, neutral background, markdown rendered
- **tool**: not rendered

## Error Handling

| Scenario | Handling |
|----------|----------|
| Network failure mid-stream | Mark assistant `status: 'failed'`, show inline retry button |
| User aborts (stop button) | Keep partial content, mark `status: 'complete'`, no error |
| Backend `error` event | `Toast.show({icon: 'fail', content})` + mark failed |
| 401 (unauthenticated) | Redirect to login (existing app pattern) |
| Session not found (404) | Clear `sessionStorage`, create new session, replace URL |
| SSE parse error | Skip malformed event, log to console, do not abort stream |

## API Client Strategy

The streaming endpoint is consumed via raw `fetch` (not `@repo/request`), because:
1. The generated client uses axios and is not streaming-friendly
2. SSE needs `response.body.getReader()` for incremental parsing
3. After the stream completes, history is refetched through `useQuery` (can use generated client or `fetch`)

For non-streaming endpoints (sessions CRUD, history list), use `fetch` directly with the same base URL. Once the backend is running and `gen.js` is regenerated, the generated client can be adopted for non-streaming calls — but raw `fetch` is the source of truth for now.

The base URL is read from `process.env.NEXT_PUBLIC_API_BASE` (matches existing app pattern).

## Testing Strategy

- **Unit tests** for `useChatStream` SSE parser (mock `fetch`, feed scripted chunks, assert state transitions)
- **Snapshot tests** for `MessageBubble`, `SessionListItem`, `EmptyState`
- **Manual end-to-end**: create session, send message, see streaming, refresh to confirm history, delete session, network-off retry

## Open Questions

None — all design decisions approved in brainstorming session.

## Out of Scope (Future Work)

- Real-time updates across devices
- File / image attachments
- Voice input
- Re-generating `packages/request/server.ts` to include chat endpoints (separate task)
- E2E test infrastructure (Playwright / Detox)

## Risks

- **SSE parser must be correct**: malformed chunks must not crash the stream. Mitigated by `try/catch` per event.
- **Race conditions** when user sends multiple messages quickly. Mitigated by `AbortController` per send; previous in-flight request is aborted.
- **Message list scalability**: v1 renders all messages without virtualization. The backend caps `page_size` at 200; if perf becomes an issue, add a virtualized list (e.g., `react-window`) and implement windowed pagination.
