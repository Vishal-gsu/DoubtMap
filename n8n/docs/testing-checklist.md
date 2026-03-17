# n8n Testing & Validation Checklist

This comprehensive checklist ensures all n8n workflows are working correctly before demo day.

---

## Pre-Testing Setup

Before running any tests, ensure:

- [ ] n8n Cloud account is set up and accessible
- [ ] All 5 workflows are imported into n8n Cloud
- [ ] Credentials are configured (`n8n-backend-auth`, email service)
- [ ] Environment variables are set (`BACKEND_URL`, `FRONTEND_URL`, `N8N_SECRET`)
- [ ] Backend is deployed and accessible (or running locally)
- [ ] You have the `N8N_WEBHOOK_SECRET` value

---

## 1. Workflow 1: Weekly Report Generator

### Setup Check
- [ ] Workflow is imported and saved
- [ ] Schedule trigger is set to `0 22 * * 0` (Sunday 10 PM)
- [ ] `BACKEND_URL` environment variable is correct
- [ ] `n8n-backend-auth` credential is configured

### Manual Test (Execute Workflow)
- [ ] Click "Execute Workflow" button in n8n
- [ ] **Node 1** (Schedule Trigger) → Executes successfully
- [ ] **Node 2** (HTTP - Get Recent Doubts) → Returns 200 OK with doubts array
- [ ] **Node 3** (Code - Extract Students) → Returns array of unique user IDs
- [ ] **Node 4** (HTTP - Generate Report) → Calls backend successfully for each student
- [ ] **Node 5** (Send Email) → Email is sent (check inbox or logs)
- [ ] All nodes show green checkmarks
- [ ] No error messages in execution log

### Backend Verification
```bash
# Test backend endpoint directly
curl -X GET "http://localhost:8000/api/v1/doubts/recent?limit=1000" \
  -H "x-n8n-secret: YOUR_SECRET_HERE" \
  | jq .
```

Expected response:
```json
{
  "doubts": [
    {
      "user_id": "...",
      "user_email": "...",
      "user_name": "...",
      "topic": "...",
      "confidence": 0.85
    }
  ]
}
```

### Live Test (Scheduled)
- [ ] Set schedule to 2 minutes from now (for testing)
- [ ] Activate workflow
- [ ] Wait for trigger time
- [ ] Check n8n Executions tab for automatic run
- [ ] Verify emails were sent
- [ ] Reset schedule back to Sunday 10 PM

### Email Verification
- [ ] Email received in inbox (or spam folder)
- [ ] Subject line is correct: "Your Weekly DoubtMap Learning Report"
- [ ] HTML formatting looks good (no broken styles)
- [ ] Link to `{{FRONTEND_URL}}/student/reports` works
- [ ] Name is correctly populated (if available)

### Sign-off
- [ ] ✅ Workflow 1 is fully working and tested

---

## 2. Workflow 2: Doubt Escalation Alert

### Setup Check
- [ ] Workflow is imported and saved
- [ ] Schedule trigger is set to **Every 6 hours**
- [ ] `BACKEND_URL` environment variable is correct
- [ ] `n8n-backend-auth` credential is configured

### Manual Test (Execute Workflow)
- [ ] Click "Execute Workflow" button
- [ ] **Node 1** (Schedule Trigger) → Executes
- [ ] **Node 2** (HTTP - Get Escalated) → Returns escalated doubts data
- [ ] **Node 3** (IF Node) → Checks if `escalated_count > 0`
  - **If YES** → Goes to Code node (Node 4)
  - **If NO** → Goes to NoOp node (workflow stops gracefully)
- [ ] **Node 4** (Code - Format Email) → Returns formatted HTML
- [ ] **Node 5** (Send Email) → Email sent to professor

### Backend Verification
```bash
# Test backend endpoint
curl -X POST "http://localhost:8000/api/v1/webhooks/n8n/get-escalated" \
  -H "Content-Type: application/json" \
  -H "x-n8n-secret: YOUR_SECRET_HERE" \
  | jq .
```

Expected response:
```json
{
  "escalated_count": 3,
  "doubts": [
    {
      "topic": "Binary Trees",
      "message": "...",
      "confidence": 0.55
    }
  ]
}
```

