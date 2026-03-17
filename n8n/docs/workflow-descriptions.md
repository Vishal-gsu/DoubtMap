# n8n Workflow Descriptions for DoubtMap

This document describes all 5 n8n workflows that power DoubtMap's automation layer.

---

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    DoubtMap n8n Workflows                       │
├─────────────────────────────────────────────────────────────────┤
│ 1. Weekly Report Generator    → Most Important (AI reports)    │
│ 2. Doubt Escalation Alert      → Critical (professor alerts)   │
│ 3. Syllabus Upload Notification→ Nice to have (student notify) │
│ 4. Daily Doubt Digest          → Engagement (campus trending)  │
│ 5. Welcome Email on Sign-up    → Onboarding (new users)        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Workflow 1: Weekly Report Generator 🎯 (MOST IMPORTANT)

### Purpose
Automatically generate personalized AI learning reports for each active student every Sunday night.

### Trigger
- **Type**: Schedule (Cron)
- **Frequency**: Every Sunday at 10 PM
- **Cron Expression**: `0 22 * * 0`

### What It Does
1. Fetches all recent doubts from the backend (last 7 days)
2. Extracts unique student IDs who asked doubts
3. For each student:
   - Calls backend API to generate AI report
   - Sends email notification with report link
4. Students log in and see their personalized report on the Reports page

### Flow Diagram
```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Cron       │────▶│ HTTP: GET        │────▶│ Code: Extract       │
│  Trigger    │     │ /doubts/recent   │     │ unique student IDs  │
└─────────────┘     └──────────────────┘     └──────────┬──────────┘
                                                         │
                                                         ▼
                                              ┌──────────────────────┐
                                              │ HTTP: POST (loop)    │
                                              │ /webhooks/n8n/       │
                                              │ generate-report      │
                                              └──────────┬───────────┘
                                                         │
                                                         ▼
                                              ┌──────────────────────┐
                                              │ Send Email           │
                                              │ "Your report ready!" │
                                              └──────────────────────┘
```

### API Calls
**Input (from backend):**
```bash
GET {{BACKEND_URL}}/api/v1/doubts/recent?limit=1000
```

**Output (to backend):**
```bash
POST {{BACKEND_URL}}/api/v1/webhooks/n8n/generate-report?user_id={{user_id}}
Headers: x-n8n-secret: {{N8N_SECRET}}
```

### Email Template
```
Subject: Your Weekly DoubtMap Learning Report

Hi {{name}}!

Your weekly learning report is ready. We analyzed all the doubts you asked this week and generated personalized insights.

View Your Report → {{FRONTEND_URL}}/student/reports

Keep learning! 🎯

~ The DoubtMap Team
```

### Demo Value
- Shows AI automation in action
- Judges love "personalized reports"
- Demonstrates n8n orchestrating complex workflows

---

## Workflow 2: Doubt Escalation Alert 🚨 (CRITICAL)

### Purpose
Alert professors when multiple students are confused about the same topic (low AI confidence).

### Trigger
- **Type**: Schedule (Interval)
- **Frequency**: Every 6 hours
- **Times**: 12 AM, 6 AM, 12 PM, 6 PM

### What It Does
1. Calls backend to get all "escalated" doubts (AI confidence < 70%)
2. Checks if there are any doubts needing professor attention
3. If yes, sends email to professor with:
   - List of topics students are struggling with
   - Confidence scores
   - Link to escalations dashboard

### Flow Diagram
```
┌─────────────┐     ┌────────────────┐     ┌──────────────┐     ┌─────────────┐
│ Interval    │────▶│ HTTP: POST     │────▶│ IF Node:     │────▶│ Code Node:  │
│ 6 hours     │     │ /webhooks/n8n/ │     │ escalated    │     │ Format      │
└─────────────┘     │ get-escalated  │     │ count > 0?   │     │ email HTML  │
                    └────────────────┘     └──────┬───────┘     └──────┬──────┘
                                                   │                    │
                                                   │ (No)               ▼
                                                   ▼              ┌──────────────┐
                                            (Stop workflow)       │ Send Email   │
                                                                  │ to professor │
                                                                  └──────────────┘
```

### API Calls
```bash
POST {{BACKEND_URL}}/api/v1/webhooks/n8n/get-escalated
Headers: x-n8n-secret: {{N8N_SECRET}}

Response:
{
  "escalated_count": 3,
  "doubts": [
    {
      "id": "doubt_123",
      "user_id": "user_abc",
      "topic": "Binary Search Trees",
      "message": "How do I balance a BST?",
      "confidence": 0.55
    }
  ]
}
```

### Email Template
```
Subject: DoubtMap Alert: 3 topics need your attention

🚨 Students Need Help!

3 topics have low AI confidence and may need your expertise:

• Binary Search Trees: "How do I balance a BST?" (Confidence: 55%)
• Dynamic Programming: "Explain memoization" (Confidence: 62%)
• Graph Algorithms: "Dijkstra vs Bellman-Ford?" (Confidence: 68%)

Respond on DoubtMap → {{FRONTEND_URL}}/professor/escalations

~ The DoubtMap Team
```

