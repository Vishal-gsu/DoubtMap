import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DoubtHeatmapItem } from '@/lib/types';

interface TopicCardProps {
  item: DoubtHeatmapItem;
}

export function TopicCard({ item }: TopicCardProps) {
  const pct = Math.round(item.avg_confidence * 100);
  const level = pct >= 80 ? 'Low Confusion' : pct >= 60 ? 'Medium Confusion' : 'High Confusion';
  const variant = pct >= 80 ? 'default' : pct >= 60 ? 'secondary' : 'destructive';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{item.topic}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-bold">{item.count}</p>
        <p className="text-xs text-muted-foreground">doubts asked</p>
        <Badge variant={variant} className="text-xs">{level}</Badge>
      </CardContent>
    </Card>
  );
}
