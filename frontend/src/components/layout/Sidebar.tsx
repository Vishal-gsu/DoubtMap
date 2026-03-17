'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  History,
  BarChart2,
  LayoutDashboard,
  AlertTriangle,
  FileText,
} from 'lucide-react';

interface SidebarProps {
  role: 'student' | 'professor';
}

const studentLinks = [
  { href: '/student/chat', label: 'Chat', icon: MessageSquare },
  { href: '/student/history', label: 'History', icon: History },
  { href: '/student/reports', label: 'Reports', icon: BarChart2 },
];

const professorLinks = [
  { href: '/professor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/professor/escalations', label: 'Escalations', icon: AlertTriangle },
  { href: '/professor/syllabus', label: 'Syllabus', icon: FileText },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const links = role === 'professor' ? professorLinks : studentLinks;

  return (
    <aside className="hidden md:flex flex-col w-56 border-r border-border min-h-[calc(100vh-3.5rem)] py-4 px-2">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors mb-1 ${
            pathname === href
              ? 'bg-accent text-accent-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </aside>
  );
}
