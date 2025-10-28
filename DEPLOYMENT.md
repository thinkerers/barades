# Barades.com: Deployment Reference Guide

This document explains the production deployment architecture for the Barades TFE project. It covers the services used, the CI/CD workflow, and key operational procedures for maintenance and troubleshooting.

## 1. High-Level Overview

The deployment strategy is split across best-in-class providers, coordinated by a central CI/CD workflow:

- **Frontend**: An Angular application hosted on Vercel, serving static assets from its global CDN.
- **Backend**: A NestJS API hosted on Render, running as a Node.js service.
- **Database**: A Supabase PostgreSQL instance.
- **Email**: Transactional email sent via Resend.
- **CI/CD**: GitHub Actions orchestrates deployments by triggering deploy hooks based on which parts of the Nx monorepo have changed.

This approach keeps each component lightweight and specialized. Automatic deployments on the hosting platforms (Vercel/Render) are disabled to ensure every production release is traceable to a specific, intentional CI workflow run.

## 2. Architecture & Rationale

| Component | Provider           | Rationale                                                                                                                                                                           |
| --------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend  | **Vercel**         | Excellent support for Angular, automatic CDN distribution, and free SSL. Git integration is disabled, and deployments are triggered only by the VERCEL_DEPLOY_HOOK_URL.             |
| Backend   | **Render**         | Straightforward Node.js hosting with first-class Prisma support. `autoDeploy` is set to false (in `render.yaml`), and deployments are triggered only by the RENDER_DEPLOY_HOOK_URL. |
| Database  | **Supabase**       | Provides a managed PostgreSQL database, connection pooling, and a simple interface for network restrictions.                                                                        |
| CI/CD     | **GitHub Actions** | Uses `nx affected` to intelligently determine which projects changed, preventing unnecessary builds and saving costs.                                                               |

## 3. Continuous Deployment (CI/CD) Workflow

The entire deployment process is managed by the `.github/workflows/deploy.yml` workflow, which runs on every push to the `main` branch.

### 3.1 Workflow Steps

1. **Checkout & Install**: The workflow checks out the code and installs dependencies using `npm ci`.
2. **Determine Changes**: It runs `npx nx show projects --affected --target=build` to get a list of projects (e.g., `frontend`, `backend`) that have changed since the last successful main build.
3. **Trigger Hooks Conditionally**:
   - If the `backend` project is in the affected list, the workflow calls the `RENDER_DEPLOY_HOOK_URL`.
   - If the `frontend` project is in the affected list, the workflow calls the `VERCEL_DEPLOY_HOOK_URL`.
4. **Complete**: The workflow job finishes. Render and Vercel handle the actual build and deployment asynchronously on their platforms.

### 3.2 Key Advantages

- **Cost Control**: Documentation-only commits (or changes to unrelated projects) do not trigger new builds, saving build minutes on Render and Vercel.
- **Traceability**: Every production deployment is directly tied to a specific GitHub Actions run.
- **Simplicity**: The workflow avoids polling for deployment status, which saves GitHub Actions minutes. Operators can monitor the deploy status directly in the Vercel and Render dashboards.

### 3.3 Required GitHub Secrets

| Secret                   | Purpose                                                                         |
| ------------------------ | ------------------------------------------------------------------------------- |
| `RENDER_DEPLOY_HOOK_URL` | Render deploy hook that initiates a fresh build/release of the backend service. |
| `VERCEL_DEPLOY_HOOK_URL` | Vercel deploy hook for the frontend production environment.                     |

## 4. Operational Runbook

This section covers common maintenance, monitoring, and troubleshooting tasks.

### 4.1 Monitoring a Deployment

After the GitHub Actions workflow triggers the deploy hooks, the release must be monitored on the respective platforms:

**Vercel (Frontend):**

- Go to the Vercel project dashboard.
- A new deployment will appear at the top of the "Deployments" list.
- Confirm its status transitions to `READY`.

**Render (Backend):**

- Go to the Render service's dashboard.
- Check the "Events" or "Logs" tab to monitor the build and startup process.
- Pay close attention to any `prisma migrate` or database connectivity messages.

**Manual Validation:**

- Load https://barades.com and perform a hard refresh.
- Test the API health endpoint.
- Test a core user flow (e.g., login, view sessions).

### 4.2 Rollback Procedure

If a deployment introduces a bug, rollbacks are handled directly on each platform:

**Vercel (Frontend):**

- Go to the "Deployments" tab.
- Find the previously successful deployment.
- Click the "..." menu and select "Promote to Production".

**Render (Backend):**

- Go to the "Events" tab.
- Find the previously successful deploy event.
- Click the "Redeploy" button for that specific event.

### 4.3 Troubleshooting

