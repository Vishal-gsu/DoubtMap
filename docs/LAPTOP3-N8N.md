# LAPTOP 3 — N8N + INTEGRATION + DEPLOYMENT ORCHESTRATOR

## YOUR OWNERSHIP
- You own the `n8n/` folder for workflow documentation
- You are responsible for n8n Cloud setup + all workflow creation
- You handle the **glue** between frontend and backend
- You manage deployment coordination + GitHub repo setup
- You test end-to-end flows

You should **NOT** write code in `frontend/` or `backend/`, but you will test their APIs.

---

## TECH STACK
- **n8n:** n8n Cloud (free tier)
- **Email:** Resend (free tier, 100 emails/day) OR n8n built-in email
- **Testing:** cURL / Postman for API testing
- **Git:** Manage GitHub repo, branches, merge coordination
- **Monitoring:** n8n execution logs + Render logs

---

## SETUP (Day 1 — First 30 Minutes)

### 1. GitHub Repo Setup

```bash
cd e:/hackathon/UNOLOX
git init
```

**Create `.gitignore`:**
```gitignore
# Frontend
frontend/node_modules/
frontend/.next/
frontend/.env.local

# Backend
backend/venv/
backend/__pycache__/
backend/.env
backend/*.pyc

# n8n
n8n/credentials/

# General
.DS_Store
*.log
.env
```

**Create folder structure:**
```bash
mkdir -p frontend backend n8n/workflows n8n/docs docs
```

**Initial commit:**
```bash
git add .
git commit -m "Initial project structure for DoubtMap"
```

**Create GitHub repo:**
```bash
gh repo create doubtmap --public --source=. --push
```

### 2. n8n Cloud Setup

1. Go to https://n8n.io → Sign up for Cloud (free tier = 5 workflows)
2. You get a URL like: `https://your-instance.app.n8n.cloud`
3. Go to Settings → API Keys → Create key (save it)
4. Go to Credentials → Add:
   - **HTTP Header Auth** named `n8n-backend-auth`:
     - Header Name: `x-n8n-secret`
     - Header Value: same secret as `N8N_WEBHOOK_SECRET` in backend `.env`
   - **Groq API** (if needed for direct LLM nodes):
     - API Key: `gsk_xxxx`

### 3. API Key Collection

Coordinate with teammates to collect these:

| Service | Who Gets It | Share With |
|---|---|---|
| Clerk publishable key | Laptop 1 | Laptop 1 only |
| Clerk secret key | Laptop 1 | Laptop 1 only |
| Groq API key | Laptop 2 | Laptop 2 + n8n |
| Pinecone API key | Laptop 2 | Laptop 2 only |
| PostgreSQL URL | Render auto-generates | Laptop 2 |
| n8n webhook URLs | You (Laptop 3) | Laptop 2 (for webhook routes) |
| N8N_WEBHOOK_SECRET | You (Laptop 3) | Laptop 2 + n8n credentials |

---

## N8N WORKFLOWS TO BUILD

### Overview: 5 Workflows

```
Workflow 1: Weekly Report Generator        (cron → API → LLM → email)
Workflow 2: Doubt Escalation Alert         (cron → API → filter → email)
Workflow 3: Syllabus Upload Notification   (webhook → email)
Workflow 4: Daily Doubt Digest             (cron → API → format → email)
Workflow 5: Welcome Email on Sign-up       (webhook → email)
```

---

### WORKFLOW 1: Weekly Report Generator (THE MOST IMPORTANT)

**Trigger:** Cron — Every Sunday at 10 PM
**Purpose:** Generate AI learning reports for each active student

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Cron Trigger│────▶│ HTTP Request:    │────▶│ Loop Over Students  │
│  Sun 10 PM   │     │ GET /api/v1/     │     │                     │
└─────────────┘     │ doubts/recent?   │     └─────────┬───────────┘
                    │ limit=1000       │               │
                    └──────────────────┘               ▼
                                              ┌───────────────────┐
                                              │ HTTP Request:     │
                                              │ POST /api/v1/     │
                                              │ webhooks/n8n/     │
                                              │ generate-report   │
                                              │                   │
                                              │ Headers:          │
                                              │ x-n8n-secret: xxx │
                                              │                   │
                                              │ Body:             │
                                              │ {user_id: "..."}  │
                                              └─────────┬─────────┘
                                                        │
                                                        ▼
                                              ┌───────────────────┐
                                              │ Send Email        │
                                              │ To: student email │
                                              │ Subject: "Your    │
                                              │ Weekly DoubtMap   │
                                              │ Report is Ready!" │
                                              │ Body: report link │
                                              └───────────────────┘
