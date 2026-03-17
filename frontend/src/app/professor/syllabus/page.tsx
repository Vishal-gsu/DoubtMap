'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Syllabus } from '@/lib/types';
import { mockSyllabi } from '@/lib/mockData';
import { UploadForm } from '@/components/syllabus/UploadForm';
import { SyllabusList } from '@/components/syllabus/SyllabusList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function SyllabusPage() {
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSyllabi = useCallback(async () => {
    try {
      const { data } = await api.get('/syllabus/list');
      setSyllabi(data.syllabi);
    } catch {
      setSyllabi(mockSyllabi);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSyllabi();
  }, [loadSyllabi]);

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold mb-1">Syllabus Upload</h1>
        <p className="text-sm text-muted-foreground">
          Upload PDF syllabi so the AI can answer questions from them
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload New Syllabus</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadForm onUploaded={loadSyllabi} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Uploaded Syllabi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner text="Loading..." />
          ) : (
            <SyllabusList syllabi={syllabi} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
