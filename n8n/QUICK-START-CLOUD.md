# ⚡ FASTEST n8n CLOUD SETUP - 20 Minutes
## For Hackathon - No Time to Waste!

---

## 🎯 YOUR GOAL

Get 5 workflows into n8n Cloud, get webhook URLs, share with team. That's it!

---

## 📱 STEP 1: Go to n8n Cloud (2 min)

1. Open browser: **https://app.n8n.cloud/login**
2. Sign up / Log in (use your Google account for fastest)
3. You'll land on the n8n dashboard

---

## 📥 STEP 2: Import Workflows - FASTEST METHOD (10 min)

### Do this for EACH workflow file:

**Location of files:**
```
/home/prashant/Desktop/hack/DoubtMap/n8n/workflows/
```

**For each file (5 total):**

1. **In n8n Cloud:** Click **"Workflows"** (left sidebar)
2. Click **"Add workflow"** or **"New workflow"** button
3. You'll see a blank canvas
4. **Look for menu icon** (three dots ⋯ or hamburger ≡) at **top-right**
5. Click it → Select **"Import from file"**
6. Browse to: `/home/prashant/Desktop/hack/DoubtMap/n8n/workflows/`
7. Select: `workflow1-weekly-report.json`
8. Click **Open**
9. Workflow appears on canvas!
10. Click **"Save"** (top-right corner, cloud/disk icon)

**Repeat for all 5 files:**
- ✅ workflow1-weekly-report.json
- ✅ workflow2-escalation-alert.json
- ✅ workflow3-syllabus-notification.json
- ✅ workflow4-daily-digest.json
- ✅ workflow5-welcome-email.json

---

## 🔐 STEP 3: Create ONE Credential (3 min)

You only need ONE credential for all workflows!

### Option A: From Credentials Menu

1. Click **"Credentials"** in left sidebar (🔒 lock icon)
2. Click **"Add credential"**
3. Search: **"Header Auth"**
4. Click it
5. Fill in:
   ```
   Credential name: n8n-backend-auth
   Name: x-n8n-secret
   Value: 308a361239771d72622f920985a66c5d3e1887f9d7462a6d320e89f048478d78
   ```
6. Click **"Save"**

### Option B: Create While Editing Workflow

1. Open **Workflow 1**
2. Click the **2nd node** (HTTP Request - orange box)
3. Right panel → Find **"Authentication"**
4. Dropdown → Select **"Header Auth"**
5. Click **"Create New Credential"** button
6. Fill in same values as above
7. Save credential

---

## 🔗 STEP 4: Get Webhook URLs (2 min)

You need 2 webhook URLs to share with your team:

### Webhook URL #1 (Syllabus):

1. Go to **Workflows** → Open **"Workflow 3"** (Syllabus Upload Notification)
2. Click the **first node** (purple Webhook node)
3. Right panel → Look for **"Webhook URLs"**
4. Copy the **"Production URL"**
   - Example: `https://yourname.app.n8n.cloud/webhook/syllabus-uploaded`

### Webhook URL #2 (New User):

1. Go to **Workflows** → Open **"Workflow 5"** (Welcome Email)
2. Click the **first node** (purple Webhook node)
3. Copy the **"Production URL"**
   - Example: `https://yourname.app.n8n.cloud/webhook/new-user`

**SAVE THESE 2 URLs!** You'll share them in the next step.

---

## 📤 STEP 5: Share with Your Team (3 min)

Create a message and send to your team RIGHT NOW:

