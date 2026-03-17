# 🚀 TEAM COORDINATION - QUICK START

**Project**: DoubtMap
**Your Role (Laptop 3)**: n8n Integration + Deployment Orchestrator

---

## ✅ COMPLETED (Just Now)

- [x] Created GitHub repo structure
- [x] Designed 5 n8n workflows (JSON templates ready)
- [x] Wrote comprehensive documentation
- [x] Committed everything to Git

---

## 🎯 NEXT STEPS (In Order)

### STEP 1: Set Up n8n Cloud (15 minutes)

1. **Sign up**: https://n8n.io (free tier)
2. **Get your instance URL**: `https://your-instance.app.n8n.cloud`
3. **Create credentials**:
   - Name: `n8n-backend-auth`
   - Type: Header Auth
   - Header Name: `x-n8n-secret`
   - Header Value: Generate with:
     ```bash
     openssl rand -hex 32
     ```
   - **SAVE THIS SECRET** - you'll share it with Laptop 2!

4. **Set environment variables** (Settings → Variables):
   ```
   BACKEND_URL = http://localhost:8000      (dev)
   FRONTEND_URL = http://localhost:3000     (dev)
   N8N_SECRET = (same as x-n8n-secret above)
   ```

5. **Import workflows**:
   - Workflows → Import workflow
   - Upload each file from `n8n/workflows/`
   - Import all 5 workflows

**Reference**: `n8n/docs/n8n-setup-guide.md`

---

### STEP 2: Share Info with Team (5 minutes)

#### 📤 Give to Laptop 2 (Backend):

Create a secure team doc/chat message with:

```
🔐 n8n Integration Secrets (DO NOT COMMIT TO GIT)

N8N_WEBHOOK_SECRET = [your generated secret from Step 1]

n8n Webhook URLs:
- Syllabus Upload: https://your-instance.app.n8n.cloud/webhook/syllabus-uploaded
- New User: https://your-instance.app.n8n.cloud/webhook/new-user

Backend APIs needed by n8n:
- GET /api/v1/doubts/recent?limit=1000
- POST /api/v1/webhooks/n8n/get-escalated
- POST /api/v1/webhooks/n8n/generate-report?user_id=xxx
- GET /api/v1/doubts/heatmap

All must accept header: x-n8n-secret: [secret]
```

#### 📤 Give to Laptop 1 (Frontend):

```
Frontend Pages Needed:
- /student/reports (for weekly reports)
- /professor/dashboard (for heatmap)
- /professor/escalations (for low-confidence doubts)

Clerk Webhook Setup:
- URL: https://your-instance.app.n8n.cloud/webhook/new-user
- Event: user.created
```

#### 📥 Get from Laptop 2:

```
BACKEND_URL (production): https://doubtmap-api.onrender.com
(Update n8n env vars when you get this)
```

**Reference**: `n8n/docs/api-integration.md`

---

### STEP 3: Test Workflows (30 minutes)

**Don't activate yet!** Just test manually first.

1. **Test Workflow 1** (Weekly Report):
   - Open in n8n
   - Click "Execute Workflow" button
   - Expected: All nodes turn green
   - Check: Did backend return doubts? Did report generate?

2. **Test Workflow 2** (Escalation Alert):
   - Execute manually
   - Expected: IF node checks escalated_count
   - If 0 → Stops (NoOp)
   - If > 0 → Sends email

3. **Test Workflow 3** (Syllabus Notification):
   - Use curl to test webhook:
     ```bash
     curl -X POST "https://your-instance.app.n8n.cloud/webhook/syllabus-uploaded" \
       -H "Content-Type: application/json" \
       -H "x-n8n-secret: YOUR_SECRET" \
       -d '{"subject": "Test", "filename": "test.pdf", "professor_name": "Dr. Test"}'
     ```
   - Check: Did email send?

4. **Test Workflow 4** (Daily Digest):
   - Execute manually
   - Check: Does heatmap data format correctly?

5. **Test Workflow 5** (Welcome Email):
   - Use curl to test:
     ```bash
     curl -X POST "https://your-instance.app.n8n.cloud/webhook/new-user" \
       -H "Content-Type: application/json" \
       -d '{"data": {"email_addresses": [{"email_address": "test@test.com"}], "first_name": "Test", "public_metadata": {"role": "student"}}}'
     ```

**Reference**: `n8n/docs/testing-checklist.md`

---

### STEP 4: Activate Workflows (5 minutes)

Once testing passes:

1. Open each workflow
2. Toggle "Active" switch (top-right) to ON
3. Verify green indicator

**Important**: Only activate when backend is ready!

---

### STEP 5: Production Deployment (Before Demo)

When backend is deployed to Render:

1. Update n8n environment variables:
   ```
   BACKEND_URL = https://doubtmap-api.onrender.com
   FRONTEND_URL = https://doubtmap.vercel.app
   ```

