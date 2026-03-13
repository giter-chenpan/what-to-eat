"use client"

import { SyncOutlined } from '@ant-design/icons';
import type { BubbleListProps } from '@ant-design/x';
import { Bubble, Sender } from '@ant-design/x';
import XMarkdown from '@ant-design/x-markdown';
import {
  DefaultChatProvider,
  MessageInfo,
  useXChat,
  XRequest,
} from '@ant-design/x-sdk';
import { Button, Flex, Tooltip } from 'antd';
import React from 'react';

/**
 * 🔔 请替换 BASE_URL、PATH、MODEL、API_KEY 为您自己的值
 * 🔔 Please replace the BASE_URL, PATH, MODEL, API_KEY with your own values.
 */

// const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const BASE_URL = 'https://dashscope.aliyuncs.com/api/v1/apps/fd922815c2a14ffcb09f3e89e9e55495/completion';


/**
 * 🔔 当前请求中 MODEL 是固定的，请替换为您自己的 BASE_URL 和 MODEL
 * 🔔 The MODEL is fixed in the current request, please replace it with your BASE_URL and MODEL
 */

// const MODEL = 'qwen3.5-flash';

// 消息角色配置：定义助手和用户消息的布局和渲染方式
// Message role configuration: define layout and rendering for assistant and user messages
const role: BubbleListProps['role'] = {
  assistant: {
    placement: 'start',
    contentRender(content: string) {
      // 双 '\n' 在markdown中会被解析为新段落，因此需要替换为单个 '\n'
      // Double '\n' in a mark will causes markdown parse as a new paragraph, so we need to replace it with a single '\n'
      const newContent = content.replace(/\n\n/g, '<br/><br/>');
      return <XMarkdown content={newContent} />;
    },
  },
  user: {
    placement: 'end',
  },
};

const App = () => {
  const [content, setContent] = React.useState('');
  const [sessionId, setSessionId] = React.useState<string>();

  // 创建数据提供者：使用 XRequest 并覆盖 transformMessage 以适配 DashScope App API
  const [provider] = React.useState(() => {
    const p = new DefaultChatProvider({
      request: XRequest(BASE_URL, {
        manual: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-104958068f6e48b2bcf04c266b326d9e',
        },
        callbacks: {
          onSuccess: (chunks: any[]) => {
            const lastChunk = chunks?.[chunks.length - 1];
            if (lastChunk?.output?.session_id) {
              setSessionId(lastChunk.output.session_id);
            }
          },
          onError: function (error: Error, errorInfo?: any, responseHeaders?: Headers, fallbackMsg?: MessageInfo<any> | undefined): void {
            throw new Error('Function not implemented.');
          }
        },
      }),
    });

    // 适配 DashScope App API 的返回格式
    p.transformMessage = (info: any) => {
      return {
        role: 'assistant',
        content: info.chunk?.output?.text || info.chunks?.[info.chunks?.length - 1]?.output?.text || '',
      };
    };

    // 适配用户消息的本地显示格式
    p.transformLocalMessage = (params: any) => {
      return {
        role: 'user',
        content: params.input?.prompt || '',
      };
    };

    return p;
  });

  // 聊天消息管理：处理消息列表、历史消息、错误处理等
  // Chat message management: handle message list, historical messages, error handling, etc.
  const {
    onRequest,
    messages,
    isRequesting,
    abort,
    onReload,
  } = useXChat({
    provider,
  
    requestFallback: (_, { error, errorInfo, messageInfo }) => {
      // 请求失败时的回退处理：区分中止错误和其他错误
      // Fallback handling for request failure: distinguish between abort error and other errors
      if (error.name === 'AbortError') {
        return {
          content: messageInfo?.message?.content ,
          role: 'assistant',
        };
      }
      return {
        content: errorInfo?.error?.message || '',
        role: 'assistant',
      };
    },
    requestPlaceholder: () => {
      // 请求占位符：在等待响应时显示等待消息
      // Request placeholder: display waiting message while waiting for response
      return {
        content: "等待中。。。",
        role: 'assistant',
      };
    },
  });


  return (
    <Flex vertical gap="middle" className="h-[calc(100%-120px)] p-2 justify-end">
    
      
      {/* 消息列表：显示所有聊天消息，包括历史消息 */}
      {/* Message list: display all chat messages, including historical messages */}
      <Bubble.List
       
        role={role}
        items={messages.map(({ id, message, status }) => ({
          key: id,
          role: message.role,
          status: status,
          loading: status === 'loading',
          content: message.content,
          // 为助手消息添加重试按钮
          // Add retry button for assistant messages
          components:
            message.role === 'assistant'
              ? {
                  footer: (
                    <Tooltip title={'重试'}>
                      <Button
                        size="small"
                        type="text"
                        icon={<SyncOutlined />}
                        style={{ marginInlineEnd: 'auto' }}
                        onClick={() =>
                          onReload(id, {
                            userAction: 'retry',
                          })
                        }
                      />
                    </Tooltip>
                  ),
                }
              : {},
        }))}
      />
      <div className="w-full fixed bottom-[66px] p-2  left-0 ">

      
      <Sender
        loading={isRequesting}
        value={content}
        onCancel={() => {
          abort();
        }}
        onChange={setContent}
        placeholder={'请输入内容'}
        
        onSubmit={(nextContent) => {
          onRequest({
            input: {
              prompt: nextContent,
              session_id: sessionId,
            },
          });
          setContent('');
        }}
      />
      </div>
    </Flex>
  );
};

export default App;