```
🚀 n8n IS READY! Here's what you need:

═══════════════════════════════════════════════════════

🔐 FOR LAPTOP 2 (BACKEND) - ADD TO YOUR .env FILE:

N8N_WEBHOOK_SECRET=308a361239771d72622f920985a66c5d3e1887f9d7462a6d320e89f048478d78

═══════════════════════════════════════════════════════

📡 WEBHOOK URLs (Backend needs to call these):

1️⃣ After syllabus upload:
[PASTE YOUR WEBHOOK URL #1 HERE]

2️⃣ For new users (optional):
[PASTE YOUR WEBHOOK URL #2 HERE]

Example call:
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "x-n8n-secret: 308a361239771d72622f920985a66c5d3e1887f9d7462a6d320e89f048478d78" \
  -d '{"subject":"Test","filename":"test.pdf","professor_name":"Dr. Test"}'

═══════════════════════════════════════════════════════

🎯 BACKEND APIs YOU NEED TO BUILD:

All must accept header: x-n8n-secret: [secret above]

GET  /api/v1/doubts/recent?limit=1000
POST /api/v1/webhooks/n8n/generate-report?user_id=xxx
POST /api/v1/webhooks/n8n/get-escalated
GET  /api/v1/doubts/heatmap

Full specs: n8n/docs/api-integration.md

═══════════════════════════════════════════════════════

📱 FOR LAPTOP 1 (FRONTEND):

Create these pages:
- /student/reports
- /professor/dashboard
- /professor/escalations

Clerk webhook URL (for new users):
[PASTE YOUR WEBHOOK URL #2 HERE]

═══════════════════════════════════════════════════════

✅ n8n workflows are imported and ready to test when backend is deployed!
```

**IMPORTANT:** Replace `[PASTE YOUR WEBHOOK URL #X HERE]` with actual URLs from Step 4!

---

## ⚠️ IMPORTANT: Don't Activate Workflows Yet!

**DO NOT** toggle the "Active" switch yet on any workflow!

**Why?**
- Backend isn't deployed yet
- Workflows will fail and spam you with errors
- Wait until backend is live on Render

---

## ✅ YOU'RE DONE WITH SETUP!

**What you've accomplished:**
- ✅ Imported 5 workflows to n8n Cloud
- ✅ Created authentication credential
- ✅ Got webhook URLs
- ✅ Shared info with team

**What happens next:**
1. **Wait** for Laptop 2 to deploy backend to Render
2. **Get** the production URL from them (e.g., `https://doubtmap-api.onrender.com`)
3. **Update** your workflows with production URL (I'll show you how)
4. **Test** workflows (all nodes should turn green ✅)
5. **Activate** Workflow 1 & 2 for demo

---

## 🔄 WHEN BACKEND IS DEPLOYED (Do This Later)

### Quick Update Steps:

**For each workflow with HTTP Request nodes (Workflows 1, 2, 4):**

1. Open the workflow
2. Click each **orange HTTP Request node**
3. Find the **URL field**
4. Change `http://localhost:8000` to `https://doubtmap-api.onrender.com`
5. Save

**Then test:**
1. Click **"Test workflow"** or **"Execute workflow"**
2. All nodes should be ✅ GREEN
3. If green → Toggle **"Active"** switch ON

---

## 🆘 QUICK TROUBLESHOOTING

**"Can't find Import option"**
→ Create new workflow → Look for ⋯ menu at top-right → Import

**"Workflows imported but nodes look broken"**
→ Ignore for now - they'll fail until backend is ready (normal!)

**"Can't see webhook URLs"**
→ Make sure you SAVED the workflow first
→ Click the purple Webhook node
→ Look in right panel for "Webhook URLs" section

**"Credential creation confusing"**
→ Just make sure these 3 things:
  - Name field: `x-n8n-secret`
  - Value field: `308a361239771d72622f920985a66c5d3e1887f9d7462a6d320e89f048478d78`
  - Save it!

---

## 📋 QUICK CHECKLIST

```
DONE NOW:
☐ Logged into n8n Cloud
☐ Imported all 5 workflows
☐ Created n8n-backend-auth credential
☐ Got 2 webhook URLs
☐ Sent message to team with URLs and secret

DO LATER (when backend deployed):
☐ Update HTTP Request URLs to production
☐ Test workflows (should be all green)
☐ Activate Workflow 1 & 2
☐ Take screenshots for demo backup

NOT DOING:
☐ Don't activate workflows yet!
☐ Don't worry about failed tests (no backend yet)
☐ Don't overcomplicate - you're done for now!
```

---

## 🎬 YOU'RE READY!

Your n8n setup is complete! Now:
1. **Let your team know** (send that message above)
2. **Move on to other tasks** while backend team works
3. **Come back when backend is deployed** to update URLs and activate

**Time saved: Hours of confusion! ⚡**

---

**Questions? Check:** `n8n/docs/beginner-setup-guide.md`

**Ready to update when backend is deployed? Read:** Section "WHEN BACKEND IS DEPLOYED" above