### Test with NO escalations
- [ ] If backend returns `escalated_count: 0`, workflow stops at IF node
- [ ] No email is sent
- [ ] NoOp node executes (gray/green checkmark)

### Test with escalations present
- [ ] Backend returns some escalated doubts
- [ ] Email HTML is formatted correctly
- [ ] Email shows all escalated topics
- [ ] Confidence percentages display correctly (e.g., 55%)
- [ ] Emoji indicators work (🔴 for < 60%, 🟡 for < 70%)

### Email Verification
- [ ] Email subject: "DoubtMap Alert: X topics need your attention"
- [ ] Email body lists all escalated doubts
- [ ] Link to `{{FRONTEND_URL}}/professor/escalations` works
- [ ] HTML formatting is correct

### Live Test (Scheduled)
- [ ] Set interval to 5 minutes (for testing)
- [ ] Activate workflow
- [ ] Wait for trigger
- [ ] Check executions log
- [ ] Reset interval back to 6 hours

### Sign-off
- [ ] ✅ Workflow 2 is fully working and tested

---

## 3. Workflow 3: Syllabus Upload Notification

### Setup Check
- [ ] Workflow is imported and saved
- [ ] Webhook trigger is configured
- [ ] Path: `/webhook/syllabus-uploaded`
- [ ] Authentication: Header Auth (`x-n8n-secret`)
- [ ] `FRONTEND_URL` environment variable is correct

### Get Webhook URL
- [ ] Open workflow in n8n
- [ ] Click on Webhook node
- [ ] Copy "Production URL" (e.g., `https://your-instance.app.n8n.cloud/webhook/syllabus-uploaded`)
- [ ] Share this URL with Laptop 2 (Backend team)

### Manual Test (curl)
```bash
curl -X POST "https://your-instance.app.n8n.cloud/webhook/syllabus-uploaded" \
  -H "Content-Type: application/json" \
  -H "x-n8n-secret: YOUR_SECRET_HERE" \
  -d '{
    "subject": "Data Structures",
    "filename": "ds_syllabus.pdf",
    "professor_name": "Dr. Smith"
  }'
```

- [ ] Workflow executes automatically
- [ ] **Node 1** (Webhook) → Receives payload
- [ ] **Node 2** (Code - Format) → Extracts data and builds email HTML
- [ ] **Node 3** (Send Email) → Email sent
- [ ] **Node 4** (Webhook Response) → Returns success JSON
- [ ] curl receives response: `{"status": "success", "message": "Notification sent to students"}`

### Email Verification
- [ ] Subject: "New Syllabus Available: Data Structures"
- [ ] Body mentions professor name: "Dr. Smith"
- [ ] Body mentions subject: "Data Structures"
- [ ] Body mentions filename: "ds_syllabus.pdf"
- [ ] Link to chat page works
- [ ] HTML formatting is good

### Backend Integration Test
- [ ] Ask Laptop 2 to add webhook call after syllabus upload
- [ ] Upload a real syllabus in frontend
- [ ] Verify webhook is called automatically
- [ ] Check n8n Executions tab for automatic trigger
- [ ] Verify email was sent

### Sign-off
- [ ] ✅ Workflow 3 is fully working and tested

---

## 4. Workflow 4: Daily Doubt Digest

### Setup Check
- [ ] Workflow is imported and saved
- [ ] Schedule trigger: `0 20 * * *` (Daily 8 PM)
- [ ] `BACKEND_URL` and `FRONTEND_URL` are correct
- [ ] `n8n-backend-auth` credential configured

### Manual Test
- [ ] Click "Execute Workflow"
- [ ] **Node 1** (Schedule Trigger) → Executes
- [ ] **Node 2** (HTTP - Get Heatmap) → Returns topics array
- [ ] **Node 3** (Code - Format) → Returns top 5 topics formatted as HTML
- [ ] **Node 4** (Send Email) → Email sent

### Backend Verification
```bash
curl -X GET "http://localhost:8000/api/v1/doubts/heatmap" \
  -H "x-n8n-secret: YOUR_SECRET_HERE" \
  | jq .
```

Expected response:
```json
{
  "topics": [
    {
      "topic": "Binary Search Trees",
      "count": 47,
      "avg_confidence": 0.72
    }
  ]
}
```

