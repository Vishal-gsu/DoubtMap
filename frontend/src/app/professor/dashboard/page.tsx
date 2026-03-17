'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DoubtHeatmapItem, RecentDoubt } from '@/lib/types';
import { mockHeatmap, mockRecentDoubts } from '@/lib/mockData';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { DoubtHeatmap } from '@/components/dashboard/DoubtHeatmap';
import { RecentDoubts } from '@/components/dashboard/RecentDoubts';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { SUBJECTS } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DashboardPage() {
  const [heatmap, setHeatmap] = useState<DoubtHeatmapItem[]>([]);
  const [recentDoubts, setRecentDoubts] = useState<RecentDoubt[]>([]);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [hmRes, rdRes] = await Promise.all([
          api.get(`/doubts/heatmap?subject=${encodeURIComponent(subject)}`),
          api.get('/doubts/recent?limit=20'),
        ]);
        setHeatmap(hmRes.data.topics);
        setRecentDoubts(rdRes.data.doubts);
      } catch {
        setHeatmap(mockHeatmap);
        setRecentDoubts(mockRecentDoubts);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [subject]);

  const totalDoubts = heatmap.reduce((s, d) => s + d.count, 0);
  const escalated = recentDoubts.filter((d) => d.escalated).length;
  const avgConf =
    heatmap.length > 0
      ? Math.round(
          (heatmap.reduce((s, d) => s + d.avg_confidence, 0) / heatmap.length) * 100
        )
      : 0;

  const stats = [
    { label: 'Total Doubts', value: totalDoubts, icon: MessageSquare },
    { label: 'Active Students', value: recentDoubts.length, icon: Users },
    { label: 'Escalations', value: escalated, icon: AlertTriangle },
    { label: 'Avg Confidence', value: `${avgConf}%`, icon: TrendingUp },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Doubt analytics overview</p>
        </div>
        <Select value={subject} onValueChange={(v) => v && setSubject(v)}>
          <SelectTrigger className="w-52 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUBJECTS.map((s) => (
              <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <StatsOverview stats={stats} />

      {loading ? (
        <LoadingSpinner text="Loading data..." />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Doubt Heatmap — {subject}</CardTitle>
            </CardHeader>
            <CardContent>
              <DoubtHeatmap data={heatmap} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Doubts</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentDoubts doubts={recentDoubts} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