### Demo Value
- Shows proactive professor alerts
- Demonstrates AI confidence monitoring
- Real-time response to student struggles

---

## Workflow 3: Syllabus Upload Notification 📚

### Purpose
Notify students when a professor uploads new syllabus material.

### Trigger
- **Type**: Webhook
- **Path**: `/webhook/syllabus-uploaded`
- **Called by**: Backend (after successful syllabus upload)

### What It Does
1. Receives webhook from backend with:
   - Subject name
   - Filename
   - Professor name
2. Sends email to all students announcing new material

### Flow Diagram
```
┌───────────────┐     ┌──────────────┐     ┌───────────────────┐
│ Webhook       │────▶│ Format Msg   │────▶│ Send Email        │
│ Trigger       │     │ (optional)   │     │ to all students   │
└───────────────┘     └──────────────┘     └───────────────────┘
```

### Webhook Payload
```json
POST https://your-instance.app.n8n.cloud/webhook/syllabus-uploaded
Headers: x-n8n-secret: {{N8N_SECRET}}

Body:
{
  "subject": "Data Structures",
  "filename": "ds_syllabus.pdf",
  "professor_name": "Dr. Smith"
}
```

### Email Template
```
Subject: New Syllabus Available: Data Structures

New study material on DoubtMap!

Professor Dr. Smith uploaded the syllabus for Data Structures.

You can now ask AI doubts about this subject!

Start Asking Doubts → {{FRONTEND_URL}}/student/chat

~ The DoubtMap Team
```

### Backend Integration
Tell Laptop 2 to add this after syllabus upload succeeds:

```python
# In backend: after syllabus upload
import requests

n8n_webhook_url = "https://your-instance.app.n8n.cloud/webhook/syllabus-uploaded"
payload = {
    "subject": syllabus.subject,
    "filename": uploaded_file.filename,
    "professor_name": current_user.name
}
headers = {"x-n8n-secret": os.getenv("N8N_WEBHOOK_SECRET")}

requests.post(n8n_webhook_url, json=payload, headers=headers)
```

### Demo Value
- Shows instant notifications
- Demonstrates webhook integration
- Real-time campus updates

---

## Workflow 4: Daily Doubt Digest 📊

### Purpose
Send students a daily summary of the most popular topics being asked across campus.

### Trigger
- **Type**: Schedule (Cron)
- **Frequency**: Every day at 8 PM
- **Cron Expression**: `0 20 * * *`

### What It Does
1. Fetches heatmap data (top topics by volume)
2. Formats top 5 topics with:
   - Topic name
   - Number of doubts asked
   - Average AI confidence
   - Color-coded emoji (🔴 red = low confidence, 🟢 green = high)
3. Sends digest email to all students

### Flow Diagram
```
┌─────────────┐     ┌────────────────┐     ┌──────────────┐     ┌──────────────┐
│ Cron        │────▶│ HTTP: GET      │────▶│ Code: Format │────▶│ Send Email   │
│ Daily 8 PM  │     │ /doubts/heatmap│     │ top 5 topics │     │ digest       │
└─────────────┘     └────────────────┘     └──────────────┘     └──────────────┘
```

### API Calls
```bash
GET {{BACKEND_URL}}/api/v1/doubts/heatmap

Response:
{
  "topics": [
    {
      "topic": "Binary Search Trees",
      "count": 47,
      "avg_confidence": 0.72
    },
    {
      "topic": "Dynamic Programming",
      "count": 38,
      "avg_confidence": 0.58
    }
  ]
}
```

### Code Node Logic
```javascript
const topics = $input.all()[0].json.topics.slice(0, 5);
let html = '<h2>📊 Today on DoubtMap</h2>';
html += '<p>Here are the hottest topics your classmates are asking about:</p>';
html += '<ol>';

for (const t of topics) {
  const emoji = t.avg_confidence < 0.6 ? '🔴' :
                t.avg_confidence < 0.8 ? '🟡' : '🟢';
  html += `<li>${emoji} <strong>${t.topic}</strong> — ${t.count} doubts (avg confidence: ${(t.avg_confidence * 100).toFixed(0)}%)</li>`;
}

html += '</ol>';
html += `<p><a href="${$env.FRONTEND_URL}/student/chat">Ask your own doubts →</a></p>`;

return [{ json: { emailBody: html } }];
```

### Email Template
```
Subject: Today on DoubtMap: Top 5 Topics

📊 Today on DoubtMap

Here are the hottest topics your classmates are asking about:

1. 🟡 Binary Search Trees — 47 doubts (avg confidence: 72%)
2. 🔴 Dynamic Programming — 38 doubts (avg confidence: 58%)
3. 🟢 Sorting Algorithms — 29 doubts (avg confidence: 85%)
4. 🟡 Graph Traversal — 24 doubts (avg confidence: 74%)
5. 🔴 Recursion — 19 doubts (avg confidence: 63%)

Ask your own doubts → {{FRONTEND_URL}}/student/chat

~ The DoubtMap Team
```

