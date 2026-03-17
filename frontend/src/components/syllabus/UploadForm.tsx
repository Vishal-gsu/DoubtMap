'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText } from 'lucide-react';
import api from '@/lib/api';
import { useUser } from '@clerk/nextjs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';

interface UploadFormProps {
  onUploaded: () => void;
}

export function UploadForm({ onUploaded }: UploadFormProps) {
  const { user } = useUser();
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === 'application/pdf') setFile(dropped);
  };

  const handleUpload = async () => {
    if (!file || !subject.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', subject);
    formData.append('professor_id', user?.id ?? '');

    try {
      await api.post('/syllabus/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
      setFile(null);
      setSubject('');
      onUploaded();
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <ErrorAlert message={error} />}
      {success && (
        <div className="rounded-md bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-600">
          Syllabus uploaded! Indexing started.
        </div>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-10 cursor-pointer hover:bg-accent/30 transition-colors"
      >
        {file ? (
          <>
            <FileText className="h-8 w-8 text-primary mb-2" />
            <p className="font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(0)} KB</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="font-medium">Drag & drop or click to upload PDF</p>
            <p className="text-xs text-muted-foreground mt-1">PDF files only</p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <Input
        placeholder="Subject name (e.g. Data Structures)"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />

      <Button
        onClick={handleUpload}
        disabled={!file || !subject.trim() || loading}
        className="w-full"
      >
        {loading ? <LoadingSpinner size="sm" text="Uploading..." /> : 'Upload Syllabus'}
      </Button>
    </div>
  );
}
