# n8n Integration for DoubtMap

> **Role**: Workflow automation, backend-frontend integration orchestrator, notification system

---

## Overview

This folder contains all n8n workflow definitions and documentation for the DoubtMap hackathon project. n8n orchestrates automated workflows including weekly report generation, escalation alerts, and email notifications.

---

## Folder Structure

```
n8n/
├── workflows/                              # n8n workflow JSON exports
│   ├── workflow1-weekly-report.json        # 🎯 MOST IMPORTANT
│   ├── workflow2-escalation-alert.json     # 🚨 CRITICAL
│   ├── workflow3-syllabus-notification.json
│   ├── workflow4-daily-digest.json
│   └── workflow5-welcome-email.json
│
└── docs/                                   # Documentation
    ├── n8n-setup-guide.md                  # Step-by-step n8n Cloud setup
    ├── workflow-descriptions.md            # What each workflow does
    ├── api-integration.md                  # Backend ↔ n8n integration specs
    └── testing-checklist.md                # Complete testing guide
```

---

## Quick Start

### 1. Set Up n8n Cloud

1. Go to https://n8n.io and sign up (free tier)
2. You'll get a URL like: `https://your-instance.app.n8n.cloud`
3. Follow [n8n-setup-guide.md](docs/n8n-setup-guide.md) for detailed steps

### 2. Import Workflows

1. In n8n Cloud → **Workflows** → **Import workflow**
2. Upload each JSON file from `workflows/` folder
3. Activate workflows (toggle switch in top-right)

### 3. Configure Environment Variables

In n8n Cloud → **Settings** → **Variables**:

| Variable | Value |
|----------|-------|
| `BACKEND_URL` | `https://doubtmap-api.onrender.com` |
| `FRONTEND_URL` | `https://doubtmap.vercel.app` |
| `N8N_SECRET` | (generate with `openssl rand -hex 32`) |

### 4. Set Up Credentials

In n8n Cloud → **Credentials**:

1. **Header Auth** (name: `n8n-backend-auth`)
   - Header Name: `x-n8n-secret`
   - Header Value: Same as `N8N_SECRET` above

2. **Email Service** (optional)
   - Use n8n built-in email OR configure Resend API

---

## Workflows Summary

### 🎯 Workflow 1: Weekly Report Generator (MOST IMPORTANT)
**Trigger**: Every Sunday at 10 PM
**Purpose**: Generate personalized AI learning reports for each student

**Demo Value**: Shows AI automation, judges love personalized reports

---

### 🚨 Workflow 2: Doubt Escalation Alert (CRITICAL)
**Trigger**: Every 6 hours
**Purpose**: Alert professors when students struggle with low-confidence topics

**Demo Value**: Proactive professor alerts, real-time response to confusion

---

### 📚 Workflow 3: Syllabus Upload Notification
**Trigger**: Webhook (called by backend)
**Purpose**: Notify students when new syllabus is uploaded

**Demo Value**: Instant campus-wide notifications

---

### 📊 Workflow 4: Daily Doubt Digest
**Trigger**: Every day at 8 PM
**Purpose**: Send students top 5 trending topics on campus

**Demo Value**: Gamification, peer learning, engagement

---

### 👋 Workflow 5: Welcome Email on Sign-up
**Trigger**: Webhook from Clerk
**Purpose**: Welcome new users with role-specific emails

**Demo Value**: Seamless onboarding, professional UX

---

## Integration Points

### n8n → Backend APIs

```
GET  /api/v1/doubts/recent?limit=1000
POST /api/v1/webhooks/n8n/generate-report?user_id=xxx
POST /api/v1/webhooks/n8n/get-escalated
GET  /api/v1/doubts/heatmap
```

All authenticated with `x-n8n-secret` header.

### Backend → n8n Webhooks

```
POST https://your-instance.app.n8n.cloud/webhook/syllabus-uploaded
POST https://your-instance.app.n8n.cloud/webhook/new-user
```

See [api-integration.md](docs/api-integration.md) for full specs.

---

## Testing

Before demo day, verify:

