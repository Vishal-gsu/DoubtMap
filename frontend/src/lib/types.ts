export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string;
  confidence: number;
  sources: string[];
  topic: string;
  mode: 'socratic' | 'direct';
  created_at: string;
}

export interface UIMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  confidence?: number;
  sources?: string[];
  mode?: 'socratic' | 'direct';
  topic?: string;
}

export interface DoubtHeatmapItem {
  topic: string;
  count: number;
  avg_confidence: number;
}

export interface Report {
  id: string;
  week: string;
  total_doubts: number;
  weak_topics: string[];
  strong_topics: string[];
  improvement_score: number;
  summary: string;
  suggestions: string[];
  created_at: string;
}

export interface Syllabus {
  id: string;
  subject: string;
  filename: string;
  status: 'processing' | 'indexed' | 'failed';
  uploaded_at: string;
}

export interface EscalatedDoubt {
  id: string;
  topic: string;
  message: string;
  student_count: number;
  professor_response: string | null;
  created_at: string;
}

export interface RecentDoubt {
  id: string;
  student_name: string;
  topic: string;
  message: string;
  confidence: number;
  escalated: boolean;
  created_at: string;
}
