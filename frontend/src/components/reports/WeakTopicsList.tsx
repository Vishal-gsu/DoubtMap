import { Badge } from '@/components/ui/badge';

interface WeakTopicsListProps {
  weakTopics: string[];
  strongTopics: string[];
}

export function WeakTopicsList({ weakTopics, strongTopics }: WeakTopicsListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {weakTopics.map((t) => (
        <Badge key={t} variant="destructive" className="text-xs">
          {t}
        </Badge>
      ))}
      {strongTopics.map((t) => (
        <Badge key={t} className="text-xs bg-green-600 hover:bg-green-700 text-white">
          {t}
        </Badge>
      ))}
    </div>
  );
}