2. Test all workflows again with production URLs

3. Export workflows to save:
   - Each workflow → ••• menu → Download
   - Save to `n8n/workflows/` (replace templates)
   - Commit to Git

---

## 📊 DEMO DAY PREPARATION

### What to Show (Minute 4 of 5-min pitch):

1. **Open n8n dashboard** → Show 5 workflows visually
2. **Click Workflow 1** → "Every Sunday, n8n generates personalized reports"
3. **Execute Workflow manually** → Show green nodes (success)
4. **Show Executions tab** → "All automatic runs logged here"
5. **Explain value**: "Fully automated, self-improving learning platform"

### Backup Plan:

- Take screenshots NOW of successful executions
- If n8n is down during demo, show screenshots
- Explain what each workflow does

---

## 📋 TEAM COORDINATION TIMELINE

### Hour 0-1: Setup Phase
- [x] ✅ You: GitHub repo + n8n docs (DONE)
- [ ] You: Set up n8n Cloud account
- [ ] Laptop 1: Initialize Next.js
- [ ] Laptop 2: Initialize FastAPI
- [ ] Share: API keys in team chat

### Hour 1-4: Core Build (Parallel)
- [ ] You: Import workflows + test with mock data
- [ ] Laptop 1: Build landing page + chat UI
- [ ] Laptop 2: Build `/chat/ask` endpoint + RAG

### Hour 4-6: Integration
- [ ] Laptop 2: Deploy to Render (GET URL!)
- [ ] You: Update n8n `BACKEND_URL` to Render
- [ ] You: Test workflows with real backend
- [ ] Laptop 1: Connect frontend to backend

### Hour 6-8: Professor Features
- [ ] Laptop 1: Dashboard + heatmap
- [ ] Laptop 2: Heatmap + escalation endpoints
- [ ] You: Final workflow testing

### Hour 8-10: Polish & Test
- [ ] Laptop 1: Deploy to Vercel (GET URL!)
- [ ] You: Update n8n `FRONTEND_URL` to Vercel
- [ ] Everyone: Run end-to-end tests
- [ ] You: Export workflows to Git

### Hour 10-12: Demo Prep
- [ ] Everyone: Practice demo script
- [ ] You: Trigger Workflow 1 manually (generate sample reports)
- [ ] You: Take screenshots of executions
- [ ] Everyone: Test on actual presentation setup

---

## 🎯 YOUR CRITICAL TASKS

**MUST DO (High Priority):**
1. Set up n8n Cloud account
2. Import Workflow 1 (Weekly Report) + Workflow 2 (Escalation)
3. Test with backend once deployed
4. Coordinate with team (share webhook URLs)
5. Prepare demo

**NICE TO HAVE (Medium Priority):**
6. Import Workflow 3 + 4
7. Configure Clerk webhook (Workflow 5)
8. Export final workflows to Git

**OPTIONAL (Low Priority):**
9. Set up email service (Resend)
10. Advanced error handling

---

## 🆘 EMERGENCY CONTACTS

**Stuck on n8n setup?**
- Read: `n8n/docs/n8n-setup-guide.md`
- n8n Community: https://community.n8n.io

**Backend integration failing?**
- Read: `n8n/docs/api-integration.md`
- Talk to Laptop 2

**Don't know what to demo?**
- Read: `n8n/docs/workflow-descriptions.md` (Demo Value sections)

**Testing checklist?**
- Read: `n8n/docs/testing-checklist.md`

---

## ✅ SUCCESS CHECKLIST

You're ready for demo when:

- [ ] All 5 workflows imported to n8n Cloud
- [ ] Workflow 1 + 2 tested and working
- [ ] Backend can call n8n webhooks (test with curl)
- [ ] n8n can call backend APIs (test with Execute Workflow)
- [ ] Production URLs configured (not localhost)
- [ ] Workflows activated (green toggle)
- [ ] Screenshots taken as backup
- [ ] Can explain value during demo

---

## 💡 PRO TIPS

1. **Don't activate workflows until backend is ready** → You'll get errors
2. **Test with curl first** → Faster than waiting for cron
3. **Use Execute Workflow button** → Test manually before scheduling
4. **Check Executions tab often** → See all runs + errors
5. **Take screenshots NOW** → Backup if live demo fails
6. **Keep team updated** → Share URLs/secrets immediately

---

**You've got this! 🚀 Good luck with the hackathon!**

---

**Quick Links:**
- Setup Guide: `n8n/docs/n8n-setup-guide.md`
- Workflow Details: `n8n/docs/workflow-descriptions.md`
- API Integration: `n8n/docs/api-integration.md`
- Testing: `n8n/docs/testing-checklist.md`
- n8n README: `n8n/README.md`