```

**n8n Node-by-Node Setup:**

1. **Schedule Trigger**
   - Mode: Cron
   - Expression: `0 22 * * 0` (Sunday 10 PM)

2. **HTTP Request — Get Active Students**
   - Method: GET
   - URL: `{{$env.BACKEND_URL}}/api/v1/doubts/recent?limit=1000`
   - Authentication: Header Auth (x-n8n-secret)
   - Purpose: Get all recent doubts to extract unique student IDs

3. **Code Node — Extract Unique Student IDs**
   ```javascript
   const doubts = $input.all()[0].json.doubts;
   const uniqueUserIds = [...new Set(doubts.map(d => d.user_id))];
   return uniqueUserIds.map(id => ({ json: { user_id: id } }));
   ```

4. **HTTP Request — Generate Report (loops per student)**
   - Method: POST
   - URL: `{{$env.BACKEND_URL}}/api/v1/webhooks/n8n/generate-report?user_id={{$json.user_id}}`
   - Headers: `x-n8n-secret: {{$env.N8N_SECRET}}`

5. **Send Email Node**
   - To: `{{$json.email}}` (or skip email, just generate report in DB)
   - Subject: `Your Weekly DoubtMap Learning Report`
   - Body:
   ```html
   <h2>Hi {{$json.name}}!</h2>
   <p>Your weekly learning report is ready on DoubtMap.</p>
   <p><a href="{{$env.FRONTEND_URL}}/student/reports">View Your Report →</a></p>
   <p>Keep learning! 🎯</p>
   ```

---

### WORKFLOW 2: Doubt Escalation Alert

**Trigger:** Cron — Every 6 hours
**Purpose:** Alert professors when multiple students are confused about the same topic

```
┌─────────────┐     ┌────────────────────┐     ┌──────────────┐     ┌──────────────┐
│ Cron Trigger│────▶│ HTTP Request:      │────▶│ IF escalated │────▶│ Send Email   │
│ Every 6 hrs │     │ POST /api/v1/      │     │ _count > 0   │     │ to professor │
└─────────────┘     │ webhooks/n8n/      │     └──────────────┘     └──────────────┘
                    │ get-escalated      │
                    └────────────────────┘
```

**n8n Node-by-Node Setup:**

1. **Schedule Trigger**
   - Mode: Interval
   - Every: 6 hours

2. **HTTP Request — Get Escalated Doubts**
   - Method: POST
   - URL: `{{$env.BACKEND_URL}}/api/v1/webhooks/n8n/get-escalated`
   - Headers: `x-n8n-secret: {{$env.N8N_SECRET}}`

3. **IF Node**
   - Condition: `{{$json.escalated_count}}` > 0

4. **Code Node — Format Email Body**
   ```javascript
   const doubts = $input.all()[0].json.doubts;
   let html = '<h2>🚨 Students Need Help!</h2>';
   html += `<p>${doubts.length} topics have low AI confidence:</p><ul>`;
   for (const d of doubts) {
     html += `<li><strong>${d.topic}</strong>: "${d.message}" (Confidence: ${(d.confidence * 100).toFixed(0)}%)</li>`;
   }
   html += '</ul>';
   html += `<p><a href="${$env.FRONTEND_URL}/professor/escalations">Respond on DoubtMap →</a></p>`;
   return [{ json: { emailBody: html } }];
   ```

5. **Send Email Node**
   - To: professor email (hardcode for hackathon demo, or get from API)
   - Subject: `DoubtMap Alert: Students are struggling with ${escalated_count} topics`
   - Body: `{{$json.emailBody}}`

---

### WORKFLOW 3: Syllabus Upload Notification

**Trigger:** Webhook (backend calls this after syllabus upload)
**Purpose:** Notify students that new syllabus material is available

```
┌───────────────┐     ┌──────────────┐     ┌───────────────────┐
│ Webhook       │────▶│ Format Msg   │────▶│ Send Email        │
│ /syllabus-    │     │              │     │ to all students   │
│ uploaded      │     │              │     │                   │
└───────────────┘     └──────────────┘     └───────────────────┘
```

**n8n Node-by-Node Setup:**

1. **Webhook Trigger**
   - Method: POST
   - Path: `/syllabus-uploaded`
   - Authentication: Header Auth
   - Expected body:
   ```json
   {
     "subject": "Data Structures",
     "filename": "ds_syllabus.pdf",
     "professor_name": "Dr. Smith"
   }
   ```

2. **Send Email Node**
   - To: all students (hardcode list for hackathon)
   - Subject: `New Syllabus Available: {{$json.subject}}`
   - Body:
   ```html
   <h2>New study material on DoubtMap!</h2>
   <p>Professor {{$json.professor_name}} uploaded the syllabus for <strong>{{$json.subject}}</strong>.</p>
   <p>You can now ask AI doubts about this subject!</p>
   <p><a href="{{$env.FRONTEND_URL}}/student/chat">Start Asking Doubts →</a></p>
   ```

**Tell Laptop 2:** After syllabus upload succeeds, add an HTTP call to this webhook URL:
- `POST https://your-instance.app.n8n.cloud/webhook/syllabus-uploaded`