| Issue                   | Symptom                                                                                     | Solution                                                                                                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CORS Errors**         | Browser console shows `Access-Control-Allow-Origin` errors. The frontend cannot fetch data. | 1. Verify the `FRONTEND_URL` environment variable in Render is set correctly (e.g., `https://barades.com,https://www.barades.com`). 2. Ensure there are no trailing slashes. 3. Render will redeploy automatically after you save the variable. |
| **DB Connection Fails** | Render logs show `Address not in tenant allow_list` or connection timeouts.                 | 1. Go to your Render service's "Outbound" tab and copy the IP addresses. 2. Go to your Supabase project's "Network Restrictions" (under Database settings). 3. Add all of Render's outbound IPs to the allowlist. (See section 5.3).            |
| **Prisma Client Fails** | Render build logs show `Property 'user' does not exist on type 'PrismaService'`.            | This means `prisma generate` did not run. Verify the `render.yaml` build command includes it: `... && npx prisma generate --schema=... && ...` (See section 5.1).                                                                               |
| **DNS Not Propagating** | `barades.com` shows an old site or a connection error after setup.                          | 1. Wait 15-30 minutes (it can take longer). 2. Use a tool like https://dnschecker.org to check propagation. 3. Verify your DNS records in OVH match section 5.4.                                                                                |

## 5. Key Configuration Reference

This section contains critical configuration snippets for quick reference.

### 5.1 Core Config Files

**render.yaml (Defines the backend service)**

```yaml
services:
  - type: web
    name: barades-backend
    runtime: node
    plan: free
    region: frankfurt
    autoDeploy: false
    buildCommand: npm install && npx prisma generate --schema=apps/backend/prisma/schema.prisma && npx nx build backend --configuration=production
    startCommand: node dist/apps/backend/main.js
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: RESEND_API_KEY
        sync: false
      - key: FRONTEND_URL
        sync: false
```

**vercel.json (Defines frontend build and API proxy)**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npx nx build frontend --configuration=production",
  "outputDirectory": "dist/apps/frontend/browser",
  "framework": "angular",
  "git": {
    "deploymentEnabled": false
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://barades-backend.onrender.com/api/:path*"
    }
  ]
}
```

**apps/frontend/src/environments/environment.prod.ts**

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://barades-backend.onrender.com/api',
};
```

### 5.2 Environment Variables (Render)

These must be set in the Render service's "Environment" tab.

| Key              | Example Value                                                      | Purpose                                                        |
| ---------------- | ------------------------------------------------------------------ | -------------------------------------------------------------- |
| `DATABASE_URL`   | `postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true` | Supabase connection pooling string (Port 6543).                |
| `JWT_SECRET`     | (Generated by Render)                                              | Secure secret for signing auth tokens.                         |
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxxxxx`                                              | API key from your Resend account.                              |
| `FRONTEND_URL`   | `https://barades.com,https://www.barades.com`                      | Comma-separated list of origins for CORS. No trailing slashes. |

### 5.3 Supabase Network Restrictions

The following IP addresses (from Render's Frankfurt region) must be allowlisted in Supabase (Settings → Database → Network Restrictions):

- `18.156.158.53`
- `18.156.42.200`
- `52.59.103.54`
- `74.220.51.0/24` (This is a range)
- `74.220.59.0/24` (This is a range)

**Note**: These IPs can change. Always check the "Outbound" tab on your Render service dashboard for the most current list.

### 5.4 DNS Management (OVH)

The DNS zone for `barades.com` must point to Vercel (for the frontend) while preserving all MX, TXT, and other records for email (OVH/Resend).

| Type  | Name               | Target                                                   |
| ----- | ------------------ | -------------------------------------------------------- |
| A     | @                  | `76.76.21.21` (Vercel's Apex IP)                         |
| CNAME | www                | `cname.vercel-dns.com.`                                  |
| MX    | @                  | `1 mx1.mail.ovh.net.` (Keep all email records)           |
| MX    | @                  | `5 mx2.mail.ovh.net.`                                    |
| MX    | @                  | `100 mx3.mail.ovh.net.`                                  |
| TXT   | @                  | `"v=spf1 include:mx.ovh.com -all"`                       |
| TXT   | resend.\_domainkey | `"p=MIGfMA0GCSqGSIb3DQEBA...IDAQAB"` (Resend DKIM)       |
| —     | —                  | (Keep all other `_autodiscover`, `_dmarc`, etc. records) |

## 6. Potential Enhancements

- **Nx Cloud Integration**: If CI tasks grow (e.g., adding e2e tests), connecting Nx Cloud would speed up workflows by caching build/test results.
- **Automated Verification**: The CI workflow could be extended to poll Vercel/Render APIs for deployment completion and then run automated smoke tests.
- **Staging Environment**: This entire pattern can be duplicated for a staging branch, using separate Render services, deploy hooks, and Supabase (or staging) environment variables.
