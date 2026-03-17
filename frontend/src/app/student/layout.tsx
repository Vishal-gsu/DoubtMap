import { Sidebar } from '@/components/layout/Sidebar';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <Sidebar role="student" />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
