# FARS — Server Deployment Guide (Vercel)

**Repo Structure:** Single repo → `server/` subdirectory → Separate Vercel project.

---

## Prerequisites

- [ ] Vercel CLI installed: `npm i -g vercel`
- [ ] Git repo initialized at project root: `git init && git add . && git commit -m "init"`
- [ ] `.env` file in `server/` has all required values (see below)

---

## Environment Variables (required in Vercel Dashboard)

Set these in your Vercel project dashboard → Settings → Environment Variables:

| Variable | Example | Purpose |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/db` | Database connection |
| `JWT_SECRET` | `zFvcL62iCmljKRp3d...` | Token signing |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | Refresh token lifetime |
| `CLOUDINARY_CLOUD_NAME` | `zaw5eejr` | File uploads |
| `CLOUDINARY_API_KEY` | `237294735626458` | File uploads |
| `CLOUDINARY_API_SECRET` | `eL-ciZXYGCkb...` | File uploads |
| `SMTP_HOST` | `smtp.gmail.com` | Email (optional) |
| `SMTP_PORT` | `587` | Email (optional) |
| `SMTP_USER` | `your@gmail.com` | Email (optional) |
| `SMTP_PASS` | `app_password` | Email (optional) |
| `EMAIL_FROM` | `noreply@fars.com` | Email (optional) |

> **Important:** Do NOT push `.env` to git. `.gitignore` already excludes it.
> All env vars must be set manually in Vercel dashboard.

---

## Step 1: Push to GitHub

```bash
# From project root (D:\Office-Nanosoft\fars\project)
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Server to Vercel

```bash
cd server
vercel --prod
```

Vercel CLI will detect the project. Use these settings:

| Setting | Value |
|---|---|
| **Root Directory** | `server/` (auto-detected if you run `vercel` from inside it) |
| **Framework** | Other |
| **Build Command** | (leave blank — no build needed) |
| **Output Directory** | (leave blank) |
| **Node.js Version** | 20.x (auto) |

The existing `server/vercel.json` will route all traffic to `server.js`.

---

## Step 3: Add Environment Variables in Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) → your project → **Settings** → **Environment Variables**
2. Add **all** variables from the table above (copy from your local `.env`)
3. Click **Save**
4. Go to **Deployments** → find latest deployment → **Redeploy**

---

## Step 4: Verify Deployment

After redeploy, test these endpoints on your live URL:

```bash
# Health check
curl https://fars-server.vercel.app/health

# Courses (public)
curl https://fars-server.vercel.app/api/courses

# Admin login
curl -X POST https://fars-server.vercel.app/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fars.com","password":"admin123"}'
```

---

## Step 5: Redeploy After Updates

```bash
git add .
git commit -m "your message"
git push
```

Vercel auto-deploys on every push to the main branch.

Or manually:
```bash
cd server
vercel --prod
```

---

## Common Issues

| Problem | Solution |
|---|---|
| `MongoDB connection error` | Check `MONGODB_URI` in Vercel env vars — ensure password has no special chars that need encoding |
| `503` or timeout | Vercel serverless functions have a 10s timeout. Cold starts are normal for first request. |
| `404` on routes | Verify `vercel.json` exists in `server/` with correct route config |
| Env vars not applied | After changing env vars in dashboard, **Redeploy** the latest deployment |

---

## Project Info

- **Server URL:** `https://fars-server.vercel.app` (replace with your actual URL)
- **API Base:** `https://fars-server.vercel.app/api`
- **Health:** `https://fars-server.vercel.app/health`

*(Client deployment guide will be added after client implementation is complete.)*
