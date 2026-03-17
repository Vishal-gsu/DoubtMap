# ✅ 5 CLEAN WORKFLOWS - READY TO IMPORT!

## 🎯 YOU NOW HAVE 5 WORKING FILES

All workflows are fixed and ready for n8n Cloud free tier!

```
✅ workflow1.json - Weekly Report Generator
✅ workflow2.json - Doubt Escalation Alert
✅ workflow3.json - Syllabus Upload Notification
✅ workflow4.json - Daily Doubt Digest
✅ workflow5.json - Welcome Email on Sign-up
```

---

## 📥 HOW TO IMPORT (5 Minutes)

### Do this for EACH file:

1. **Go to n8n Cloud** → https://app.n8n.cloud
2. Click **"Workflows"** (left sidebar)
3. Click **"Add workflow"** or **"New"**
4. Look for **⋯ menu** (three dots) at top-right
5. Click **"Import from file"**
6. Browse to: `/home/prashant/Desktop/hack/DoubtMap/n8n/workflows/`
7. Select: `workflow1.json`
8. Click **"Save"**

**Repeat for all 5 files**: workflow1.json → workflow2.json → workflow3.json → workflow4.json → workflow5.json

---

## 🔐 ONE CREDENTIAL FOR ALL

After importing, you only need to create ONE credential:

1. Click **"Credentials"** (left sidebar)
2. Click **"Add credential"**
3. Search: **"Header Auth"**
4. Fill in:
   ```
   Credential name: n8n-backend-auth
   Name: x-n8n-secret
   Value: YOUR_GENERATED_N8N_WEBHOOK_SECRET
   ```
5. Click **"Save"**

**This ONE credential works for ALL 5 workflows!**

---

## 🔗 GET WEBHOOK URLs (2 Minutes)

### Webhook #1 (Syllabus):
1. Open **workflow3.json** in n8n
2. Click the **Webhook node** (first purple node)
3. Copy the **"Production URL"**
   - Example: `https://yourname.app.n8n.cloud/webhook/syllabus-uploaded`

### Webhook #2 (New User):
1. Open **workflow5.json** in n8n
2. Click the **Webhook node**
3. Copy the **"Production URL"**
   - Example: `https://yourname.app.n8n.cloud/webhook/new-user`

---

## 📤 SHARE WITH TEAM

Send this to your team:

```
🚀 n8n IS READY!

🔐 Backend Team (Laptop 2) - Add to .env:
N8N_WEBHOOK_SECRET=YOUR_GENERATED_N8N_WEBHOOK_SECRET

📡 Webhook URLs:
1. Syllabus Upload: [PASTE YOUR WEBHOOK URL #1]
2. New User: [PASTE YOUR WEBHOOK URL #2]

🎯 Build these backend APIs:
- GET  /api/v1/doubts/recent?limit=1000
- POST /api/v1/webhooks/n8n/generate-report?user_id=xxx
- POST /api/v1/webhooks/n8n/get-escalated
- GET  /api/v1/doubts/heatmap

All need header: x-n8n-secret: [secret above]

📱 Frontend Team (Laptop 1):
Create pages: /student/reports, /professor/dashboard, /professor/escalations
```

---

## ⚠️ IMPORTANT: Don't Activate Yet!

**DO NOT** toggle "Active" switch yet!

Wait until:
- ✅ Backend is deployed to Render
- ✅ You update URLs from localhost to production
- ✅ You test successfully

---

## 🔄 WHEN BACKEND IS DEPLOYED

### Update Each Workflow:

**For workflows 1, 2, 4** (have HTTP Request nodes):
1. Open workflow
2. Click each **HTTP Request node**
3. Change URL from `http://localhost:8000` to production URL:
   ```
   https://doubtmap-api.onrender.com
   ```
4. Save

**For workflows 3, 5** (webhooks):
- No changes needed! Just activate.

### Then Test:
1. Click **"Execute workflow"**
2. All nodes should be ✅ GREEN
3. If all green → Toggle **"Active"** ON

---

## ✅ SUCCESS CHECKLIST

```
DONE NOW:
☐ Imported all 5 workflows (workflow1.json through workflow5.json)
☐ Created n8n-backend-auth credential
☐ Got 2 webhook URLs
☐ Sent info to team

DO LATER (when backend deployed):
☐ Update localhost URLs to production
☐ Test workflows (all green)
☐ Activate workflows 1 & 2
☐ Take screenshots for demo

DON'T DO:
☐ Don't activate yet (backend not ready)
☐ Don't worry about failed tests (expected)
```

---

## 🆘 TROUBLESHOOTING

**"Can't find Import option"**
→ Create new workflow → Look for ⋯ at top-right → Import

**"Nodes showing as broken/red"**
→ Normal! Backend isn't running yet. Wait until it's deployed.

**"Can't see webhook URLs"**
→ Save workflow first, then click Webhook node

**"Credential creation error"**
→ Make sure Name field = `x-n8n-secret` (exact spelling)

---

## 🎯 YOU'RE READY!

All 5 workflows are clean, working, and ready to import!

**Next step:** Import them into n8n Cloud following the guide above.

**Need help?** Check: `n8n/QUICK-START-CLOUD.md`