---

### WORKFLOW 4: Daily Doubt Digest

**Trigger:** Cron — Every day at 8 PM
**Purpose:** Send students a summary of the day's campus-wide popular doubts

```
┌─────────────┐     ┌────────────────┐     ┌──────────────┐     ┌──────────────┐
│ Cron Trigger│────▶│ HTTP Request:  │────▶│ Code Node:   │────▶│ Send Email   │
│ Daily 8 PM  │     │ GET /api/v1/   │     │ Format top 5 │     │ digest       │
└─────────────┘     │ doubts/heatmap │     │ topics       │     └──────────────┘
                    └────────────────┘     └──────────────┘
```

**n8n Node-by-Node Setup:**

1. **Schedule Trigger** — Daily at 8 PM

2. **HTTP Request** — GET heatmap data

3. **Code Node**
   ```javascript
   const topics = $input.all()[0].json.topics.slice(0, 5);
   let html = '<h2>📊 Today on DoubtMap</h2>';
   html += '<p>Here are the hottest topics your classmates are asking about:</p>';
   html += '<ol>';
   for (const t of topics) {
     const emoji = t.avg_confidence < 0.6 ? '🔴' : t.avg_confidence < 0.8 ? '🟡' : '🟢';
     html += `<li>${emoji} <strong>${t.topic}</strong> — ${t.count} doubts (avg confidence: ${(t.avg_confidence * 100).toFixed(0)}%)</li>`;
   }
   html += '</ol>';
   html += `<p><a href="${$env.FRONTEND_URL}/student/chat">Ask your own doubts →</a></p>`;
   return [{ json: { emailBody: html } }];
   ```

4. **Send Email** — To subscribed students

---

### WORKFLOW 5: Welcome Email on Sign-up

**Trigger:** Webhook (Clerk sends this on new user creation)
**Purpose:** Welcome new students/professors

```
┌───────────────┐     ┌──────────────┐     ┌──────────────┐
│ Webhook       │────▶│ IF student   │────▶│ Send Welcome │
│ /new-user     │     │ or professor │     │ Email        │
└───────────────┘     └──────────────┘     └──────────────┘
```

**Tell Laptop 1:** In Clerk dashboard → Webhooks → Add endpoint:
- URL: `https://your-instance.app.n8n.cloud/webhook/new-user`
- Events: `user.created`

---

## N8N ENVIRONMENT VARIABLES

Set these in n8n Cloud → Settings → Variables:

| Variable | Value |
|---|---|
| `BACKEND_URL` | `http://localhost:8000` (dev) / `https://doubtmap-api.onrender.com` (prod) |
| `FRONTEND_URL` | `http://localhost:3000` (dev) / `https://doubtmap.vercel.app` (prod) |
| `N8N_SECRET` | Same value as `N8N_WEBHOOK_SECRET` in backend |