### Demo Value
- Shows campus-wide engagement
- Gamification (trending topics)
- Encourages peer learning

---

## Workflow 5: Welcome Email on Sign-up 👋

### Purpose
Send a welcome email to new users (students or professors) upon sign-up.

### Trigger
- **Type**: Webhook
- **Path**: `/webhook/new-user`
- **Called by**: Clerk (auth provider) on `user.created` event

### What It Does
1. Receives webhook from Clerk with user details
2. Checks if user is student or professor
3. Sends role-appropriate welcome email

### Flow Diagram
```
┌───────────────┐     ┌──────────────┐     ┌──────────────┐
│ Webhook       │────▶│ IF Node:     │────▶│ Send Welcome │
│ from Clerk    │     │ Student or   │     │ Email        │
└───────────────┘     │ Professor?   │     └──────────────┘
                      └──────────────┘
```

### Webhook Payload (from Clerk)
```json
POST https://your-instance.app.n8n.cloud/webhook/new-user

Body:
{
  "type": "user.created",
  "data": {
    "id": "user_abc123",
    "email_addresses": [
      {"email_address": "student@example.com"}
    ],
    "first_name": "John",
    "public_metadata": {
      "role": "student"  // or "professor"
    }
  }
}
```

### Email Template (Student)
```
Subject: Welcome to DoubtMap! 🎓

Hi John!

Welcome to DoubtMap — your AI study buddy that actually teaches.

Here's what you can do:
✅ Ask doubts and get Socratic explanations
✅ Track your weekly learning reports
✅ See what your classmates are asking

Get Started → {{FRONTEND_URL}}/student/chat

Happy learning!

~ The DoubtMap Team
```

### Email Template (Professor)
```
Subject: Welcome to DoubtMap, Professor! 👨‍🏫

Hi John!

Welcome to DoubtMap — helping you understand student confusion before exams.

Here's what you can do:
✅ Monitor campus-wide doubt heatmaps
✅ Respond to escalated doubts (low AI confidence)
✅ Upload syllabus to improve AI accuracy

Get Started → {{FRONTEND_URL}}/professor/dashboard

~ The DoubtMap Team
```

### Clerk Setup
Tell Laptop 1 to configure this in Clerk Dashboard:

1. Go to **Webhooks** → Add endpoint
2. URL: `https://your-instance.app.n8n.cloud/webhook/new-user`
3. Events: Select `user.created`
4. Save and copy signing secret (use to verify webhook authenticity)

### Demo Value
- Seamless onboarding
- Shows integration with auth provider
- Professional user experience

---

## Workflow Priority Order

If time is limited during the hackathon, implement in this order:

1. **Workflow 1: Weekly Report Generator** (MUST — judges will ask)
2. **Workflow 2: Doubt Escalation Alert** (MUST — shows real automation value)
3. **Workflow 4: Daily Doubt Digest** (nice demo visual with trending topics)
4. **Workflow 3: Syllabus Upload Notification** (simple, quick to build)
5. **Workflow 5: Welcome Email** (lowest priority, can skip if needed)

---

## Key Metrics to Track

For demo day, have these stats ready:

- Total workflow executions
- Number of reports generated
- Number of escalations sent
- Email delivery success rate
- Average workflow execution time

Access in n8n Cloud → **Executions** tab

---

## Testing Each Workflow

| Workflow | How to Test |
|----------|-------------|
| Weekly Report | Click "Execute Workflow" manually OR wait until Sunday 10 PM |
| Escalation Alert | Execute manually OR set interval to 1 minute (test mode) |
| Syllabus Notification | Use curl to POST to webhook URL |
| Daily Digest | Execute manually OR set time to 1 minute from now |
| Welcome Email | Create a test user in Clerk OR use curl to POST webhook |

---

## Emergency Fallbacks

**If n8n Cloud is down during demo:**
- Show workflow screenshots (take these NOW!)
- Explain verbally what each workflow does
- Run backend webhooks manually via Postman

**If backend integration fails:**
- Use static JSON data in Code nodes
- Execute workflows manually to show flow
- Focus on workflow logic, not actual integration

**If email doesn't send:**
- Skip email step entirely
- Show that reports/alerts are generated in DB
- Demo the workflow execution (green nodes = success)

---

## Questions? Contact Info

**Laptop 3 (You)**: n8n + Integration Lead
**Laptop 2**: Backend API (provides webhook endpoints)
**Laptop 1**: Frontend (consumes reports, shows heatmaps)

**Team Coordination Doc**: Share webhook URLs, API keys, environment variables in your team chat/doc.

---

**Last Updated**: March 2026 (Hackathon Build)
**Status**: Ready for implementation 🚀
