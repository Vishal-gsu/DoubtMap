'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import api from '@/lib/api';
import { EscalatedDoubt } from '@/lib/types';
import { mockEscalations } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

export default function EscalationsPage() {
  const { user } = useUser();
  const [doubts, setDoubts] = useState<EscalatedDoubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/doubts/escalated');
        setDoubts(data.doubts);
      } catch {
        setDoubts(mockEscalations);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleRespond = async (doubtId: string) => {
    const text = responses[doubtId]?.trim();
    if (!text) return;
    setSubmitting(doubtId);
    try {
      await api.post(`/doubts/escalated/${doubtId}/respond`, {
        professor_id: user?.id,
        response: text,
      });
      setResolved((prev) => new Set(prev).add(doubtId));
    } catch {
      setError('Failed to submit response. Please try again.');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="p-6 max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-bold mb-1">Escalated Doubts</h1>
        <p className="text-sm text-muted-foreground">Questions the AI couldn't answer confidently</p>
      </div>

      {error && <ErrorAlert message={error} />}
      {loading && <LoadingSpinner text="Loading escalations..." />}
      {!loading && doubts.length === 0 && (
        <p className="text-sm text-muted-foreground">No escalated doubts. All good!</p>
      )}

      {doubts.map((d) => {
        const isResolved = resolved.has(d.id) || d.professor_response !== null;
        return (
          <Card
            key={d.id}
            className={isResolved ? 'border-green-500/40 bg-green-500/5' : ''}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <CardTitle className="text-base">{d.topic}</CardTitle>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {d.student_count} student{d.student_count !== 1 && 's'}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{d.message}</p>
            </CardHeader>
            <CardContent>
              {isResolved ? (
                <div className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                  <Badge className="bg-green-600 text-white text-xs">Responded</Badge>
                  <span>{d.professor_response ?? responses[d.id]}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-h-[80px] resize-none"
                    placeholder="Type your response to students..."
                    value={responses[d.id] ?? ''}
                    onChange={(e) =>
                      setResponses((prev) => ({ ...prev, [d.id]: e.target.value }))
                    }
                  />
                  <Button
                    size="sm"
                    disabled={!responses[d.id]?.trim() || submitting === d.id}
                    onClick={() => handleRespond(d.id)}
                  >
                    {submitting === d.id ? (
                      <LoadingSpinner size="sm" text="Submitting..." />
                    ) : (
                      'Submit Response'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
