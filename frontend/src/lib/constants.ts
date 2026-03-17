export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export const SUBJECTS = [
  'Data Structures',
  'Algorithms',
  'Object Oriented Programming',
  'Operating Systems',
  'Database Management',
  'Computer Networks',
  'Software Engineering',
];

export const CHAT_MODES = {
  SOCRATIC: 'socratic',
  DIRECT: 'direct',
} as const;