✅ All 5 workflows import successfully
✅ Environment variables are set correctly
✅ Credentials work (test with Execute Workflow)
✅ Backend endpoints return expected data
✅ Emails are being sent and formatted correctly
✅ Workflows are activated (green toggle)
✅ Production URLs (not localhost) are configured

Full testing guide: [testing-checklist.md](docs/testing-checklist.md)

---

## Demo Script (for your portion)

**Minute 4 of 5-minute pitch:**

1. Open n8n Cloud dashboard
2. "Every Sunday, n8n automatically generates reports for each student"
3. Show Workflow 1 → Click "Execute Workflow" → Show green nodes
4. "When AI isn't confident, professors get alerted automatically"
5. Show Workflow 2 execution log
6. "This is a self-improving, fully automated learning platform"

**Backup**: If live demo fails, show screenshots of workflow executions

---

## Team Coordination

### Share with Laptop 2 (Backend):
- `N8N_WEBHOOK_SECRET` (same as `N8N_SECRET`)
- Webhook URLs:
  - `https://your-instance.app.n8n.cloud/webhook/syllabus-uploaded`
  - `https://your-instance.app.n8n.cloud/webhook/new-user`

### Share with Laptop 1 (Frontend):
- Email templates (so they know what students see)
- Clerk webhook URL for new users

### Receive from Laptop 2:
- Backend API base URL (Render or localhost)
- Groq API key (if using LLM nodes directly in n8n)

---

## Priority Order (if time is limited)

1. ✅ Workflow 1: Weekly Report (MUST)
2. ✅ Workflow 2: Escalation Alert (MUST)
3. Workflow 4: Daily Digest (nice-to-have for demo)
4. Workflow 3: Syllabus Notification (quick to build)
5. Workflow 5: Welcome Email (lowest priority)

---

## Troubleshooting

### Workflow execution fails with 401 error
→ Check that `x-n8n-secret` matches `N8N_WEBHOOK_SECRET` in backend `.env`

### Emails not sending
→ Verify email credentials, or use n8n built-in email as fallback

### Backend can't reach n8n webhook
→ Check workflow is activated, webhook URL is correct

### n8n can't reach backend
→ Ensure backend is deployed (localhost won't work from n8n Cloud)

---

## Resources

- **n8n Documentation**: https://docs.n8n.io
- **n8n Community**: https://community.n8n.io
- **Setup Guide**: [docs/n8n-setup-guide.md](docs/n8n-setup-guide.md)
- **Workflow Details**: [docs/workflow-descriptions.md](docs/workflow-descriptions.md)
- **API Specs**: [docs/api-integration.md](docs/api-integration.md)
- **Testing**: [docs/testing-checklist.md](docs/testing-checklist.md)

---

## Success Criteria

You've completed the n8n setup when:

✅ All 5 workflows are imported and activated
✅ Backend can call n8n webhooks
✅ n8n can call backend APIs
✅ Emails are being sent successfully
✅ Workflows are exported to Git
✅ You can demo workflows live (or have screenshots ready)

---

## Contact

**Laptop 3 (n8n + Integration Lead)**: Your role
**Laptop 2 (Backend)**: Provides API endpoints
**Laptop 1 (Frontend)**: Configures Clerk webhooks

---

**Last Updated**: March 2026 (Hackathon Build)
**Status**: Ready for implementation 🚀

---

## Git Workflow

When adding to this folder:

```bash
# Add new or updated workflows
git add n8n/workflows/*.json

# Add documentation
git add n8n/docs/*.md

# Commit
git commit -m "Add n8n workflow: [workflow name]"

# Push
git push origin main
```

**Important**: Never commit credentials or secrets to Git! These go in n8n Cloud settings only.

---

## Emergency Fallbacks (Demo Day)

**If n8n Cloud is down:**
- Show workflow screenshots
- Explain what would happen when triggered
- Focus on the logic and value proposition

**If backend integration fails:**
- Use static test data in Code nodes
- Execute workflows to show flow
- Emphasize the automation logic

**If email fails:**
- Skip email delivery
- Show workflow execution (green = success)
- Focus on report generation in DB

---

**Good luck with the hackathon! 🎯🚀**
