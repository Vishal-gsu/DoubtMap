'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Show, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import { useRole } from '@/hooks/useRole';
import { buttonVariants } from '@/components/ui/button';
import { BookOpen, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const studentLinks = [
  { href: '/student/chat', label: 'Chat' },
  { href: '/student/history', label: 'History' },
  { href: '/student/reports', label: 'Reports' },
];

const professorLinks = [
  { href: '/professor/dashboard', label: 'Dashboard' },
  { href: '/professor/escalations', label: 'Escalations' },
  { href: '/professor/syllabus', label: 'Syllabus' },
];

export function Navbar() {
  const pathname = usePathname();
  const { isProfessor } = useRole();
  const navLinks = isProfessor ? professorLinks : studentLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg mr-6">
          <BookOpen className="h-5 w-5 text-primary" />
          <span>DoubtMap</span>
        </Link>

        {/* Desktop nav (signed-in only) */}
        <Show when="signed-in">
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  pathname === link.href
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </Show>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton mode="redirect">
              <button className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="redirect">
              <button className={cn(buttonVariants({ size: 'sm' }))}>
                Sign Up
              </button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'md:hidden')}>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col gap-2 mt-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        pathname === link.href
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
