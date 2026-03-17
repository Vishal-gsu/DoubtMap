# 🎯 COMPLETE n8n CLOUD SETUP GUIDE (2024/2026 Updated)
## For Beginners - DoubtMap Hackathon Project

This guide assumes you're using n8n Cloud free tier and are NEW to n8n.

---

## 📋 WHAT YOU'LL ACCOMPLISH

By the end of this guide:
- ✅ Import all 5 workflows into n8n Cloud
- ✅ Configure basic authentication
- ✅ Get webhook URLs to share with your team
- ✅ Test that workflows are structured correctly
- ✅ Be ready to activate when backend is deployed

**Time needed:** 30-45 minutes

---

## STEP 1: Understanding n8n Cloud Interface (5 min)

### What You See After Login:

**Left Sidebar (Icons):**
```
╔════════════════╗
║  [☰] Menu      ║  ← Click this if you see it
║  [○] Projects  ║
║  [⚡] Workflows ║  ← This is where we'll work!
║  [▶] Executions║
║  [⚙] Settings  ║  ← We'll use this too
╚════════════════╝
```

**OR you might see text labels:**
- Projects
- Workflows  ← **Start here!**
- Executions
- Credentials
- Settings

---

## STEP 2: Import Your First Workflow (10 min)

### Method A: Import from File (Recommended)

1. **Click "Workflows"** in left sidebar
2. You'll see a button that says:
   - **"+ Create new workflow"** OR
   - **"+ Add workflow"** OR
   - **"New"** (top-right corner)

3. **Click the dropdown arrow** next to that button (if there is one)
4. Look for **"Import"** or **"Import from file"**

**If you DON'T see Import option:**
- Click "New" to create a blank workflow
- Look at the **top-right corner** for three dots (⋯) or hamburger menu (≡)
- Click it → Select "Import from file"

5. **Browse and select:**
   ```
   /home/prashant/Desktop/hack/DoubtMap/n8n/workflows/workflow1-weekly-report.json
   ```

6. **Click "Save"** (looks like a cloud icon or disk icon, top-right)

**What you should see:**
- A canvas with 5 connected boxes/nodes
- Lines connecting them left to right
- Purple/blue, orange, and gray colored nodes

---

### Method B: Copy-Paste JSON (If Import Doesn't Work)

**If you can't find Import, try this:**

1. **On your computer, open the file:**
   ```bash
   cat /home/prashant/Desktop/hack/DoubtMap/n8n/workflows/workflow1-weekly-report.json
   ```

2. **Copy EVERYTHING** (Ctrl+A, Ctrl+C)

3. **In n8n Cloud:**
   - Create a new blank workflow
   - Look for **"</>"** icon or **"Code"** button (usually top-right)
   - Click it
   - It will show JSON view
   - **Delete everything** in that view
   - **Paste your copied JSON** (Ctrl+V)
   - Click **"Apply"** or **"Update"** or switch back to visual view
   - Click **"Save"**

---

## STEP 3: Configure Workflow Settings (5 min)

After importing Workflow 1, you need to fix the URLs and credentials:

### A) Update HTTP Request Nodes

1. **Click on the 2nd node** (orange box labeled "HTTP Request" or "HTTP - Get Recent Doubts")
2. On the **right panel**, you'll see settings
3. Find **"URL"** field - it currently has: `={{$env.BACKEND_URL}}/api/v1/doubts/recent?limit=1000`

