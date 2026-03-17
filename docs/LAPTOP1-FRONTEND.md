# LAPTOP 1 — FRONTEND (Next.js + Vercel)

## YOUR OWNERSHIP
You own the `frontend/` folder ONLY. Never touch `backend/` or `n8n/`.

---

## TECH STACK
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Auth:** Clerk (@clerk/nextjs)
- **Styling:** Tailwind CSS + shadcn/ui
- **HTTP Client:** axios
- **State:** React hooks (useState, useEffect, useContext)
- **Markdown Rendering:** react-markdown (for AI responses)
- **Charts:** recharts (for professor dashboard heatmap)
- **Deploy:** Vercel

---

## SETUP COMMANDS (Run on Day 1)

```bash
cd e:/hackathon/UNOLOX
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir --use-npm
cd frontend
npm install @clerk/nextjs axios react-markdown recharts
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card avatar badge scroll-area tabs sheet
```

---

## FOLDER STRUCTURE (YOU CREATE ALL OF THESE)

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    ← Root layout with ClerkProvider
│   │   ├── page.tsx                      ← Landing page (hero + CTA)
│   │   ├── sign-in/[[...sign-in]]/
│   │   │   └── page.tsx                  ← Clerk sign-in page
│   │   ├── sign-up/[[...sign-up]]/
│   │   │   └── page.tsx                  ← Clerk sign-up page
│   │   ├── student/
│   │   │   ├── layout.tsx                ← Student layout with sidebar
│   │   │   ├── chat/
│   │   │   │   └── page.tsx              ← Main chat page (doubt asking)
│   │   │   ├── reports/
│   │   │   │   └── page.tsx              ← View weekly AI reports
│   │   │   └── history/
│   │   │       └── page.tsx              ← Past doubt history
│   │   ├── professor/
│   │   │   ├── layout.tsx                ← Professor layout with sidebar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx              ← Doubt heatmap + analytics
│   │   │   ├── escalations/
│   │   │   │   └── page.tsx              ← Unanswered doubts list
│   │   │   └── syllabus/
│   │   │       └── page.tsx              ← Upload syllabus PDF
│   │   └── api/
│   │       └── webhook/
│   │           └── clerk/
│   │               └── route.ts          ← Clerk webhook to sync users to backend
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx            ← Main chat container
│   │   │   ├── MessageBubble.tsx         ← Single message (user or AI)
│   │   │   ├── ChatInput.tsx             ← Text input + send button
│   │   │   ├── SocraticPrompt.tsx        ← When AI asks back a question
│   │   │   └── ConfidenceBadge.tsx       ← Shows AI confidence level
│   │   ├── dashboard/
│   │   │   ├── DoubtHeatmap.tsx          ← Recharts bar chart of doubt topics
│   │   │   ├── RecentDoubts.tsx          ← Table of recent student doubts
│   │   │   ├── TopicCard.tsx             ← Single topic confusion card
│   │   │   └── StatsOverview.tsx         ← Total doubts, students, etc.
│   │   ├── reports/
│   │   │   ├── ReportCard.tsx            ← Single weekly report card
│   │   │   ├── WeakTopicsList.tsx        ← List of weak areas
│   │   │   └── ProgressChart.tsx         ← Progress over weeks
│   │   ├── syllabus/
│   │   │   ├── UploadForm.tsx            ← PDF drag-and-drop upload
│   │   │   └── SyllabusList.tsx          ← List of uploaded syllabi
│   │   ├── layout/
│   │   │   ├── Navbar.tsx                ← Top nav with logo + user menu
│   │   │   ├── Sidebar.tsx               ← Side nav for student/professor
│   │   │   └── Footer.tsx
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorAlert.tsx
│   │       └── RoleBadge.tsx             ← "Student" or "Professor" badge
│   ├── lib/
│   │   ├── api.ts                        ← Axios instance with base URL
│   │   ├── constants.ts                  ← API URLs, app constants
│   │   └── types.ts                      ← TypeScript interfaces (shared types)
│   ├── hooks/
│   │   ├── useChat.ts                    ← Chat state management hook
│   │   └── useRole.ts                    ← Get user role from Clerk metadata
│   └── styles/
│       └── globals.css                   ← Tailwind imports + custom styles
├── public/
│   ├── logo.svg
│   └── hero-image.png
├── .env.local                            ← Clerk keys + backend URL
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## ENV VARIABLES (.env.local)

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/student/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/student/chat

