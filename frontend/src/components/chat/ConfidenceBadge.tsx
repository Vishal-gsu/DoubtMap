import { Badge } from '@/components/ui/badge';

interface ConfidenceBadgeProps {
  confidence: number;
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const pct = Math.round(confidence * 100);
  const variant =
    pct >= 80 ? 'default' : pct >= 60 ? 'secondary' : 'destructive';
  return (
    <Badge variant={variant} className="text-xs">
      {pct}% confident
    </Badge>
  );
}
