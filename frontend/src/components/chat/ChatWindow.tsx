'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UIMessage } from '@/lib/types';
import { MessageBubble } from './MessageBubble';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface ChatWindowProps {
  messages: UIMessage[];
  loading: boolean;
}

export function ChatWindow({ messages, loading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <ScrollArea className="flex-1 px-4 py-2">
      {messages.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-full py-16 text-center text-muted-foreground">
          <p className="text-4xl mb-3">💬</p>
          <p className="font-medium">Ask a doubt from your syllabus</p>
          <p className="text-sm mt-1">
            Switch between Socratic and Direct Answer modes above
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {loading && (
        <div className="flex justify-start mb-4">
          <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
            <LoadingSpinner size="sm" text="Thinking..." />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </ScrollArea>
  );
}
