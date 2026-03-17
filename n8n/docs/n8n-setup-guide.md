# n8n Setup Guide for DoubtMap

## Overview
This guide walks through the complete n8n Cloud setup for the DoubtMap project. n8n orchestrates all automated workflows including weekly reports, escalation alerts, and notifications.

---

## Prerequisites

- n8n Cloud account (free tier - supports 5 workflows)
- Backend API running (locally or on Render)
- Frontend deployed (locally or on Vercel)
- API keys from team members

---

## Step 1: Create n8n Cloud Account

1. Go to https://n8n.io
2. Click "Start Free" and sign up
3. You'll get a URL like: `https://your-instance.app.n8n.cloud`
4. **Save this URL** - you'll need to share it with the backend team

---

## Step 2: Generate API Key (Optional - for programmatic access)

1. In n8n Cloud dashboard, click your profile (top-right)
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it: `DoubtMap Backend Access`
5. **Save the key securely** (shown only once)

---

## Step 3: Set Up Credentials

n8n needs credentials to authenticate with external services. Set up the following:

### 3.1 Backend Authentication (Critical)

This allows n8n to securely call your backend webhooks.

1. Go to **Credentials** (left sidebar)
2. Click **+ Add Credential**
3. Search for **Header Auth**
4. Configure:
   - **Credential Name**: `n8n-backend-auth`
   - **Header Name**: `x-n8n-secret`
   - **Header Value**: Generate a random secret (or ask Laptop 2 for `N8N_WEBHOOK_SECRET`)

   Example secret generation:
   ```bash
   openssl rand -hex 32
   # Example output: EXAMPLE_N8N_WEBHOOK_SECRET_HEX
   ```

5. **Critical**: Share this `x-n8n-secret` value with Laptop 2!
   - They need to add it as `N8N_WEBHOOK_SECRET` in backend `.env`

### 3.2 Groq API (Optional - for direct LLM nodes)

Only needed if you want to call Groq directly from n8n (rare case).

1. **+ Add Credential** → Search **HTTP Header Auth** (or Groq if available)
2. Configure:
   - **Credential Name**: `groq-api`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer gsk_xxxxxxxxxxxxx` (get from Laptop 2)

### 3.3 Email Service (for sending emails)

**Option A: Built-in Email Node (recommended for hackathon)**
- No credential needed
- Uses n8n's built-in SMTP
- Limited to a few emails/day

**Option B: Resend (recommended for production)**
1. Sign up at https://resend.com (free tier = 100 emails/day)
2. Generate API key
3. In n8n → **+ Add Credential** → Search **HTTP Header Auth**
4. Configure:
   - **Credential Name**: `resend-api`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer re_xxxxxxxxxxxxx`

---

## Step 4: Set Environment Variables

n8n Cloud allows you to set global environment variables used across all workflows.

1. Go to **Settings** → **Variables**
2. Click **+ Add Variable**
3. Add the following:

| Variable Name | Development Value | Production Value |
|---------------|-------------------|------------------|
| `BACKEND_URL` | `http://localhost:8000` | `https://doubtmap-api.onrender.com` |
| `FRONTEND_URL` | `http://localhost:3000` | `https://doubtmap.vercel.app` |
| `N8N_SECRET` | Same as `x-n8n-secret` credential | Same as `x-n8n-secret` credential |

**Important**: When deploying to production, update these to point to live URLs!

---

## Step 5: Import Workflows

Once you've exported workflows from n8n as JSON files (stored in `n8n/workflows/`), you can import them:

1. Go to **Workflows** (left sidebar)
2. Click **Import workflow**
3. Upload the JSON file (e.g., `workflow1-weekly-report.json`)
4. The workflow will open in the editor
5. Click **Save** in the top-right

Repeat for all 5 workflows:
- `workflow1-weekly-report.json`
- `workflow2-escalation-alert.json`
- `workflow3-syllabus-notification.json`
- `workflow4-daily-digest.json`
- `workflow5-welcome-email.json`

---

## Step 6: Activate Workflows

For workflows to run automatically (cron-based):

1. Open the workflow in the editor
2. Toggle the **Active** switch in the top-right (should turn green)
3. The workflow will now run on schedule

For webhook-based workflows:
- They're always listening once activated
- Copy the webhook URL (shown in the Webhook node)
- Share with Laptop 2 so they can call it from the backend

---

## Step 7: Test Workflows

### Manual Testing

1. Open a workflow
2. Click **Execute Workflow** (top-right)
3. Check the execution log on the right panel
4. Verify:
   - All nodes turn green (success)
   - API responses are correct
   - Emails are sent (check inbox)

### Testing Webhook URLs

Use `curl` to test webhook endpoints:

