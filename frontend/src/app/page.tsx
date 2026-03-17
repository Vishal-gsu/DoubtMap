import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Brain,
  BarChart2,
  Bell,
  BookOpen,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Socratic Mode',
    description:
      'AI guides you to the answer with targeted questions instead of just telling you — building real understanding.',
  },
  {
    icon: BarChart2,
    title: 'Doubt Heatmap',
    description:
      'Professors see which topics confuse students most, visualised as a real-time bar chart.',
  },
  {
    icon: TrendingUp,
    title: 'Weekly Reports',
    description:
      'Get a personalised AI report every week showing your weak areas, strong topics, and improvement score.',
  },
  {
    icon: Bell,
    title: 'Smart Escalation',
    description:
      'When AI confidence is low, the doubt automatically escalates to your professor for a human answer.',
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full max-w-4xl px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground mb-6">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Powered by AI + your own syllabus</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Your AI Study Buddy That{' '}
          <span className="text-primary">Actually Teaches</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Ask doubts from your syllabus. Get Socratic guidance. Track your progress. Help
          professors see where students are struggling — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/sign-up" className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium text-sm h-9 px-4 gap-1.5 transition-all hover:bg-primary/80">
            <MessageSquare className="h-4 w-4" />
            I&apos;m a Student
          </Link>
          <Link href="/sign-up" className="inline-flex items-center justify-center rounded-lg border border-border bg-background text-foreground font-medium text-sm h-9 px-4 gap-1.5 transition-all hover:bg-muted">
            <BarChart2 className="h-4 w-4" />
            I&apos;m a Professor
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="w-full max-w-5xl px-4 pb-20">
        <h2 className="text-2xl font-bold text-center mb-8">
          Everything you need to learn better
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-5 w-5 text-primary" />
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
