'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import api from '@/lib/api';
import { Report } from '@/lib/types';
import { mockReport } from '@/lib/mockData';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { ReportCard } from '@/components/reports/ReportCard';

export default function ReportsPage() {
  const { user } = useUser();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const { data } = await api.get(`/reports?user_id=${user.id}`);
        setReports(data.reports);
      } catch {
        setReports([mockReport]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-bold mb-1">Weekly Reports</h1>
      <p className="text-sm text-muted-foreground mb-6">AI-generated weekly analysis of your doubts and progress</p>

      {loading && <LoadingSpinner text="Loading reports..." />}
      {error && <ErrorAlert message={error} />}

      {!loading && reports.length === 0 && (
        <p className="text-sm text-muted-foreground">No reports yet. Keep asking doubts!</p>
      )}

      <div className="space-y-4">
        {reports.map((r) => (
          <ReportCard key={r.id} report={r} />
        ))}
      </div>
    </div>
  );
}