```bash
# Test Workflow 3: Syllabus Upload Notification
curl -X POST https://your-instance.app.n8n.cloud/webhook/syllabus-uploaded \
  -H "Content-Type: application/json" \
  -H "x-n8n-secret: YOUR_SECRET_HERE" \
  -d '{
    "subject": "Data Structures",
    "filename": "ds_syllabus.pdf",
    "professor_name": "Dr. Smith"
  }'
```

### Testing Backend Integration

```bash
# Test if backend can call n8n webhook
curl -X POST http://localhost:8000/api/v1/webhooks/n8n/generate-report \
  -H "Content-Type: application/json" \
  -H "x-n8n-secret: YOUR_SECRET_HERE" \
  -d '{"user_id": "user_abc123"}'
```

---

## Step 8: Coordinate with Team

### Share with Laptop 2 (Backend)

1. **n8n webhook URLs** for:
   - Syllabus Upload: `https://your-instance.app.n8n.cloud/webhook/syllabus-uploaded`
   - New User: `https://your-instance.app.n8n.cloud/webhook/new-user`

2. **Webhook secret**: The `x-n8n-secret` value

3. **Backend webhook URLs** n8n needs:
   - `GET /api/v1/doubts/recent?limit=1000`
   - `POST /api/v1/webhooks/n8n/generate-report?user_id=xxx`
   - `POST /api/v1/webhooks/n8n/get-escalated`
   - `GET /api/v1/doubts/heatmap`

### Share with Laptop 1 (Frontend)

1. **Email templates** - they need to know what emails students will receive
2. **Report page URL**: `https://doubtmap.vercel.app/student/reports`

---

## Step 9: Monitor Executions

1. Go to **Executions** (left sidebar)
2. See all workflow runs with:
   - Timestamp
   - Status (success/error)
   - Duration
3. Click on any execution to see detailed logs
4. Debug errors by checking node-by-node output

---

## Step 10: Export Workflows (for Git)

Before demo day or when making changes:

1. Open each workflow
2. Click the **•••** menu (top-right)
3. Select **Download**
4. Save as `n8n/workflows/workflow{N}-{name}.json`
5. Commit to Git:
   ```bash
   git add n8n/workflows/*.json
   git commit -m "Update n8n workflows"
   git push
   ```

---

## Common Issues & Solutions

### Issue: Backend API returns 401 Unauthorized
**Solution**: Check that `x-n8n-secret` header matches `N8N_WEBHOOK_SECRET` in backend `.env`

### Issue: Email not sending
**Solution**:
- Check Resend API key is valid
- Verify email address is verified in Resend dashboard
- Use n8n built-in email as fallback

### Issue: Workflow doesn't trigger on schedule
**Solution**:
- Ensure workflow is **Activated** (green toggle)
- Check cron expression is correct
- Wait for next trigger time (or execute manually for testing)

### Issue: n8n can't reach backend at localhost
**Solution**:
- n8n Cloud can't access `http://localhost:8000`
- Deploy backend to Render first
- Update `BACKEND_URL` environment variable to Render URL

### Issue: Webhook returns 404
**Solution**:
- Workflow might not be activated
- Check webhook path is correct (case-sensitive)
- Ensure workflow has a Webhook Trigger node

---

## Production Deployment Checklist

Before demo day:

- [ ] All 5 workflows imported and activated
- [ ] Environment variables point to production URLs (not localhost)
- [ ] Backend webhook secret matches n8n credential
- [ ] Email service configured and tested
- [ ] Webhook URLs shared with backend team
- [ ] All workflows tested manually (Execute Workflow)
- [ ] Cron triggers tested (wait for actual execution or adjust time for quick test)
- [ ] Execution logs show no errors
- [ ] Workflows exported to Git

---

## Emergency Fallbacks

**If n8n Cloud is down during demo:**
- Show workflow screenshots instead
- Explain what each workflow would do
- Trigger backend webhooks manually via curl

**If email fails:**
- Skip email step
- Show that report was generated in database
- Focus on workflow logic, not delivery

**If backend integration fails:**
- Use static test data in Code nodes
- Demonstrate workflow execution flow
- Explain how it would work with real backend

---

## Resources

- n8n Documentation: https://docs.n8n.io
- n8n Community: https://community.n8n.io
- Webhook Testing: https://webhook.site (for debugging)
- Resend Documentation: https://resend.com/docs

---

## Success Criteria

You've successfully set up n8n when:

✅ All 5 workflows are imported and activated
✅ Backend can call n8n webhooks (test with curl)
✅ n8n can call backend APIs (test with Execute Workflow)
✅ Emails are being sent successfully
✅ Execution logs show green checkmarks
✅ Workflows are exported to Git
✅ Team members have the webhook URLs they need

---

**Last Updated**: March 2026 (Hackathon Build)
**Maintained by**: Laptop 3 (n8n + Integration Lead)
