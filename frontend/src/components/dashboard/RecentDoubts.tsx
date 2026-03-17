import { RecentDoubt } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface RecentDoubtsProps {
  doubts: RecentDoubt[];
}

function confidenceColor(c: number) {
  if (c >= 0.8) return 'text-green-600';
  if (c >= 0.6) return 'text-yellow-600';
  return 'text-red-600';
}

export function RecentDoubts({ doubts }: RecentDoubtsProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="pb-2 text-left font-medium">Time</th>
            <th className="pb-2 text-left font-medium">Topic</th>
            <th className="pb-2 text-left font-medium hidden md:table-cell">Question</th>
            <th className="pb-2 text-left font-medium">Confidence</th>
            <th className="pb-2 text-left font-medium">Escalated</th>
          </tr>
        </thead>
        <tbody>
          {doubts.map((d) => (
            <tr key={d.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
              <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">
                {new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="py-2 pr-3 font-medium">{d.topic}</td>
              <td className="py-2 pr-3 text-muted-foreground hidden md:table-cell">
                {d.message.length > 60 ? d.message.slice(0, 60) + '…' : d.message}
              </td>
              <td className={`py-2 pr-3 font-mono ${confidenceColor(d.confidence)}`}>
                {Math.round(d.confidence * 100)}%
              </td>
              <td className="py-2">
                {d.escalated ? (
                  <Badge variant="destructive" className="text-xs">Yes</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">No</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
