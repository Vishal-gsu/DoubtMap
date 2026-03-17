import { UIMessage, DoubtHeatmapItem, Report, EscalatedDoubt, RecentDoubt, Syllabus, ChatMessage } from './types';

export const mockMessages: UIMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'What is a binary search tree?',
  },
  {
    id: '2',
    role: 'ai',
    content:
      'Before I explain, let me ask you: Do you know what a regular binary tree is? What makes it different from a linked list?',
    confidence: 0.92,
    sources: ['Chapter 5, Page 34'],
    mode: 'socratic',
  },
];

export const mockHeatmap: DoubtHeatmapItem[] = [
  { topic: 'Binary Trees', count: 47, avg_confidence: 0.65 },
  { topic: 'Graph Traversal', count: 38, avg_confidence: 0.58 },
  { topic: 'Sorting Algorithms', count: 12, avg_confidence: 0.89 },
  { topic: 'Dynamic Programming', count: 31, avg_confidence: 0.42 },
  { topic: 'Linked Lists', count: 8, avg_confidence: 0.94 },
];

export const mockReport: Report = {
  id: 'r1',
  week: 'March 10 - March 17, 2026',
  total_doubts: 23,
  weak_topics: ['Binary Trees', 'Dynamic Programming'],
  strong_topics: ['Arrays', 'Sorting'],
  improvement_score: 72,
  summary:
    'You showed great improvement in sorting algorithms this week. Focus more on tree traversal and dynamic programming. Your understanding of arrays is solid.',
  suggestions: [
    'Practice 3 BST problems on LeetCode',
    'Revisit Chapter 5: Tree Rotations',
    'Try explaining DP to a friend — Socratic mode can help',
  ],
  created_at: '2026-03-17T00:00:00Z',
};

export const mockEscalations: EscalatedDoubt[] = [
  {
    id: 'e1',
    topic: 'Deadlock Prevention',
    message: 'How is deadlock different from starvation?',
    student_count: 5,
    professor_response: null,
    created_at: '2026-03-17T10:30:00Z',
  },
  {
    id: 'e2',
    topic: 'AVL Trees',
    message: 'When do we left-rotate vs right-rotate in AVL trees?',
    student_count: 3,
    professor_response: null,
    created_at: '2026-03-16T14:00:00Z',
  },
];

export const mockRecentDoubts: RecentDoubt[] = [
  {
    id: 'd1',
    student_name: 'Anonymous',
    topic: 'Binary Search Trees',
    message: 'How does deletion work in BST?',
    confidence: 0.45,
    escalated: true,
    created_at: '2026-03-17T10:30:00Z',
  },
  {
    id: 'd2',
    student_name: 'Anonymous',
    topic: 'Sorting Algorithms',
    message: 'What is the time complexity of merge sort?',
    confidence: 0.87,
    escalated: false,
    created_at: '2026-03-17T09:15:00Z',
  },
];

export const mockSyllabi: Syllabus[] = [
  {
    id: 's1',
    subject: 'Data Structures',
    filename: 'ds_syllabus.pdf',
    status: 'indexed',
    uploaded_at: '2026-03-16T10:00:00Z',
  },
];

export const mockHistory: ChatMessage[] = [
  {
    id: 'h1',
    user_id: 'user_1',
    message: 'What is polymorphism?',
    response: 'Let me guide you through this with a question...',
    confidence: 0.87,
    sources: ['Chapter 4, Page 12'],
    topic: 'Polymorphism',
    mode: 'socratic',
    created_at: '2026-03-17T10:30:00Z',
  },
];
