import { Syllabus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

interface SyllabusListProps {
  syllabi: Syllabus[];
}

const statusVariant: Record<Syllabus['status'], 'default' | 'secondary' | 'destructive'> = {
  indexed: 'default',
  processing: 'secondary',
  failed: 'destructive',
};

export function SyllabusList({ syllabi }: SyllabusListProps) {
  if (syllabi.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No syllabi uploaded yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {syllabi.map((s) => (
        <div
          key={s.id}
          className="flex items-center gap-3 rounded-lg border border-border px-4 py-3"
        >
          <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{s.subject}</p>
            <p className="text-xs text-muted-foreground truncate">{s.filename}</p>
          </div>
          <Badge variant={statusVariant[s.status]} className="text-xs capitalize shrink-0">
            {s.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}
