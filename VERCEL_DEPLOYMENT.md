# Vercel Deployment Fix Guide

## Changes Made

### 1. **vite.config.ts** - Fixed Replit Plugin Issues

- Made Replit plugins optional and lazy-loaded
- Prevents build errors when deploying outside of Replit environment
- Plugins only load in development on Replit

### 2. **vercel.json** - Updated Build Configuration

- Set correct `outputDirectory` to `dist/public`
- Added Node.js 20.x version specification
- Added proper rewrites for SPA routing
- Added cache headers for API routes

### 3. **api/index.ts** - Created Vercel Serverless Function

- Implements proper Vercel Node.js runtime
- Lazy-loads dependencies to reduce cold start time
- Handles database connection failures gracefully
- Includes CORS configuration

### 4. **package.json** - Added Required Dependencies

- Added `@vercel/node` for Vercel deployment support
- Added `engines` field for Node.js 20.x

### 5. **.env.example** - Created Environment Template

- Reference file for required environment variables

## Step-by-Step Deployment Instructions

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Fix Vercel deployment configuration"
git push origin main
```

### Step 2: Re-import in Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project" if needed, or skip if already imported
3. Select the `Sardaunatechworks/Senior-Stack-Project` repository
4. Click "Import"

### Step 3: Configure Environment Variables

In the **Environment Variables** section, add:

```
DATABASE_URL = postgresql://user:password@yourhost:5432/crimedb
NODE_ENV = production
SESSION_SECRET = your-secure-random-string-here
VERCEL_URL = your-project.vercel.app
```

**To get DATABASE_URL:**

#### Option A: Neon.tech (Free, Recommended)

1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a PostgreSQL project
3. Copy the connection string (looks like `postgresql://user:password@...`)
4. Paste into `DATABASE_URL`

#### Option B: Railway.app

1. Go to [railway.app](https://railway.app)
2. Create a PostgreSQL database
3. Copy the DATABASE_URL from your project
4. Paste into Vercel environment variables

#### Option C: AWS RDS / Azure Database

- Follow your provider's documentation to get the connection string

### Step 4: Build Settings (Should Auto-Detect)

Verify these are correct:

- **Build Command**: `npm run build`
- **Output Directory**: `dist/public`
- **Node Version**: 20.x

### Step 5: Deploy

1. Click **Deploy**
2. Wait for build to complete (5-10 minutes)
3. Check deployment logs if there are errors

## Troubleshooting

### Error: "DATABASE_URL is not set"

- Add `DATABASE_URL` to Environment Variables in Vercel dashboard
- Re-deploy after adding the variable

### Error: "Command npm run build exited with 1"

- Check build logs in Vercel dashboard
- Make sure all environment variables are set
- Check that TypeScript compilation succeeds: `npm run check`

### Error: "Port 3000 already in use"

- Vercel automatically assigns ports, this shouldn't happen
- If it does, clear cache and redeploy

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Ensure database allows connections from Vercel's IP range
- Check database firewall settings

## Testing Locally Before Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Create .env.local with your DATABASE_URL
echo "DATABASE_URL=postgresql://..." > .env.local

# Test locally with Vercel runtime
vercel dev

# Visit http://localhost:3000
```

## Database Setup in Production

After successful deployment, initialize your database:

1. **Option A: Vercel CLI**

   ```bash
   vercel env pull  # Download env vars locally
   npm run db:push  # Push schema to production database
   ```

2. **Option B: From Any Machine**
   ```bash
   export DATABASE_URL="your-connection-string"
   npm run db:push
   ```

## Production Checklist

- [ ] Environment variables added to Vercel
- [ ] Database created and accessible from Vercel
- [ ] Build command runs successfully locally: `npm run build`
- [ ] Type checking passes: `npm run check`
- [ ] Deployment logs show no errors
- [ ] Frontend loads at your Vercel domain
- [ ] API routes respond correctly (test `/api/auth/me`)
- [ ] Database migrations applied

## Next Steps

After deployment:

1. Visit your Vercel domain URL
2. Test login/registration
3. Test crime report submission
4. Check admin functionality
5. Monitor logs in Vercel dashboard

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Drizzle ORM**: https://orm.drizzle.team/docs/get-started-postgresql
- **PostgreSQL**: https://www.postgresql.org/docs/
