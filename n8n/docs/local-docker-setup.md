# 🐳 Option 2: Self-Host n8n Locally with Docker

**For:** Advanced users, full control, no cloud limits
**Time:** 45-60 minutes
**Best if:** You want unlimited workflows or prefer local setup

---

## Prerequisites

```bash
# Check if you have Docker installed
docker --version

# If not installed, install Docker:
# Ubuntu/Debian:
sudo apt update
sudo apt install docker.io docker-compose -y

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (so you don't need sudo)
sudo usermod -aG docker $USER

# Log out and log back in for this to take effect
```

---

## Method A: Docker Run (Quick Start)

### 1. Run n8n Container

```bash
# Simple run command
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# With environment variables (better for production)
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=hackathon2026 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 2. Access n8n

Open browser and go to: **http://localhost:5678**

### 3. Import Your Workflows

- Go to Workflows → Import from file
- Select files from: `/home/prashant/Desktop/hack/DoubtMap/n8n/workflows/`
- Import all 5 workflows

---

## Method B: Docker Compose (Recommended for Hackathon)

### 1. Create docker-compose.yml

```bash
cd /home/prashant/Desktop/hack/DoubtMap
mkdir -p n8n-local
cd n8n-local
```

### 2. Create the compose file

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=hackathon2026
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - NODE_ENV=production
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=Asia/Kolkata
    volumes:
      - n8n_data:/home/node/.n8n
      - /home/prashant/Desktop/hack/DoubtMap/n8n/workflows:/workflows:ro

volumes:
  n8n_data:
    driver: local
```

### 3. Start n8n

```bash
# Start
docker-compose up -d

# Check logs
docker-compose logs -f n8n

# Stop (when needed)
docker-compose down
```

### 4. Access

Go to: **http://localhost:5678**

Login:
- Username: `admin`
- Password: `hackathon2026`

---

## After n8n is Running Locally

### Import Workflows

**Option 1: Via UI**
1. Go to http://localhost:5678
2. Workflows → Import from file
3. Select from: `/home/prashant/Desktop/hack/DoubtMap/n8n/workflows/`

**Option 2: Via CLI (if mounted volume)**
```bash
# Workflows are already accessible in /workflows inside container
docker exec -it n8n n8n import:workflow --input=/workflows/workflow1-weekly-report.json
docker exec -it n8n n8n import:workflow --input=/workflows/workflow2-escalation-alert.json
docker exec -it n8n n8n import:workflow --input=/workflows/workflow3-syllabus-notification.json
docker exec -it n8n n8n import:workflow --input=/workflows/workflow4-daily-digest.json
docker exec -it n8n n8n import:workflow --input=/workflows/workflow5-welcome-email.json
```

---

## Configure Workflows (Same as Cloud)

1. **Set up credentials:**
   - Go to Credentials → Add Credential
   - Type: Header Auth
   - Name: n8n-backend-auth
   - Header Name: x-n8n-secret
   - Value: `308a361239771d72622f920985a66c5d3e1887f9d7462a6d320e89f048478d78`

2. **Update HTTP Request nodes:**
   - For local backend: `http://localhost:8000/api/v1/...`
   - For deployed backend: `https://doubtmap-api.onrender.com/api/v1/...`

3. **Get webhook URLs:**
   - Workflow 3 webhook: `http://localhost:5678/webhook/syllabus-uploaded`
   - Workflow 5 webhook: `http://localhost:5678/webhook/new-user`

---

## Pros and Cons of Local Setup

### ✅ Pros:
- Unlimited workflows (not limited to 5)
- Full control over environment
- No internet required for n8n itself
- Can customize Docker image
- Faster execution (no network latency)

### ❌ Cons:
- Must keep your laptop running
- Webhooks only work if laptop is accessible on network
- Backend team can't easily call your webhooks (unless you expose with ngrok)
- More complex setup
- Need to maintain Docker container

---

## Making Local Webhooks Accessible (Optional)

If you want your backend team to call your local webhooks:

### Use ngrok

```bash
# Install ngrok
sudo snap install ngrok

# Or download from: https://ngrok.com/download

# Expose n8n to internet
ngrok http 5678

# You'll get a public URL like:
# https://abc123.ngrok.io

# Now your webhooks are:
# https://abc123.ngrok.io/webhook/syllabus-uploaded
# https://abc123.ngrok.io/webhook/new-user
```

**Share the ngrok URL with your team!**

---

## Comparison: Cloud vs Local

| Feature | n8n Cloud (Free) | n8n Local (Docker) |
|---------|------------------|-------------------|
| Setup Time | 5 minutes | 30-60 minutes |
| Workflows Limit | 5 | Unlimited |
| Always Running | ✅ Yes | ❌ Only when laptop on |
| Internet Required | ✅ Yes | For webhooks only |
| Webhooks Accessible | ✅ Yes | Need ngrok/port forwarding |
| Best for Hackathon | ✅✅✅ | ⭐⭐ |
| Learning Curve | Easy | Medium |
| Demo Ready | ✅ Yes | ⭐ (if laptop stable) |

---

## My Recommendation for YOUR Situation

**Go with n8n Cloud!** Because:

1. ⏰ **Time:** You have limited hackathon time
2. 📊 **Exact fit:** You have 5 workflows, free tier gives 5
3. 🌐 **Team access:** Backend can easily call your webhooks
4. 🚀 **Demo:** Just share a URL, no setup during presentation
5. 🔧 **Maintenance:** Zero - no Docker to manage

**Use local only if:**
- You want to learn Docker
- You need to customize heavily
- You're comfortable with networking/ngrok
- You have backup laptop to keep running

---

## Decision Helper

Answer these:

1. **Do you have experience with Docker?**
   - No → Use n8n Cloud
   - Yes → Either works

2. **Will your laptop stay on during hackathon?**
   - No/Unsure → Use n8n Cloud
   - Yes → Either works

3. **Do you need more than 5 workflows?**
   - No → Use n8n Cloud
   - Yes → Use local

4. **How much time do you have?**
   - < 1 hour → Use n8n Cloud
   - > 1 hour → Either works

**90% of people should use n8n Cloud for hackathons!**

---

## If You Already Started Local, That's Fine!

Just follow the setup above and:
- Import all workflows
- Configure credentials
- Use ngrok for webhooks
- Update team with your ngrok URLs

---

**Questions? Just ask!** 🚀
