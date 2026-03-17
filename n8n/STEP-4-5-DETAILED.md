# 📍 DETAILED STEP-BY-STEP: Getting Webhook URLs

## STEP 4A: Open Workflow 3

1. In n8n Cloud, click **"Workflows"** in left sidebar
2. Find **"Syllabus Upload Notification"** (or workflow3)
3. Click to open it
4. You'll see a canvas with connected nodes

---

## STEP 4B: Click the Webhook Node

```
Your canvas looks like this:

[Webhook] → [Code] → [Send Email] → [Respond to Webhook]
   ↑
 Click this!
```

1. Click the **first purple/blue node** labeled "Webhook"
2. A panel opens on the RIGHT side of screen

---

## STEP 4C: Find the Production URL

In the right panel, scroll down and look for:

```
╔═══════════════════════════════════════════════╗
║ WEBHOOK TRIGGER SETTINGS                      ║
╠═══════════════════════════════════════════════╣
║                                               ║
║ HTTP Method: POST                             ║
║ Path: syllabus-uploaded                       ║
║                                               ║
║ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ║
║                                               ║
║ 🔗 WEBHOOK URLs:                              ║
║                                               ║
║ Test URL (only when workflow is open):       ║
║ [📋 Copy] https://abc.app.n8n.cloud/webhook- ║
║           test/xyz/syllabus-uploaded          ║
║                                               ║
║ Production URL (always available):            ║
║ [📋 Copy] https://abc.app.n8n.cloud/webhook/ ║
║           syllabus-uploaded                   ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

---

## STEP 4D: Copy the Production URL

1. Find the **"Production URL"** line (second URL)
2. Click the **📋 Copy button** next to it
3. **PASTE IT SOMEWHERE SAFE** (notepad, text file, etc.)

**This is Webhook URL #1!**

---

## STEP 4E: Repeat for Workflow 5

1. Go back to **Workflows** list
2. Open **"Welcome Email on Sign-up"** (or workflow5)
3. Click the **Webhook node** (first node)
4. Copy the **Production URL**
5. Paste it somewhere safe

**This is Webhook URL #2!**

---

## ⚠️ TROUBLESHOOTING

### Problem: "I only see Test URL, no Production URL"

**Solution:**
1. Make sure workflow is **SAVED** (cloud/disk icon, top-right)
2. Click **"Save"** if you haven't
3. Click webhook node again
4. Production URL should now appear!

**Still not showing?**
- The workflow needs to be saved at least once
- Look for a message like "Workflow needs to be saved first"
- After saving, the Production URL becomes available

---

### Problem: "I see weird characters or parameters in the URL"

**What you might see:**
```
https://abc.app.n8n.cloud/webhook/syllabus-uploaded?param1=value
```

**What you need (clean URL without parameters):**
```
https://abc.app.n8n.cloud/webhook/syllabus-uploaded
```

**Solution:**
- Just copy the base URL (everything before the `?`)
- Ignore any parameters shown in examples

---

### Problem: "The Copy button doesn't work"

**Solution:**
- Manually highlight the URL text
- Right-click → Copy
- Or use Ctrl+C (Windows/Linux) / Cmd+C (Mac)

---

## ✅ YOU'RE DONE WITH STEP 4 WHEN:

You have two URLs saved:
- ✅ Webhook URL #1: `https://[your-instance].app.n8n.cloud/webhook/syllabus-uploaded`
- ✅ Webhook URL #2: `https://[your-instance].app.n8n.cloud/webhook/new-user`

---

# 📤 STEP 5: Share with Team (DETAILED)

Now you need to share information with your team members.

---

## STEP 5A: What Information to Share

You need to share:
1. **Webhook Secret** (for backend authentication)
2. **Webhook URLs** (2 URLs you just copied)
3. **Backend API Requirements** (what endpoints backend needs to build)

---

## STEP 5B: Create Team Message

Open a text editor and create this message:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 N8N SETUP COMPLETE - INFO FOR TEAM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔐 FOR LAPTOP 2 (BACKEND TEAM):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ADD THIS TO YOUR BACKEND .env FILE:

N8N_WEBHOOK_SECRET=YOUR_GENERATED_N8N_WEBHOOK_SECRET

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. N8N WEBHOOK URLs (Backend needs to CALL these):

