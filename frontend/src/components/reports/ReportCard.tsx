import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Report } from '@/lib/types';
import { WeakTopicsList } from './WeakTopicsList';
import { ProgressChart } from './ProgressChart';

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base">{report.week}</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {report.total_doubts} doubts asked
            </p>
          </div>
          <ProgressChart score={report.improvement_score} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <WeakTopicsList weakTopics={report.weak_topics} strongTopics={report.strong_topics} />

        <p className="text-sm text-muted-foreground border-l-2 border-primary/40 pl-3">
          {report.summary}
        </p>

        <div>
          <p className="text-sm font-medium mb-1.5">Suggestions</p>
          <ul className="space-y-1">
            {report.suggestions.map((s, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
