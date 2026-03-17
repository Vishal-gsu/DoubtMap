'use client';

import ReactMarkdown from 'react-markdown';
import { UIMessage } from '@/lib/types';
import { ConfidenceBadge } from './ConfidenceBadge';
import { Badge } from '@/components/ui/badge';

interface MessageBubbleProps {
  message: UIMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm'
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="text-sm">
            {message.mode === 'socratic' && (
              <span className="text-base mr-1">🤔</span>
            )}
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                code: ({ children }) => (
                  <code className="bg-background/50 rounded px-1 py-0.5 text-xs font-mono">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-background/50 rounded p-3 mt-2 mb-2 overflow-x-auto text-xs font-mono">
                    {children}
                  </pre>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>

            {/* Meta info */}
            {(message.confidence !== undefined || (message.sources && message.sources.length > 0)) && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {message.confidence !== undefined && (
                  <ConfidenceBadge confidence={message.confidence} />
                )}
                {message.sources?.map((src) => (
                  <Badge key={src} variant="outline" className="text-xs">
                    {src}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