# Backend API (Laptop 2's Render URL)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
# On deploy: https://doubtmap-api.onrender.com/api/v1
```

---

## API CONTRACT (Laptop 2 builds these, you just call them)

### All requests use base: `NEXT_PUBLIC_API_URL`

### 1. Chat — POST `/chat/ask`
**Request:**
```json
{
  "user_id": "clerk_user_id_string",
  "message": "What is polymorphism in OOP?",
  "subject": "Object Oriented Programming",
  "mode": "socratic" | "direct"
}
```
**Response:**
```json
{
  "response": "Great question! Before I explain, tell me...",
  "confidence": 0.87,
  "sources": ["Chapter 4, Page 12", "Lecture 7 Notes"],
  "mode": "socratic",
  "doubt_id": "uuid-string",
  "topic_detected": "Polymorphism"
}
```

### 2. Chat History — GET `/chat/history?user_id={id}&limit=50`
**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "user_id": "clerk_id",
      "message": "What is polymorphism?",
      "response": "Let me guide you through this...",
      "confidence": 0.87,
      "topic": "Polymorphism",
      "mode": "socratic",
      "created_at": "2026-03-17T10:30:00Z"
    }
  ]
}
```

### 3. Doubt Heatmap — GET `/doubts/heatmap?subject={subject}`
**Response:**
```json
{
  "topics": [
    { "topic": "Trees", "count": 47, "avg_confidence": 0.72 },
    { "topic": "Graphs", "count": 38, "avg_confidence": 0.65 },
    { "topic": "Arrays", "count": 12, "avg_confidence": 0.91 }
  ]
}
```

### 4. Recent Doubts — GET `/doubts/recent?limit=20`
**Response:**
```json
{
  "doubts": [
    {
      "id": "uuid",
      "student_name": "Anonymous",
      "topic": "Binary Search Trees",
      "message": "How does deletion work in BST?",
      "confidence": 0.45,
      "escalated": true,
      "created_at": "2026-03-17T10:30:00Z"
    }
  ]
}
```

### 5. Escalated Doubts — GET `/doubts/escalated`
**Response:**
```json
{
  "doubts": [
    {
      "id": "uuid",
      "topic": "Deadlock Prevention",
      "message": "How is deadlock different from starvation?",
      "student_count": 5,
      "professor_response": null,
      "created_at": "2026-03-17T10:30:00Z"
    }
  ]
}
```

### 6. Professor Response — POST `/doubts/escalated/{doubt_id}/respond`
**Request:**
```json
{
  "professor_id": "clerk_prof_id",
  "response": "Great question. The key difference is..."
}
```

### 7. Student Reports — GET `/reports?user_id={id}`
**Response:**
```json
{
  "reports": [
    {
      "id": "uuid",
      "week": "2026-03-10 to 2026-03-17",
      "total_doubts": 23,
      "weak_topics": ["Trees", "Graphs"],
      "strong_topics": ["Arrays", "Sorting"],
      "improvement_score": 72,
      "summary": "You showed great improvement in...",
      "suggestions": ["Focus more on Graph traversal algorithms"],
      "created_at": "2026-03-17T00:00:00Z"
    }
  ]
}
```

### 8. Syllabus Upload — POST `/syllabus/upload` (multipart/form-data)
**Request:**
```
Form Data:
  - file: PDF file
  - subject: "Data Structures"
  - professor_id: "clerk_prof_id"
```
**Response:**
```json
{
  "message": "Syllabus uploaded and indexing started",
  "syllabus_id": "uuid",
  "status": "processing"
}
```

### 9. List Syllabi — GET `/syllabus/list`
**Response:**
```json
{
  "syllabi": [
    {
      "id": "uuid",
      "subject": "Data Structures",
      "filename": "ds_syllabus.pdf",
      "status": "indexed",
      "uploaded_at": "2026-03-16T10:00:00Z"
    }
  ]
}
```

### 10. Health Check — GET `/health`
**Response:**
```json
{ "status": "ok", "version": "1.0.0" }
```

---

## PAGE-BY-PAGE BUILD GUIDE

### Phase 1: Skeleton (First 2 hours)

**1. Root Layout (`src/app/layout.tsx`)**
- Wrap with `<ClerkProvider>`
- Add `<Navbar />` at top
- Import global styles

**2. Landing Page (`src/app/page.tsx`)**
- Hero section: "Your AI Study Buddy That Actually Teaches"
- Subtext: "Ask doubts from your syllabus. Get Socratic guidance. Track your progress."
- Two CTA buttons: "I'm a Student" → sign-up, "I'm a Professor" → sign-up
- Feature cards: Socratic Mode, Doubt Heatmap, Weekly Reports, Smart Escalation

