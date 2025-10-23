# 🚀 Deployment Guide - Barades

**Last Updated:** October 23, 2025
**Status:** ✅ Successfully Deployed
**Target:** Production deployment on Vercel (Frontend) + Render (Backend)

---

## 📋 Pre-Deployment Checklist

### ✅ Prerequisites

- [x] GitHub repository with all latest changes pushed
- [x] Supabase database ready with production data
- [x] Resend API key for email service
- [x] Vercel account (free tier)
- [x] Render account (free tier)
- [x] Domain name configured (barades.com)

### ✅ Environment Variables Ready

- [x] `DATABASE_URL` (Supabase PostgreSQL connection string with pooling)
- [x] `JWT_SECRET` (generated via Render's secure generator)
- [x] `RESEND_API_KEY` (from Resend dashboard)
- [x] `FRONTEND_URL` (Vercel production URL for CORS)

---

## 🎯 Step 1: Deploy Backend to Render

### 1.0 Confirm Code Preparation (already committed)

- ✅ `.nvmrc` exists at repo root with `22.14.0`
- ✅ `package.json` contains
  ```json
  "engines": {
    "node": ">=22.0.0 <23.0.0"
  }
  ```
- ✅ `render.yaml` has the Prisma-aware build command:
  ```yaml
  buildCommand: npm install && npx prisma generate --schema=apps/backend/prisma/schema.prisma && npx nx build backend --configuration=production
  ```
- ✅ `render.yaml` has `autoDeploy: true`

### 1.1 Push Code to GitHub

```bash
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

### 1.2 Create Render Service via Blueprint

1. Go to https://dashboard.render.com and sign in
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub account if not already done
4. Select the `thinkerers/barades` repository
5. Render will automatically detect `render.yaml` in the root
6. Name your blueprint: `barades`

### 1.3 Configure Environment Variables

Render will show you the required environment variables from `render.yaml`:

**DATABASE_URL:**

- Get from Supabase: Settings → Database → Connection String → **Transaction mode** (with pooling)
- Format: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`
- Example: `postgresql://postgres.yugtxsppenzskyutjytx:Crayon1-Anew3-Luckiness0-Choking4-Phoney2-Bouncy4-Automatic8-Flask5-Voice7-Aching2@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true`

**JWT_SECRET:**

- Click the **"Generate"** button in Render (recommended)
- Or generate manually: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

**RESEND_API_KEY:**

- Get from https://resend.com/api-keys
- Format: `re_xxxxxxxxxxxxxxxxxxxxxxxxxx`

### 1.4 Configure Supabase IP Allowlist

⚠️ **Critical Step:** Render's IPs must be allowed by Supabase

1. Go to Render Dashboard → Your Service → **"Outbound"** tab
2. Copy the outbound IP addresses shown (e.g., `18.156.158.53`, `52.59.103.54`, etc.)
3. Go to Supabase Dashboard → Settings → Database → **Network Restrictions**
4. Add each Render IP address:
   - Current IPs: `18.156.158.53`, `18.156.42.200`, `52.59.103.54`
   - New IP ranges (from Oct 27, 2025): `74.220.51.0/24`, `74.220.59.0/24`
5. Click **"Save"**

### 1.5 Deploy

1. Click **"Apply"** to deploy the blueprint
2. Render will:
   - Install dependencies
   - Generate Prisma Client (`npx prisma generate`)
   - Build backend (`npx nx build backend --configuration=production`)
   - Start the server (`node dist/apps/backend/main.js`)
3. Wait for build to complete (5-10 minutes)
4. Note your backend URL: `https://barades-backend.onrender.com`

### 1.6 Verify Backend Deployment

```bash
# Test API health
curl https://barades-backend.onrender.com/api

# Test sessions endpoint
curl https://barades-backend.onrender.com/api/sessions
```

Expected: JSON response with sessions data or empty array

---

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Update Backend URL in Code

Update the production environment file with your actual Render backend URL:

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
git commit -m "feat: configure frontend to use production backend URL"
git push origin main
```

### 2.3 Make Repository Public (Required for Vercel Free Tier)

1. Go to https://github.com/thinkerers/barades
2. Click **Settings**
3. Scroll to **"Danger Zone"**
4. Click **"Change visibility"** → **"Make public"**
5. Type repository name to confirm

⚠️ **Ensure no secrets are committed** (`.env` files are in `.gitignore`)

### 2.4 Deploy to Vercel

1. Go to https://vercel.com and sign in
2. Click **"Add New..."** → **"Project"**
3. Import `thinkerers/barades` repository
4. Configure the project:
   - **Framework Preset:** Angular (auto-detected)
   - **Root Directory:** `./`
   - **Build Command:** `npx nx build frontend --configuration=production`
   - **Output Directory:** `dist/apps/frontend/browser`
   - **Environment Variables:** None needed (hardcoded in environment.prod.ts)

- If Vercel prompts for a different root, keep `./` (do not select `apps/frontend`)
- If Vercel pre-fills an example environment variable, delete it before deploying

5. Click **"Deploy"**

### 2.5 Wait for Deployment

- First deployment takes ~3-5 minutes
- Vercel provides a URL: `https://barades-3bxrlhne8-theophile-desmedts-projects.vercel.app`
- Note this URL for the next step

---

## 🔧 Step 3: Update Backend CORS

Add your production URL(s) to Render's environment variables (comma-separated if more than one):

1. Go to Render Dashboard → `barades-backend` → **Environment** tab
2. Click **"Add Environment Variable"**
3. Add or update the variable:

- **Key:** `FRONTEND_URL`
- **Value:** `https://barades-3bxrlhne8-theophile-desmedts-projects.vercel.app`

4. Click **"Save Changes"**

Render will automatically redeploy (2-3 minutes).

**Note:** The backend uses the comma-separated origins in `apps/backend/src/main.ts`:

```typescript
const envOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const origins = ['http://localhost:4200', 'http://localhost:4201', ...(envOrigins.length > 0 ? envOrigins : ['https://barades.vercel.app'])];

app.enableCors({
  origin: origins,
  credentials: true,
});
```

---

## 🌐 Step 4: Configure Custom Domain (barades.com)

### 4.1 Add Domain to Vercel

1. Go to Vercel Dashboard → Your `barades` project
2. Click **"Settings"** → **"Domains"**
3. Click **"Add"**
4. Enter `barades.com` → Select **"Production"** environment → **"Save"**
5. Also add `www.barades.com` → Select **"Production"** → **"Save"**

Vercel will show DNS records to configure.

### 4.2 Update DNS Records at OVH

Edit your DNS zone file in **text mode**:

**Before:**

```dns
@    IN A     51.91.236.255
www  IN A     51.91.236.255
www  IN AAAA  2001:41d0:301::29
www  IN TXT   "3|welcome"
```

**After:**

```dns
@    IN A     216.198.79.1
www  IN CNAME a3f5223adabd5435.vercel-dns-017.com.
```

**Complete zone file (keep all email records):**

```dns
$TTL 3600
@	IN SOA dns200.anycast.me. tech.ovh.net. (2025102301 86400 3600 3600000 60)
        IN NS     dns200.anycast.me.
        IN NS     ns200.anycast.me.
        IN NS     piper.ns.cloudflare.com.
        IN NS     renan.ns.cloudflare.com.
        IN MX     1 mx1.mail.ovh.net.
        IN MX     5 mx2.mail.ovh.net.
        IN MX     100 mx3.mail.ovh.net.
        IN A     216.198.79.1
        IN TXT     "v=spf1 include:mx.ovh.com -all"
_autodiscover._tcp        IN SRV     0 0 443 mailconfig.ovh.net.
_dmarc        IN TXT     "v=DMARC1; p=none;"
_imaps._tcp        IN SRV     0 0 993 ssl0.ovh.net.
_submission._tcp        IN SRV     0 0 465 ssl0.ovh.net.
autoconfig        IN CNAME     mailconfig.ovh.net.
autodiscover        IN CNAME     mailconfig.ovh.net.
ftp        IN CNAME     barades.com.
imap        IN CNAME     ssl0.ovh.net.
mail        IN CNAME     ssl0.ovh.net.
ovhmo5366088-selector1._domainkey        IN CNAME     ovhmo5366088-selector1._domainkey.4037928.fk.dkim.mail.ovh.net.
ovhmo5366088-selector2._domainkey        IN CNAME     ovhmo5366088-selector2._domainkey.4037927.fk.dkim.mail.ovh.net.
pop3        IN CNAME     ssl0.ovh.net.
resend._domainkey        IN TXT     "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCrYp/Uj6nJG1Ev55rjnSVj5Q8p7IAitgI6uqDuzsQCLbCYuCjVfemeyPWkolHIgoFLbI/p9rxDsO+XO/tuLFiFffCbiqV4seKM3bxJO3fRkFmNO9PvdMXnuD6KA3/a9aa9x4um3hONqMy4JfPCmkCCDI+E0eUSVRhjxBxBVxLWSwIDAQAB"
send        IN MX     10 feedback-smtp.eu-west-1.amazonses.com.
send        IN TXT     "v=spf1 include:amazonses.com ~all"
smtp        IN CNAME     ssl0.ovh.net.
www        IN CNAME     a3f5223adabd5435.vercel-dns-017.com.
```

**Key changes:**

- Apex `@` points to Vercel's IP: `216.198.79.1`
- `www` is a CNAME to Vercel: `a3f5223adabd5435.vercel-dns-017.com.`
- Removed `www` AAAA and TXT records (conflict with CNAME)
- All email records preserved

### 4.3 Wait for DNS Propagation

- DNS changes take **10-30 minutes** (up to 48 hours maximum)
- Check propagation: https://dnschecker.org → Enter `barades.com` and `www.barades.com`
- Vercel will auto-issue SSL certificate once DNS is detected

### 4.4 Update Backend CORS for Custom Domain

Once DNS propagates and both domains resolve:

1. Decide your canonical domain (e.g., `https://www.barades.com`)
2. Go to Render → `barades-backend` → **Environment**
3. Set `FRONTEND_URL` to both domains (comma separated):

- Example: `https://barades.com,https://www.barades.com`

4. Save (Render will redeploy automatically)

---

## ✅ Step 5: Verify Deployment

### 5.1 Test Vercel Deployment

Visit your deployment URL:

- **Vercel URL:** `https://barades-3bxrlhne8-theophile-desmedts-projects.vercel.app`
- **Custom Domain:** `https://barades.com` (after DNS propagates)
- **WWW:** `https://www.barades.com` (after DNS propagates)

### 5.2 Test Frontend-Backend Connection

1. Open the Vercel URL in your browser
2. Navigate to **Sessions** page
3. Verify sessions load from Render backend
4. Check browser console for any CORS errors
5. Test authentication flow (signup/login)

### 5.3 Test Full User Flow

- [ ] Homepage loads with gradient and navigation
- [ ] Sessions list displays correctly
- [ ] Map view shows session locations
- [ ] User can sign up / log in
- [ ] Authenticated users can create sessions
- [ ] Reservations work correctly
- [ ] Email notifications sent via Resend

### 5.4 Monitor Logs

**Render Backend Logs:**

- Go to Render Dashboard → `barades-backend` → **Logs** tab
- Watch for any errors or warnings

**Vercel Frontend Logs:**

- Go to Vercel Dashboard → Your project → **Deployments** → Latest → **Logs**
- Check for build warnings or runtime errors

---

## 🔧 Troubleshooting

### Issue: CORS Errors

**Symptom:** Browser console shows `Access-Control-Allow-Origin` errors

**Solution:**

1. Verify `FRONTEND_URL` environment variable is set in Render
2. Check the value matches your actual Vercel/domain URL (no trailing slash)
3. Redeploy backend after changing environment variables

### Issue: DNS Not Propagating

**Symptom:** `barades.com` shows `ERR_CONNECTION_CLOSED` or old site

**Solution:**

1. Wait 15-30 minutes for DNS propagation
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check propagation status: https://dnschecker.org
4. Verify DNS records in OVH match the configuration above

### Issue: Backend Database Connection Fails

**Symptom:** Render logs show `Address not in tenant allow_list`

**Solution:**

1. Get Render's outbound IPs from: Render Dashboard → Service → **Outbound** tab
2. Add each IP to Supabase: Settings → Database → Network Restrictions
3. Redeploy Render service (Manual Deploy)

### Issue: Prisma Client Not Generated

**Symptom:** Build fails with `Property 'user' does not exist on type 'PrismaService'`

**Solution:**

- Verify `render.yaml` includes: `npx prisma generate --schema=apps/backend/prisma/schema.prisma`
- Current build command:
  ```bash
  npm install && npx prisma generate --schema=apps/backend/prisma/schema.prisma && npx nx build backend --configuration=production
  ```

### Issue: Node Version Mismatch

**Symptom:** Build fails with incompatibility errors

**Solution:**

- Verify `.nvmrc` file exists with: `22.14.0`
- Verify `package.json` has:
  ```json
  "engines": {
    "node": ">=22.0.0 <23.0.0"
  }
  ```

---

## 📊 Production URLs

- **Frontend (Vercel):** https://barades-3bxrlhne8-theophile-desmedts-projects.vercel.app
- **Custom Domain:** https://barades.com (when DNS propagates)
- **Backend (Render):** https://barades-backend.onrender.com
- **Database:** Supabase (eu-west-3)
- **Email:** Resend

---

## 🔐 Security Checklist

- [x] JWT_SECRET is cryptographically secure (generated by Render)
- [x] DATABASE_URL uses connection pooling (port 6543)
- [x] CORS restricted to production domains only
- [x] Supabase IP allowlist configured for Render IPs
- [x] Environment variables stored securely (Render dashboard)
- [x] `.env` files in `.gitignore` (not committed to repo)
- [x] HTTPS enforced on both frontend and backend
- [ ] Consider adding rate limiting (future enhancement)
- [ ] Consider adding Helmet middleware (future enhancement)
- [ ] Consider adding refresh tokens (future enhancement)

---

## 🚀 Deployment Complete!

**Frontend:** ✅ Live on Vercel
**Backend:** ✅ Live on Render
**Database:** ✅ Connected via Supabase
**Domain:** ⏳ DNS propagating (10-30 minutes)

Your application is now live and accessible at:

- https://barades-3bxrlhne8-theophile-desmedts-projects.vercel.app
- https://barades.com (after DNS propagates)

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
