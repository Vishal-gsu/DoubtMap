'use client';

import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatInput } from '@/components/chat/ChatInput';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { SUBJECTS, CHAT_MODES } from '@/lib/constants';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ChatPage() {
  const { messages, loading, error, sendMessage } = useChat();
  const [mode, setMode] = useState<'socratic' | 'direct'>('socratic');
  const [subject, setSubject] = useState(SUBJECTS[0]);

  const handleSend = (message: string) => {
    sendMessage(message, subject, mode);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 border-b border-border px-4 py-2.5">
        <Select value={subject} onValueChange={(v) => v && setSubject(v)}>
          <SelectTrigger className="w-48 h-8 text-sm">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {SUBJECTS.map((s) => (
              <SelectItem key={s} value={s} className="text-sm">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <Label htmlFor="mode-toggle" className="text-sm text-muted-foreground">
            {mode === 'socratic' ? '🤔 Socratic Mode' : '💡 Direct Answer'}
          </Label>
          <Switch
            id="mode-toggle"
            checked={mode === 'direct'}
            onCheckedChange={(checked) => setMode(checked ? 'direct' : 'socratic')}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 pt-3">
          <ErrorAlert message={error} />
        </div>
      )}

      {/* Chat area */}
      <ChatWindow messages={messages} loading={loading} />
      <ChatInput onSend={handleSend} disabled={loading} />
    </div>
  );
}