**3. Clerk Auth Pages**
- `sign-in/[[...sign-in]]/page.tsx` → `<SignIn />`
- `sign-up/[[...sign-up]]/page.tsx` → `<SignUp />`
- After sign-up, use Clerk metadata to set role: `student` or `professor`
- Use Clerk's `publicMetadata.role` field

**4. Navbar (`components/layout/Navbar.tsx`)**
- Logo (left)
- Navigation links based on role
- `<UserButton />` from Clerk (right)
- Mobile hamburger menu

---

### Phase 2: Student Pages (Next 3 hours)

**5. Student Layout (`src/app/student/layout.tsx`)**
- Sidebar with links: Chat, History, Reports
- Protect with Clerk middleware (redirect if not logged in)
- Check role === "student"

**6. Chat Page (`src/app/student/chat/page.tsx`)**
- THIS IS THE HERO PAGE — spend the most time here
- Components to use: ChatWindow, ChatInput, MessageBubble
- Features:
  - Mode toggle: "Socratic Mode" vs "Direct Answer" (toggle switch at top)
  - Subject dropdown (populated from syllabi)
  - Message list with auto-scroll
  - AI responses rendered with react-markdown (supports code blocks, math)
  - Each AI response shows: confidence badge, source references
  - Typing indicator while waiting for API
- **useChat hook manages:**
  - messages array state
  - loading state
  - POST to `/chat/ask` on send
  - Append user message immediately, append AI response when received

**7. Chat Components Detail:**

**ChatWindow.tsx:**
```
- Full height container with scroll
- Maps over messages[] array
- Each message gets <MessageBubble />
- Auto scrolls to bottom on new message (useRef + scrollIntoView)
```

**MessageBubble.tsx:**
```
Props: { role: "user" | "ai", content: string, confidence?: number, sources?: string[], mode?: string }
- User bubble: right-aligned, blue background
- AI bubble: left-aligned, gray background
  - Render content with react-markdown
  - If mode === "socratic", show thinking emoji indicator
  - Show <ConfidenceBadge confidence={0.87} />
  - Show sources as clickable chips below message
```

**ChatInput.tsx:**
```
- Text input + Send button
- Enter key submits
- Disabled while loading
- Placeholder: "Ask a doubt from your syllabus..."
```

**8. History Page (`src/app/student/history/page.tsx`)**
- Call GET `/chat/history?user_id={id}`
- Table view: Date, Topic, Question (truncated), Confidence
- Click row → expand to see full Q&A

**9. Reports Page (`src/app/student/reports/page.tsx`)**
- Call GET `/reports?user_id={id}`
- List of weekly report cards
- Each ReportCard shows:
  - Week range
  - Total doubts asked
  - Weak topics (red badges)
  - Strong topics (green badges)
  - Improvement score (circular progress bar)
  - AI-generated summary text
  - Suggestions list

---

### Phase 3: Professor Pages (Next 2 hours)

**10. Professor Layout (`src/app/professor/layout.tsx`)**
- Sidebar: Dashboard, Escalations, Upload Syllabus
- Protect: role === "professor"

**11. Dashboard Page (`src/app/professor/dashboard/page.tsx`)**
- **StatsOverview:** 4 cards showing total doubts, active students, escalations, avg confidence
- **DoubtHeatmap:** recharts BarChart
  - X-axis: topic names
  - Y-axis: doubt count
  - Color: red for high count, green for low
  - Data from GET `/doubts/heatmap`
- **RecentDoubts:** table of latest 20 doubts
  - Columns: Time, Student (anonymous), Topic, Confidence, Escalated?
  - Sortable by confidence (lowest first = most confused)

**12. Escalations Page (`src/app/professor/escalations/page.tsx`)**
- GET `/doubts/escalated`
- Card list of unresolved doubts
- Each card:
  - Topic + question text
  - "X students asked about this"
  - Text area for professor to type response
  - Submit button → POST `/doubts/escalated/{id}/respond`
  - Once responded, card turns green

**13. Syllabus Upload (`src/app/professor/syllabus/page.tsx`)**
- Drag-and-drop PDF upload zone
- Subject name text input
- Upload button → POST `/syllabus/upload` (multipart)
- Below: list of uploaded syllabi with status badges (processing/indexed)
- GET `/syllabus/list`

---

### Phase 4: Polish (Last 1 hour)

**14. lib/api.ts — Axios Instance**
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,  // LLM calls can take time
  headers: { 'Content-Type': 'application/json' }
});

