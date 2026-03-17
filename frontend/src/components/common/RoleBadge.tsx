import { Badge } from '@/components/ui/badge';

interface RoleBadgeProps {
  role: 'student' | 'professor';
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <Badge variant={role === 'professor' ? 'default' : 'secondary'}>
      {role === 'professor' ? 'Professor' : 'Student'}
    </Badge>
  );
}