---

## DEMO COORDINATION (CRITICAL FOR WINNING)

### Demo Script (5-minute pitch)

**Minute 1: Problem + Solution (YOU or team presenter)**
```
"Every student has doubts. They wait for office hours, spam WhatsApp
groups, or just give up. Professors have no idea which topics confuse
students until the exam results come in.

DoubtMap fixes both sides."
```

**Minute 2: Live Demo — Student Flow (Laptop 1 shows)**
1. Open DoubtMap landing page → Sign up as "Student"
2. Upload has already been done → show syllabus is indexed
3. Go to Chat → Toggle "Socratic Mode" ON
4. Ask: "What is a binary search tree?"
5. AI responds socratically: "Before I explain, what do you know about binary trees?"
6. Student responds → AI guides them
7. Show confidence badge + source references

**Minute 3: Live Demo — Professor Flow (Laptop 1 shows)**
1. Switch to Professor account
2. Show Dashboard → Doubt Heatmap (real data from student demo)
3. "Look — the AI detected 'Binary Trees' as the topic. 47 students asked about this."
4. Show Escalations page → "These are doubts where AI wasn't confident"
5. Professor types a response → it gets added to knowledge base

**Minute 4: Live Demo — n8n Automation (YOU show)**
1. Open n8n Cloud dashboard → Show workflows visually
2. "Every Sunday night, n8n automatically generates a personalized report for each student"
3. Show the Weekly Report workflow → trigger it manually → show email sent
4. "When students are struggling, professors get alerted automatically"
5. Show Escalation Alert workflow
6. "This is a fully automated, self-improving learning platform"

**Minute 5: Impact + Future (Presenter)**
```
"DoubtMap turns every doubt into data. Students learn better with
Socratic guidance. Professors see confusion before exams. The AI
gets smarter as professors contribute.

And it's built with n8n orchestrating everything — from report
generation to smart escalation to notifications."
```

---

## TESTING CHECKLIST

### Before Demo Day, verify ALL of these:

**Frontend Tests (ask Laptop 1 to check):**
- [ ] Landing page loads on Vercel URL
- [ ] Sign up works (student + professor)
- [ ] Student chat sends message and gets AI response
- [ ] Socratic vs Direct mode toggle works
- [ ] Professor dashboard shows heatmap data
- [ ] Syllabus upload works
- [ ] Reports page shows data

**Backend Tests (ask Laptop 2 to check):**
- [ ] `/health` returns `{"status": "ok"}`
- [ ] `/chat/ask` returns AI response with confidence + sources
- [ ] Syllabus upload processes and indexes to Pinecone
- [ ] `/doubts/heatmap` returns topic data
- [ ] `/webhooks/n8n/generate-report` generates a report
- [ ] PostgreSQL has data in all tables

**n8n Tests (YOUR responsibility):**
- [ ] Weekly Report workflow executes successfully
- [ ] Escalation Alert workflow fires and sends email
- [ ] Webhook endpoints are reachable from n8n
- [ ] All credentials are working
- [ ] Environment variables point to production URLs (not localhost)

**End-to-End Flow:**
- [ ] Student asks doubt → appears in professor dashboard
- [ ] Low confidence doubt → escalation workflow picks it up
- [ ] Weekly report workflow → generates report → student sees it in Reports page
- [ ] Syllabus upload → n8n notification → students can ask about it

---

## TIMELINE / COORDINATION

### Hour 0-1: Setup
- [ ] You: Create GitHub repo, folder structure, .gitignore
- [ ] You: Set up n8n Cloud account + credentials
- [ ] Laptop 1: Initialize Next.js project
- [ ] Laptop 2: Initialize FastAPI project
- [ ] Everyone: Share API keys in team chat

### Hour 1-4: Core Build (parallel)
- [ ] Laptop 1: Builds landing page + chat UI (with mock data)
- [ ] Laptop 2: Builds `/chat/ask` endpoint + RAG pipeline
- [ ] You: Build Workflow 1 (Weekly Report) + Workflow 2 (Escalation)

