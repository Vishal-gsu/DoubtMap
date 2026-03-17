import { useUser } from '@clerk/nextjs';

export function useRole() {
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as string) || 'student';
  return {
    role,
    isStudent: role === 'student',
    isProfessor: role === 'professor',
  };
}