export default api;
```

**15. lib/types.ts — Shared TypeScript Types**
```typescript
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
```

**16. Responsive Design**
- Mobile-first approach
- Chat page must work perfectly on mobile
- Dashboard can be desktop-only (professor uses laptop)
- Use Tailwind breakpoints: `sm:`, `md:`, `lg:`

**17. Loading & Error States**
- Every API call should have loading spinner
- Every API call should have error toast/alert
- Use shadcn Toast component

---

## CLERK SETUP GUIDE

1. Go to https://clerk.com → Create application "DoubtMap"
2. Enable Email + Google sign-in
3. Get publishable key + secret key → put in `.env.local`
4. In Clerk dashboard → Users → Metadata:
   - Add custom field: `role` (string: "student" | "professor")
5. Create middleware for route protection:

**`frontend/src/middleware.ts`:**
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/student(.*)',
  '/professor(.*)'
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

---

## ROLE SELECTION FLOW

After sign-up, redirect to a role selection page OR:
- Use Clerk's `unsafeMetadata` during sign-up to capture role
- Simpler for hackathon: Add a `/select-role` page after first sign-in:
  - Two big buttons: "I'm a Student" / "I'm a Professor"
  - On click → call Clerk API to set `publicMetadata.role`
  - Redirect to appropriate dashboard

**`hooks/useRole.ts`:**
```typescript
import { useUser } from '@clerk/nextjs';

export function useRole() {
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as string) || 'student';
  return { role, isStudent: role === 'student', isProfessor: role === 'professor' };
}
```

---

## VERCEL DEPLOY STEPS

1. Push `frontend/` folder to GitHub
2. Go to vercel.com → Import repo
3. Set root directory to `frontend`
4. Add env variables in Vercel dashboard
5. Change `NEXT_PUBLIC_API_URL` to Render backend URL
6. Deploy → get URL like `doubtmap.vercel.app`

---

## DEVELOPMENT TIPS

- **Before backend is ready:** Mock the API responses in `lib/api.ts` so you can build UI without waiting
- **Test with:** `npm run dev` on port 3000
- **Backend will run on:** `localhost:8000` (Laptop 2)
- **CORS is handled by Laptop 2** — they will whitelist your localhost:3000 and Vercel URL
- **Git:** Only commit files inside `frontend/` — never touch other folders

---

## MOCK DATA (Use while backend isn't ready)

```typescript
// lib/mockData.ts
export const mockMessages = [
  {
    id: "1",
    role: "user" as const,
    content: "What is a binary search tree?",
  },
  {
    id: "2",
    role: "ai" as const,
    content: "Before I explain, let me ask you: Do you know what a regular binary tree is? What makes it different from a linked list?",
    confidence: 0.92,
    sources: ["Chapter 5, Page 34"],
    mode: "socratic" as const
  }
];

export const mockHeatmap = [
  { topic: "Binary Trees", count: 47, avg_confidence: 0.65 },
  { topic: "Graph Traversal", count: 38, avg_confidence: 0.58 },
  { topic: "Sorting Algorithms", count: 12, avg_confidence: 0.89 },
  { topic: "Dynamic Programming", count: 31, avg_confidence: 0.42 },
  { topic: "Linked Lists", count: 8, avg_confidence: 0.94 },
];

export const mockReport = {
  id: "r1",
  week: "March 10 - March 17, 2026",
  total_doubts: 23,
  weak_topics: ["Binary Trees", "Dynamic Programming"],
  strong_topics: ["Arrays", "Sorting"],
  improvement_score: 72,
  summary: "You showed great improvement in sorting algorithms this week. Focus more on tree traversal and dynamic programming. Your understanding of arrays is solid.",
  suggestions: [
    "Practice 3 BST problems on LeetCode",
    "Revisit Chapter 5: Tree Rotations",
    "Try explaining DP to a friend — Socratic mode can help"
  ]
};
```

---

## DO'S AND DON'TS

| DO | DON'T |
|---|---|
| Only work in `frontend/` | Never touch `backend/` or `n8n/` |
| Use the exact API contract above | Change API request/response shapes |
| Use Clerk for all auth | Build custom auth |
| Use shadcn components | Install Material UI or other UI libs |
| Mock APIs while waiting for backend | Block your work waiting for backend |
| Make chat page beautiful — it's the DEMO page | Spend too long on landing page |
| Use TypeScript strictly | Use `any` type everywhere |

---

## PRIORITY ORDER (If time is short)

1. Chat page (MUST HAVE — this IS the demo)
2. Landing page (MUST HAVE — first impression)
3. Professor dashboard with heatmap (MUST HAVE — judges love data viz)
4. Syllabus upload page
5. Reports page
6. History page
7. Escalations page
