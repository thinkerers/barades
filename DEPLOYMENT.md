# 🚀 Deployment Guide - Barades

**Date:** October 22, 2025
**Target:** Production deployment on Vercel (Frontend) + Render (Backend)

---

## 📋 Pre-Deployment Checklist

### ✅ Prerequisites

- [ ] GitHub repository with all latest changes pushed
- [ ] Supabase database ready with production data
- [ ] Resend API key for email service
- [ ] Vercel account (free tier is sufficient)
- [ ] Render account (free tier is sufficient)

### ✅ Environment Variables Ready

- [ ] `DATABASE_URL` (Supabase PostgreSQL connection string)
- [ ] `JWT_SECRET` (generate a secure random string)
- [ ] `RESEND_API_KEY` (from Resend dashboard)

---

## 🎯 Step 1: Deploy Backend to Render

### 1.1 Create Render Service

1. Go to https://render.com and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already done
4. Select the `barades` repository
5. Configure the service:
   - **Name:** `barades-backend`
   - **Region:** Frankfurt (or closest to your users)
   - **Branch:** `main`
   - **Root Directory:** Leave empty (monorepo handled by build command)
   - **Runtime:** Node
   - **Build Command:** `npm install && npx nx build backend --configuration=production`
   - **Start Command:** `node dist/apps/backend/main.js`
   - **Plan:** Free

### 1.2 Add Environment Variables

In the Render dashboard, add these environment variables:

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-change-this-NOW
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
PORT=3000
```

**To generate a secure JWT_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 1.3 Deploy

1. Click **"Create Web Service"**
2. Wait for the build to complete (5-10 minutes)
3. Once deployed, note your backend URL: `https://barades-backend.onrender.com`

### 1.4 Test Backend

```bash
# Test health endpoint
curl https://barades-backend.onrender.com/api

# Test sessions endpoint
curl https://barades-backend.onrender.com/api/sessions
```

---

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Update Backend URL

First, update the production environment file with your actual Render URL:

**File:** `apps/frontend/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://barades-backend.onrender.com/api',
};
```

**File:** `vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npx nx build frontend --configuration=production",
  "outputDirectory": "dist/apps/frontend/browser",
  "framework": null,
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://barades-backend.onrender.com/api/:path*"
    }
  ]
}
```

### 2.2 Commit and Push Changes

```bash
git add apps/frontend/src/environments/environment.prod.ts vercel.json
git commit -m "chore: update production backend URL for deployment"
git push origin main
```

### 2.3 Deploy to Vercel

1. Go to https://vercel.com and sign in
2. Click **"Add New"** → **"Project"**
3. Import your `barades` repository from GitHub
4. Configure the project:

   - **Framework Preset:** Other
   - **Root Directory:** Leave as is
   - **Build Command:** `npx nx build frontend --configuration=production`
   - **Output Directory:** `dist/apps/frontend/browser`
   - **Install Command:** `npm install`

5. Click **"Deploy"**

### 2.4 Wait for Deployment

- First deployment takes ~5-10 minutes
- Vercel will provide a URL like: `https://barades-xxxxx.vercel.app`
- You can add a custom domain later if desired

---

## 🔧 Step 3: Update Backend CORS

Once you have your Vercel URL, update the backend CORS settings:

**File:** `apps/backend/src/main.ts`

Update the CORS configuration to allow your Vercel domain:

```typescript
app.enableCors({
  origin: [
    'http://localhost:4200',
    'https://barades-xxxxx.vercel.app', // Replace with your actual Vercel URL
    'https://barades.vercel.app', // If you set up a custom domain
  ],
  credentials: true,
});
```

Then redeploy the backend:

```bash
git add apps/backend/src/main.ts
git commit -m "chore: update CORS for production frontend URL"
git push origin main
```

Render will auto-deploy the changes (if auto-deploy is enabled).

---

## ✅ Step 4: Verify Deployment

### 4.1 Test Frontend