### Hour 4-6: Integration
- [ ] Laptop 1: Connects chat to real backend API
- [ ] Laptop 2: Deploys to Render (gets live URL)
- [ ] You: Update n8n env vars to point to Render URL
- [ ] You: Test webhook endpoints from n8n

### Hour 6-8: Professor Features
- [ ] Laptop 1: Builds professor dashboard + heatmap
- [ ] Laptop 2: Builds heatmap + escalation endpoints
- [ ] You: Build Workflow 3 (Syllabus notification) + Workflow 4 (Daily digest)

### Hour 8-10: Polish + Test
- [ ] Laptop 1: Deploys frontend to Vercel
- [ ] You: Update n8n env vars to Vercel URL
- [ ] You: Run full end-to-end test checklist
- [ ] Everyone: Fix bugs found during testing

### Hour 10-12: Demo Prep
- [ ] Upload a real syllabus PDF (use a CS textbook chapter)
- [ ] Generate fake doubt data by asking 10-15 questions
- [ ] Trigger weekly report workflow manually
- [ ] Prepare demo script + practice presentation
- [ ] Test on actual judge-presentation laptop/projector

---

## GIT WORKFLOW (YOU ENFORCE THIS)

### Branch Strategy
```
main              ← production, deployed
├── frontend      ← Laptop 1 works here
├── backend       ← Laptop 2 works here
└── n8n           ← You work here (just docs)
```

### Rules:
1. Each person works on their branch
2. Only YOU merge to main (coordinator role)
3. No one touches each other's folders
4. Merge order: backend first → frontend second → n8n last

### Merge Commands (You run these):
```bash
# When backend is ready
git checkout main
git merge backend

# When frontend is ready (after backend is merged)
git merge frontend

# When n8n docs are ready
git merge n8n

# Push to GitHub
git push origin main
```

---

## FILES YOU CREATE IN THE REPO

```
n8n/
├── workflows/
│   ├── workflow1-weekly-report.json       ← Export from n8n Cloud
│   ├── workflow2-escalation-alert.json
│   ├── workflow3-syllabus-notification.json
│   ├── workflow4-daily-digest.json
│   └── workflow5-welcome-email.json
└── docs/
    ├── n8n-setup-guide.md                 ← How to replicate n8n setup
    └── workflow-descriptions.md           ← What each workflow does
```

To export workflows from n8n Cloud:
- Open workflow → three dots menu → Download as JSON
- Save in `n8n/workflows/`

---

## DO'S AND DON'TS

| DO | DON'T |
|---|---|
| Set up GitHub repo first thing | Let everyone push to main randomly |
| Collect ALL API keys in first 30 min | Wait until integration to share keys |
| Test webhook endpoints early | Assume webhooks will "just work" |
| Export n8n workflows as JSON | Only have workflows in n8n Cloud |
| Practice the n8n demo portion | Wing the demo presentation |
| Be the coordinator / project manager | Only focus on n8n and ignore chaos |
| Keep a shared doc of all URLs and keys | Put secrets in Git or chat history |
| Update n8n env vars when URLs change | Forget to update from localhost → prod |

---

## PRIORITY ORDER (If time is short)

1. GitHub repo setup + folder structure (MUST — first 15 min)
2. Workflow 1: Weekly Report Generator (MUST — judges will ask about n8n)
3. Workflow 2: Escalation Alert (MUST — shows real automation)
4. End-to-end testing (MUST — broken demo = instant loss)
5. Workflow 3: Syllabus notification
6. Workflow 5: Welcome email
7. Workflow 4: Daily digest
8. Demo script preparation + practice

---

## EMERGENCY FALLBACKS

**If n8n Cloud is down:**
- Self-host n8n on Render using Docker image `n8nio/n8n`
- Or show n8n workflows as screenshots during demo

**If backend isn't ready for n8n integration:**
- Build workflows but use static test data
- Demo: "Here's what happens when we trigger this" (show workflow + explain)

**If email sending doesn't work:**
- Use n8n's built-in "Send Email" node with Gmail SMTP
- Or skip emails, just show the workflow executing and generating reports in DB

**If Render is slow (free tier cold starts):**
- Hit the `/health` endpoint 2 minutes before demo to wake it up
- Or set up a cron in n8n to ping `/health` every 10 minutes (keep alive)