Webhook #1 - Syllabus Upload (call this after syllabus upload succeeds):
[PASTE YOUR WEBHOOK URL #1 HERE]

Webhook #2 - New User (Clerk will call this, or backend can):
[PASTE YOUR WEBHOOK URL #2 HERE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. HOW TO CALL WEBHOOK #1 (Example Python code):

import requests
import os

def notify_syllabus_uploaded(subject, filename, prof_name):
    url = "YOUR_WEBHOOK_URL_1_HERE"
    headers = {
        "Content-Type": "application/json",
        "x-n8n-secret": os.getenv("N8N_WEBHOOK_SECRET")
    }
    payload = {
        "subject": subject,
        "filename": filename,
        "professor_name": prof_name
    }

    response = requests.post(url, json=payload, headers=headers)
    return response.json()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. BACKEND APIs YOU NEED TO BUILD (n8n will call these):

All these endpoints must accept this header:
x-n8n-secret: YOUR_GENERATED_N8N_WEBHOOK_SECRET

Required Endpoints:
✅ GET  /api/v1/doubts/recent?limit=1000
   Returns: { "doubts": [...] }

✅ POST /api/v1/webhooks/n8n/generate-report?user_id=xxx
   Returns: { "status": "success", "report_id": "..." }

✅ POST /api/v1/webhooks/n8n/get-escalated
   Returns: { "escalated_count": 3, "doubts": [...] }

✅ GET  /api/v1/doubts/heatmap
   Returns: { "topics": [...] }

Full specs in: n8n/docs/api-integration.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 FOR LAPTOP 1 (FRONTEND TEAM):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CREATE THESE PAGES:

✅ /student/reports - Display weekly AI reports
✅ /professor/dashboard - Show doubt heatmap
✅ /professor/escalations - Show low-confidence doubts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. CLERK WEBHOOK SETUP (Optional):

If you want automatic welcome emails on sign-up:

Go to Clerk Dashboard → Webhooks → Add endpoint
URL: [PASTE YOUR WEBHOOK URL #2 HERE]
Events: user.created

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ N8N workflows are ready to test when backend is deployed!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## STEP 5C: Fill in Your Webhook URLs

1. Find where it says `[PASTE YOUR WEBHOOK URL #1 HERE]`
2. Replace with your actual Webhook URL #1 from Step 4
3. Find where it says `[PASTE YOUR WEBHOOK URL #2 HERE]`
4. Replace with your actual Webhook URL #2 from Step 4
5. **Save this message!**

---

## STEP 5D: Send to Team

**Option 1: Team Chat (WhatsApp/Slack/Discord)**
- Copy your filled message
- Paste in team chat
- Pin it so everyone can find it

**Option 2: Shared Document (Google Docs/Notion)**
- Create a new document titled "n8n Integration Info"
- Paste your message
- Share link with team

**Option 3: Email**
- Send to both teammates
- Subject: "n8n Setup Complete - Action Required"

**⚠️ IMPORTANT: Keep the secret secure!**
- Don't post publicly
- Don't commit to GitHub
- Only share with your 2 teammates

---

## STEP 5E: What Happens Next

### Laptop 2 (Backend) will:
1. Add `N8N_WEBHOOK_SECRET` to their `.env` file
2. Build the 4 required API endpoints
3. Add code to call your Webhook #1 after syllabus upload
4. When backend is deployed to Render, give you the production URL

### Laptop 1 (Frontend) will:
1. Create the 3 required pages
2. Configure Clerk webhook (optional)
3. When deployed to Vercel, give you the production URL

### You will:
1. Wait for backend deployment
2. Update workflow URLs from localhost to production
3. Test all workflows
4. Activate Workflow 1 & 2
5. Prepare demo!

---

## ✅ YOU'RE DONE WITH STEP 5 WHEN:

- ✅ Message created with both webhook URLs filled in
- ✅ Secret included (308a361239771d72622f920985a66c5d3e...)
- ✅ Message sent to both teammates (Laptop 1 & 2)
- ✅ Teammates confirmed they received it

---

## 🎯 QUICK TEST

To verify your webhook URLs work, you can test Webhook #1 now:

```bash
# Replace YOUR_WEBHOOK_URL_1 with your actual URL
curl -X POST "YOUR_WEBHOOK_URL_1" \
  -H "Content-Type: application/json" \
  -H "x-n8n-secret: YOUR_GENERATED_N8N_WEBHOOK_SECRET" \
  -d '{
    "subject": "Test Subject",
    "filename": "test.pdf",
    "professor_name": "Dr. Test"
  }'
```

**Expected result:**
```json
{"status": "success"}
```

If you get this, your webhook is working! ✅

---

## 📋 SUMMARY

**Step 4:** Get 2 webhook URLs from workflows 3 & 5
**Step 5:** Share those URLs + secret + requirements with team

**You've completed both steps when:**
- ✅ You have 2 webhook URLs saved
- ✅ Team received your message with all info
- ✅ Backend knows what APIs to build
- ✅ Frontend knows what pages to create

---

Any questions about specific parts? Let me know! 🚀