### Code Node Verification
- [ ] Code node slices to top 5 topics
- [ ] Emoji logic works:
  - 🔴 for confidence < 0.6
  - 🟡 for confidence < 0.8
  - 🟢 for confidence >= 0.8
- [ ] Confidence displayed as percentage (e.g., 72%)

### Email Verification
- [ ] Subject: "📊 Today on DoubtMap: Top X Topics"
- [ ] Body lists exactly 5 topics (or fewer if not enough data)
- [ ] Each topic shows: emoji, topic name, count, avg confidence
- [ ] Link to chat page works
- [ ] Legend explains emoji colors

### Live Test
- [ ] Set schedule to 1-2 minutes from now
- [ ] Activate workflow
- [ ] Wait for trigger
- [ ] Verify email sent
- [ ] Reset schedule to 8 PM daily

### Sign-off
- [ ] ✅ Workflow 4 is fully working and tested

---

## 5. Workflow 5: Welcome Email on Sign-up

### Setup Check
- [ ] Workflow is imported and saved
- [ ] Webhook trigger configured
- [ ] Path: `/webhook/new-user`
- [ ] `FRONTEND_URL` environment variable correct

### Get Webhook URL
- [ ] Copy webhook URL from Webhook node
- [ ] Share with Laptop 1 for Clerk configuration

### Manual Test - Student
```bash
curl -X POST "https://your-instance.app.n8n.cloud/webhook/new-user" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "email_addresses": [{"email_address": "student@test.com"}],
      "first_name": "John",
      "public_metadata": {"role": "student"}
    }
  }'
```

- [ ] Workflow executes
- [ ] **Node 1** (Webhook) → Receives data
- [ ] **Node 2** (Code - Extract) → Extracts email, name, role
- [ ] **Node 3** (IF Node) → Detects role = "student", takes TRUE branch
- [ ] **Node 4** (Code - Student Email) → Builds student welcome email
- [ ] **Node 5** (Send Email - Student) → Email sent
- [ ] **Node 6** (Webhook Response) → Returns success
- [ ] curl receives: `{"status": "success", "message": "Welcome email sent"}`

### Manual Test - Professor
```bash
curl -X POST "https://your-instance.app.n8n.cloud/webhook/new-user" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "email_addresses": [{"email_address": "prof@test.com"}],
      "first_name": "Smith",
      "public_metadata": {"role": "professor"}
    }
  }'
```

- [ ] IF node detects role != "student", takes FALSE branch
- [ ] **Node 4** (Code - Professor Email) → Builds professor welcome email
- [ ] **Node 5** (Send Email - Professor) → Email sent

### Email Verification - Student
- [ ] Subject: "Welcome to DoubtMap! 🎓"
- [ ] Body greets student by name
- [ ] Lists student features (ask doubts, track reports, see heatmap)
- [ ] Link to `/student/chat` works
- [ ] Pro Tip about Socratic Mode is visible

### Email Verification - Professor
- [ ] Subject: "Welcome to DoubtMap, Professor! 👨‍🏫"
- [ ] Body greets professor by name
- [ ] Lists professor features (dashboard, escalations, upload syllabus)
- [ ] Link to `/professor/dashboard` works
- [ ] Pro Tip about uploading syllabus is visible

### Clerk Integration Test
- [ ] Ask Laptop 1 to configure webhook in Clerk
- [ ] Create a test user in Clerk
- [ ] Verify n8n workflow triggered automatically
- [ ] Check Executions tab for automatic run
- [ ] Verify welcome email received

### Sign-off
- [ ] ✅ Workflow 5 is fully working and tested

---

## 6. End-to-End Integration Tests

### Test 1: Student Journey
1. [ ] Student signs up → Welcome email received (Workflow 5)
2. [ ] Student asks a doubt → Doubt saved to DB (Backend)
3. [ ] Sunday 10 PM → Weekly report generated (Workflow 1)
4. [ ] Student receives report email
5. [ ] Student clicks link → Sees report in frontend

### Test 2: Professor Journey
1. [ ] Professor uploads syllabus → Notification sent (Workflow 3)
2. [ ] Students receive syllabus notification email
3. [ ] Multiple students ask confusing doubts (low confidence)
4. [ ] Next 6-hour interval → Escalation alert sent (Workflow 2)
5. [ ] Professor receives alert email
6. [ ] Professor clicks link → Sees escalations in frontend

