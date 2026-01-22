# Complete Deployment Guide - Crime Tracker System

## Pre-Deployment Checklist

### ✅ Local Setup Verification

```bash
# 1. Verify all dependencies are installed
npm install

# 2. Run TypeScript check
npm run check

# 3. Build locally to ensure no errors
npm run build

# 4. Verify database connection
npm run db:push
```

### ✅ Environment Variables Required

Create a `.env.production` file locally or prepare these for Vercel:

```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres:password@db.region.supabase.co:5432/postgres

# Session
SESSION_SECRET=your-secure-random-string-32-chars-minimum

# Email Notifications
SMTP_EMAIL=your-gmail@gmail.com
SMTP_PASSWORD=your-app-specific-password
ADMIN_EMAIL=admin@yourdomain.com

# Production
NODE_ENV=production
```

## Deployment Option 1: Vercel (Recommended)

### Step 1: Push Code to GitHub

```bash
cd "C:\Users\ROYAL\Desktop\Desktop Stuffs\Senior-Stack"
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Select your GitHub repository
4. Click **"Import"**

### Step 3: Configure Environment Variables in Vercel Dashboard

1. In Vercel Project Settings → **Environment Variables**
2. Add each variable:

| Key              | Value                  | Production |
| ---------------- | ---------------------- | ---------- |
| `DATABASE_URL`   | `postgresql://...`     | ✅         |
| `SESSION_SECRET` | Random 32+ char string | ✅         |
| `SMTP_EMAIL`     | Your Gmail address     | ✅         |
| `SMTP_PASSWORD`  | Gmail app password     | ✅         |
| `ADMIN_EMAIL`    | Admin email address    | ✅         |
| `NODE_ENV`       | `production`           | ✅         |

**Getting Gmail App Password:**

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Select **Security** → **2-Step Verification** (enable if not done)
3. Go to **App passwords** → Select **Mail** and **Windows Computer**
4. Copy the generated 16-character password
5. Paste into `SMTP_PASSWORD`

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 5-10 minutes for build to complete
3. Check logs if there are errors

### Step 5: Verify Deployment

- Visit your deployed URL
- Try registering an account (with email)
- Try creating a crime report
- Check admin email for notification

---

## Deployment Option 2: Railway.app

### Step 1: Push to GitHub (same as Vercel)

### Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository

### Step 3: Add PostgreSQL Database

1. Click **"Add"** → **"Database"** → **"PostgreSQL"**
2. Railway auto-generates `DATABASE_URL`
3. Copy the connection string

### Step 4: Add Environment Variables

In Railway Project Settings:

- `DATABASE_URL` (auto-generated)
- `SESSION_SECRET` (random string)
- `SMTP_EMAIL` (your Gmail)
- `SMTP_PASSWORD` (Gmail app password)
- `ADMIN_EMAIL` (admin email)
- `NODE_ENV` (production)

### Step 5: Deploy

- Railway auto-deploys on git push
- Monitor logs for build errors

---

## Deployment Option 3: Render.com

### Step 1: Create Web Service

1. Go to [render.com](https://render.com)
2. Click **"New"** → **"Web Service"**
3. Connect GitHub repository

### Step 2: Add PostgreSQL Database

1. Click **"New"** → **"PostgreSQL"**
2. Copy the connection string from the database dashboard

### Step 3: Configure Web Service

- **Environment**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Node Version**: 20

### Step 4: Add Environment Variables

In Web Service Settings:

- All variables from the table above

### Step 5: Deploy

- Render auto-deploys on git push

---

## Post-Deployment Testing

### 1. Test User Registration

```bash
curl -X POST http://your-deployed-url/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "role": "reporter"
  }'
```

### 2. Test Login

```bash
curl -X POST http://your-deployed-url/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### 3. Test Report Creation

```bash
curl -X POST http://your-deployed-url/api/reports \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "title": "Test Report",
    "description": "Test description",
    "category": "theft",
    "location": "Main Street"
  }'
```

### 4. Verify Email Notification

- Check admin email for crime report notification
- Verify HTML formatting and all details included

---

## Troubleshooting

### Error: "DATABASE_URL is not set"

**Solution:**

1. Verify `DATABASE_URL` is added to Vercel environment variables
2. Redeploy after adding variables
3. Check that variable is marked for **Production**

### Error: "Supabase connection failed"

**Solution:**

1. Test connection string locally: `psql <DATABASE_URL>`
2. Verify IP whitelist in Supabase dashboard
3. For Vercel: Database must allow connections from Vercel IPs
4. Supabase → Settings → Network → Allow Vercel deployment IPs

### Error: "Email failed to send"

**Solution:**

1. Verify Gmail app password (not regular password)
2. Enable 2-step verification on Gmail
3. Check `SMTP_EMAIL` and `SMTP_PASSWORD` are correct
4. Verify Gmail allows "Less secure app access" is enabled (if using regular password)

### Error: "Cannot find module 'nodemailer'"

**Solution:**

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
npm run build
```

### Build Fails: "Port 5000 already in use"

**Solution:**

- This is local development issue, not deployment issue
- Kill local process: `lsof -ti:5000 | xargs kill -9`
- Or use different port: `PORT=3000 npm run dev`

### Deployment Fails: "Build command failed"

**Solution:**

1. Check build logs in Vercel dashboard
2. Run locally: `npm run build`
3. Fix any errors locally first
4. Verify TypeScript: `npm run check`
5. Push fixes and redeploy

---

## Performance Optimization

### 1. Database Connection Pooling

- Supabase already provides connection pooling
- No additional configuration needed

### 2. Email Sending (Non-blocking)

- Email sends in background
- API responds immediately
- Check logs for email send status

### 3. API Caching

- Crime reports API returns fresh data
- No caching to ensure real-time updates

---

## Security Checklist

- ✅ Environment variables stored in Vercel (not in code)
- ✅ DATABASE_URL uses SSL connection (Supabase)
- ✅ SESSION_SECRET is random and strong (32+ chars)
- ✅ CORS configured for production domain
- ✅ API routes protected with authentication
- ✅ Admin functions require admin role
- ✅ Email credentials use app passwords (not user password)
- ✅ No sensitive data logged in production

---

## Monitoring & Logs

### Vercel Logs

- Dashboard → Deployments → Select deployment → Logs
- Real-time logs show API requests and errors

### Database Monitoring

- Supabase Dashboard → SQL Editor
- Monitor query performance
- Check connection counts

### Email Delivery

- Check application logs for email errors
- Gmail → Settings → Less secure apps
- Verify delivery in admin email

---

## Rollback Plan

If deployment fails:

1. **Vercel**: Go to Deployments → Click previous working deployment
2. **Railway**: Select previous build and click "Deploy"
3. **Render**: Click "Manual Deploy" on previous working commit

---

## Support & Debugging

### Enable Debug Logging

```env
DEBUG=express:*
```

### Check Server Health

```bash
curl http://your-deployed-url/api/user -H "Cookie: your-session-cookie"
```

### View Database Logs

- Supabase Dashboard → SQL Editor → Query History
- Monitor slow queries and connection issues

---

## Next Steps

1. ✅ Run `npm run check` to verify TypeScript
2. ✅ Run `npm run build` to test build locally
3. ✅ Push to GitHub
4. ✅ Connect to Vercel
5. ✅ Add environment variables
6. ✅ Deploy
7. ✅ Test all features
8. ✅ Monitor logs for errors

**Deployment typically takes 5-10 minutes. You'll receive an email when complete.**
