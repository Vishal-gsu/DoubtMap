'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import api from '@/lib/api';
import { ChatMessage } from '@/lib/types';
import { mockHistory } from '@/lib/mockData';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { Badge } from '@/components/ui/badge';

export default function HistoryPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const { data } = await api.get(`/chat/history?user_id=${user.id}&limit=50`);
        setMessages(data.messages);
      } catch {
        setMessages(mockHistory);
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-bold mb-1">Doubt History</h1>
      <p className="text-sm text-muted-foreground mb-6">All your past questions and AI responses</p>

      {loading && <LoadingSpinner text="Loading history..." />}
      {error && <ErrorAlert message={error} />}

      {!loading && messages.length === 0 && (
        <p className="text-sm text-muted-foreground">No history yet. Ask your first doubt!</p>
      )}

      <div className="space-y-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className="rounded-lg border border-border overflow-hidden"
          >
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/30 transition-colors"
              onClick={() => setExpanded(expanded === m.id ? null : m.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{m.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {m.topic} •{' '}
                  {new Date(m.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge
                variant={m.confidence >= 0.8 ? 'default' : m.confidence >= 0.6 ? 'secondary' : 'destructive'}
                className="text-xs shrink-0"
              >
                {Math.round(m.confidence * 100)}%
              </Badge>
            </button>

            {expanded === m.id && (
              <div className="border-t border-border px-4 py-3 bg-muted/30 text-sm">
                <p className="font-medium mb-1">AI Response:</p>
                <p className="text-muted-foreground">{m.response}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
