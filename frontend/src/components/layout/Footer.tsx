import { BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border py-4 mt-auto">
      <div className="container px-4 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-4 w-4" />
          <span className="font-medium">DoubtMap</span>
        </div>
        <span>AI-powered study assistant</span>
      </div>
    </footer>
  );
}