**For now, change it to:**
```
http://localhost:8000/api/v1/doubts/recent?limit=1000
```
(We'll update this when backend is deployed)

4. Scroll down to **"Authentication"**
5. Click the dropdown, select **"Header Auth"**
6. You'll see **"Header Auth"** field appear below
7. Click it → **"Create New Credential"**

**In the credential form:**
```
Credential Name: n8n-backend-auth
Name: x-n8n-secret
Value: 308a361239771d72622f920985a66c5d3e1887f9d7462a6d320e89f048478d78
```

8. Click **"Save"** (on the credential popup)
9. The credential is now selected in your node!

### B) Update the 4th HTTP Request Node

1. **Click on the 4th node** (another orange "HTTP Request")
2. Change URL to:
   ```
   http://localhost:8000/api/v1/webhooks/n8n/generate-report
   ```
3. For Authentication, **select the same credential** (n8n-backend-auth) from dropdown

### C) Update Email Node (Optional - Skip for Now)

The 5th node (Email Send) can stay as-is for now. We'll test it later.

4. **Click "Save"** (top-right, save the whole workflow)

---

## STEP 4: Name Your Workflow (2 min)

1. At the **top of the canvas**, you'll see "My workflow" or similar
2. **Click on it** to rename
3. Type: **"Weekly Report Generator"**
4. Press Enter
5. **Save again**

---

## STEP 5: Import Remaining 4 Workflows (15 min)

**Repeat STEP 2 for each of these files:**

```
✅ workflow1-weekly-report.json (DONE!)
⬜ workflow2-escalation-alert.json
⬜ workflow3-syllabus-notification.json
⬜ workflow4-daily-digest.json
⬜ workflow5-welcome-email.json
```

### Quick Tips for Each:

**Workflow 2 (Escalation Alert):**
- Has HTTP Request nodes → Update URLs to `http://localhost:8000/...`
- Use same `n8n-backend-auth` credential

**Workflow 3 (Syllabus Notification):**
- Starts with **Webhook node** (purple)
- Click the Webhook node → You'll see "Production URL" - **COPY THIS!**
- Update Code node if needed (should work as-is)

**Workflow 4 (Daily Digest):**
- Similar to Workflow 1
- Update HTTP Request URL
- Use same credential

**Workflow 5 (Welcome Email):**
- Starts with Webhook node
- Get the webhook URL from it
- Has multiple branches (IF node) - this is normal!

**Name each workflow properly after importing!**

---

## STEP 6: Get Your Webhook URLs (5 min)

### For Workflow 3 (Syllabus Upload):

1. Open Workflow 3
2. Click on the **first node** (Webhook Trigger)
3. Look at the right panel
4. Find **"Webhook URLs"** section
5. Copy the **"Production URL"**
   - Should look like: `https://yourname.app.n8n.cloud/webhook/syllabus-uploaded`

### For Workflow 5 (Welcome Email):

1. Open Workflow 5
2. Click on the Webhook node
3. Copy the Production URL
   - Should look like: `https://yourname.app.n8n.cloud/webhook/new-user`

**SAVE THESE URLS!** Your backend team needs them.

---

## STEP 7: Test a Workflow (5 min)

Let's make sure everything is structured correctly:

1. **Open Workflow 1** (Weekly Report Generator)
2. Look for a button at the top that says:
   - **"Test workflow"** OR
   - **"Execute workflow"** OR
   - A **play icon (▶)**

3. **Click it**

**What will happen:**
- The workflow will try to execute
- Node 1 (Schedule) will be ✅ green (success)
- Node 2 (HTTP Request) will be ❌ red (failed)

**This is EXPECTED!** Your backend isn't running yet.

**What you're checking:**
- ✅ Workflow structure is valid
- ✅ Credentials are recognized (not showing "missing credential" error)
- ✅ Nodes are connected properly

4. Look at the **right panel** - you'll see execution details
5. Click on the red node to see the error
6. Error should say "connection refused" or "ECONNREFUSED" - **this is normal!**

---

## STEP 8: Don't Activate Yet! (IMPORTANT)

**Do NOT click "Active" switch yet!**

Why? Because:
- Your backend isn't deployed yet
- Workflows will keep trying and failing
- You'll get error emails

**Wait until:**
- ✅ Backend is deployed to Render
- ✅ You've updated all URLs to production
- ✅ You've tested successfully

---

## STEP 9: Share with Your Team (DO THIS NOW)

Update the team sharing file with your actual webhook URLs:

```bash
# Open the file
nano /home/prashant/Desktop/hack/DoubtMap/n8n-team-share.txt

# Or just read it
cat /home/prashant/Desktop/hack/DoubtMap/n8n-team-share.txt
```

**Replace "YOUR-INSTANCE" with your actual n8n Cloud URL!**

Then share this info with:
- **Laptop 2 (Backend):** Secret, backend APIs needed, webhook URLs
- **Laptop 1 (Frontend):** Clerk webhook URL, page requirements

---

## STEP 10: What Happens Next

### When Backend is Deployed:

1. **Get the production URL** from Laptop 2 (e.g., `https://doubtmap-api.onrender.com`)

2. **Update ALL your workflows:**
   - Open each workflow
   - Find HTTP Request nodes
   - Change `http://localhost:8000` to production URL
   - Save each workflow

3. **Test again:**
   - Execute Workflow 1
   - This time, ALL nodes should be ✅ green
   - You'll see actual data in the execution log!

4. **Activate Workflow 1 & 2:**
   - Toggle "Active" switch to ON
   - They will now run automatically on schedule

---

## 🆘 TROUBLESHOOTING

### "I can't find the Import button"
→ Create a new workflow, then look for three dots (⋯) menu at top
→ Or use Method B (copy-paste JSON)

### "Credential Name field is grayed out"
→ That's the actual name field - just type in it
→ If truly disabled, close and create new credential from Credentials sidebar

### "Execution failed at HTTP Request"
→ Perfect! That means workflow structure is correct
→ Backend just isn't running yet - expected behavior

### "Webhook URL doesn't show"
→ Make sure you've saved the workflow first
→ Webhook nodes only get URLs after first save

### "Can't find Authentication dropdown"
→ Look for "Authentication" section in the HTTP Request node settings
→ Scroll down in the right panel - it might be below the URL field

---

## ✅ CHECKLIST - You're Done When:

```
BASIC SETUP:
☐ All 5 workflows imported
☐ All workflows named properly
☐ Credential created (n8n-backend-auth)
☐ Webhook URLs copied (from Workflows 3 & 5)
☐ Team sharing file updated with real URLs
☐ Info shared with Laptop 2 and Laptop 1

TESTING (with localhost - will fail, that's OK):
☐ Tested Workflow 1 execution (Node 2 fails = expected)
☐ Verified no "missing credential" errors
☐ Execution log shows structure is valid

NOT DONE YET (Wait for backend):
☐ Updating URLs to production (when backend deployed)
☐ Successful test with all green nodes
☐ Activating workflows
```

---

## 📱 NEXT STEPS

1. **Share info with your team** (use n8n-team-share.txt)
2. **Wait for backend deployment**
3. **Come back and update URLs** to production
4. **Test everything** again
5. **Activate workflows**
6. **Prepare for demo!**

---

## 🎓 Learning Resources While You Wait

**Want to understand n8n better?**
- n8n Academy: https://academy.n8n.io (free courses)
- Quick Start: https://docs.n8n.io/hosting/installation/docker/#starting-n8n
- Community: https://community.n8n.io

**Understand your workflows:**
- Read: `n8n/docs/workflow-descriptions.md`
- Learn what each workflow does
- Understand the demo value

---

**You're doing great! Any questions, just ask!** 🚀
