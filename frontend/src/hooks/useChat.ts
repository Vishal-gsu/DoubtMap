'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import api from '@/lib/api';
import { UIMessage } from '@/lib/types';

export function useChat() {
  const { user } = useUser();
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (message: string, subject: string, mode: 'socratic' | 'direct') => {
      if (!message.trim()) return;

      const userMsg: UIMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: message,
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      setError(null);

      try {
        const { data } = await api.post('/chat/ask', {
          user_id: user?.id ?? 'anonymous',
          message,
          subject,
          mode,
        });

        const aiMsg: UIMessage = {
          id: `a-${Date.now()}`,
          role: 'ai',
          content: data.response,
          confidence: data.confidence,
          sources: data.sources ?? [],
          mode: data.mode,
          topic: data.topic_detected,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch {
        setError('Failed to get a response. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, loading, error, sendMessage, clearMessages };
}
