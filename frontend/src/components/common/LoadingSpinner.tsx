import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function LoadingSpinner({ text, size = 'md' }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className={`${sizeMap[size]} animate-spin`} />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
}