1. Visit your Vercel URL: `https://barades-xxxxx.vercel.app`
2. Check that the homepage loads
3. Try navigating to different pages

### 4.2 Test Backend Connection

1. Go to Sessions page
2. Verify sessions load from the backend
3. Try the map view
4. Check that locations display correctly

### 4.3 Test Authentication

1. Try to sign up with a new account
2. Verify you receive confirmation (check JWT storage)
3. Try logging in
4. Try accessing protected routes

### 4.4 Test Full Flow

1. Create a new session (if logged in)
2. Make a reservation
3. Check email notifications (if configured)
4. Create a group
5. Create a poll

---

## 🐛 Troubleshooting

### Backend Issues

**Build fails on Render:**

- Check build logs in Render dashboard
- Ensure `package.json` has all dependencies
- Verify Node version compatibility

**Database connection errors:**

- Verify `DATABASE_URL` is correct
- Check Supabase firewall settings (allow all IPs for testing)
- Ensure database is accessible from Render's IP range

**Environment variables not working:**

- Double-check spelling and values
- Restart the service after adding variables
- Check logs for specific error messages

### Frontend Issues

**Build fails on Vercel:**

- Check build logs
- Ensure build command is correct
- Verify output directory path

**API calls fail (CORS errors):**

- Update backend CORS configuration
- Verify backend URL in `environment.prod.ts`
- Check Network tab in browser DevTools

**404 on routes:**

- Vercel should handle SPA routing automatically
- Verify `vercel.json` has the rewrite rule

### Database Issues

**Migrations not applied:**

```bash
# Run migrations manually
npx prisma migrate deploy
```

**Seed data missing:**

```bash
# Run seed script
npx prisma db seed
```

---

## 🔒 Security Checklist

Before going fully public:

- [ ] Change all default passwords
- [ ] Rotate JWT_SECRET (generate new one)
- [ ] Enable HTTPS only (both platforms do this by default)
- [ ] Restrict CORS to specific domains
- [ ] Review Supabase RLS policies
- [ ] Set up error monitoring (optional: Sentry)
- [ ] Configure rate limiting (future enhancement)
- [ ] Enable Vercel analytics (optional)

---

## 🎉 Post-Deployment

### Optional: Custom Domain

**For Frontend (Vercel):**

1. Go to Vercel project settings
2. Navigate to **Domains**
3. Add your custom domain (e.g., `barades.com`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic)

**For Backend (Render):**

1. Go to Render service settings
2. Navigate to **Custom Domain**
3. Add subdomain (e.g., `api.barades.com`)
4. Update DNS with provided CNAME record
5. SSL certificate will be issued automatically

### Monitoring

**Vercel:**

- Analytics: Automatic (view in dashboard)
- Logs: Real-time in dashboard
- Deployments: Track all deployments

**Render:**

- Logs: Real-time in dashboard
- Metrics: CPU, memory, response times
- Health checks: Automatic

**Supabase:**

- Database usage
- Query performance
- Connection pool stats

---

## 🚨 Rollback Procedure

If something goes wrong:

**Frontend (Vercel):**

1. Go to Deployments tab
2. Find previous working deployment
3. Click **"..."** → **"Promote to Production"**

**Backend (Render):**

1. Go to service dashboard
2. Navigate to **Events**
3. Find previous successful deploy
4. Click **"Redeploy"** on that version

**Database:**

- Supabase keeps automatic backups
- Contact support if rollback needed

---

## 📚 Useful Commands

```bash
# Build frontend locally (test before deploy)
npx nx build frontend --configuration=production

# Build backend locally
npx nx build backend --configuration=production

# Test production build locally
npx nx serve frontend --configuration=production

# Run all tests before deploying
npx nx run-many --target=test --all

# Run E2E tests
npx nx e2e frontend-e2e
```

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Nx Docs:** https://nx.dev

---

## ✅ Deployment Status

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Full testing completed
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up

---

**Good luck with your deployment! 🚀**