### Test 3: Daily Digest
1. [ ] Students ask various doubts throughout the day
2. [ ] 8 PM → Digest workflow runs (Workflow 4)
3. [ ] All students receive daily digest email
4. [ ] Email shows top 5 trending topics

---

## 7. Performance & Reliability Tests

### Execution Time
- [ ] Workflow 1 completes in < 2 minutes for 50 students
- [ ] Workflow 2 completes in < 30 seconds
- [ ] Workflow 3 webhook responds in < 10 seconds
- [ ] Workflow 4 completes in < 30 seconds
- [ ] Workflow 5 webhook responds in < 10 seconds

### Error Handling
- [ ] If backend is down, workflow shows clear error (doesn't crash)
- [ ] If email fails, workflow logs error (check Executions tab)
- [ ] If webhook receives invalid data, workflow handles gracefully

### Scalability (Optional - for advanced testing)
- [ ] Test Workflow 1 with 100+ students (should still work)
- [ ] Test Workflow 2 with 50+ escalated doubts
- [ ] Test Workflow 4 with 100+ topics in heatmap

---

## 8. Demo Day Preparation

### Production Environment Check
- [ ] `BACKEND_URL` points to production (not localhost)
- [ ] `FRONTEND_URL` points to production (not localhost)
- [ ] All workflows are ACTIVATED (green toggle)
- [ ] Credentials are valid and secure
- [ ] Webhook URLs shared with team

### Demo Script Preparation
- [ ] Prepare 1-2 sample emails to show judges
- [ ] Take screenshots of:
  - [ ] All 5 workflows in n8n dashboard
  - [ ] Workflow 1 execution log (green nodes)
  - [ ] Sample emails (weekly report, escalation alert)
  - [ ] n8n Executions tab showing successful runs
- [ ] Prepare talking points for each workflow

### Manual Trigger Readiness
- [ ] Know how to manually trigger Workflow 1 during demo
- [ ] Know how to show execution logs during demo
- [ ] Have backup screenshots if live demo fails

### Fallback Plan
- [ ] If n8n Cloud is down, have workflow screenshots ready
- [ ] If backend is slow, pre-generate sample data
- [ ] If email fails, show workflow execution (green nodes = success)

---

## 9. Final Pre-Demo Checklist (Day Before)

### 24 Hours Before Demo
- [ ] Run all 5 workflows manually one last time
- [ ] Verify all emails are being received
- [ ] Check n8n Executions tab for any errors in last 24 hours
- [ ] Export all workflows to Git
- [ ] Commit and push to GitHub

### 2 Hours Before Demo
- [ ] Trigger Workflow 1 manually to generate fresh reports
- [ ] Verify reports appear in frontend
- [ ] Clear old execution logs (optional, for clean demo)
- [ ] Prepare laptop with n8n Cloud open in browser
- [ ] Test projector/screen sharing with n8n dashboard

### 30 Minutes Before Demo
- [ ] Log in to n8n Cloud
- [ ] Open Workflow 1 in a tab (ready to show)
- [ ] Have backup screenshots ready
- [ ] Verify internet connection is stable
- [ ] Do a 2-minute dry run of your demo portion

---

## 10. Post-Demo (Optional - for judges' questions)

Be ready to answer:
- [ ] "How do you handle email rate limits?" → Currently using n8n built-in (limited), can upgrade to Resend for 100/day
- [ ] "What if backend is slow?" → n8n has 30-second timeout, can increase to 60s
- [ ] "Can workflows be version-controlled?" → Yes, exported as JSON in Git
- [ ] "How do you monitor failures?" → n8n Executions tab logs all runs
- [ ] "What's scalability limit?" → Free tier = 5 workflows, paid tier = unlimited

---

## Success Criteria

You're ready for demo when:

✅ All 5 workflows execute without errors
✅ All emails are formatted correctly and delivered
✅ Backend integration works (n8n ↔ backend communication)
✅ Frontend integration works (emails link to correct pages)
✅ You can manually trigger workflows during demo
✅ Screenshots are prepared as backup
✅ All workflows are exported to Git
✅ Team coordination is complete (URLs, secrets shared)

---

**Last Updated**: March 2026 (Hackathon Build)
**Maintained by**: Laptop 3 (n8n + Integration Lead)
