'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function SelectRolePage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const selectRole = async (role: 'student' | 'professor') => {
    setLoading(true);
    await user?.update({ unsafeMetadata: { role } });

    // Register user in backend DB with chosen role
    try {
      const email = user?.primaryEmailAddress?.emailAddress ?? '';
      const name = user?.fullName ?? user?.firstName ?? email;
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerk_id: user?.id, name, email, role }),
      });
    } catch { /* fire-and-forget */ }

    router.push(role === 'student' ? '/student/chat' : '/professor/dashboard');
  };

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Welcome to DoubtMap</h1>
        <p className="text-muted-foreground mb-8">How will you be using DoubtMap?</p>

        {loading ? (
          <LoadingSpinner text="Setting up your account..." />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => selectRole('student')}
              className="flex flex-col items-center gap-3 rounded-xl border-2 border-border px-6 py-8 hover:border-primary hover:bg-accent/30 transition-all"
            >
              <GraduationCap className="h-10 w-10 text-primary" />
              <div>
                <p className="font-semibold">I&apos;m a Student</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ask doubts, track progress
                </p>
              </div>
            </button>

            <button
              onClick={() => selectRole('professor')}
              className="flex flex-col items-center gap-3 rounded-xl border-2 border-border px-6 py-8 hover:border-primary hover:bg-accent/30 transition-all"
            >
              <BookOpen className="h-10 w-10 text-primary" />
              <div>
                <p className="font-semibold">I&apos;m a Professor</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload syllabus, view analytics
                </p>
              </div>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
