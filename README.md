# /alternate | Vercel Deployment & Setup Manual

This document is a comprehensive guide to deploying **Alternate** (alternate.lol) directly to **Vercel** with a remote PostgreSQL database (such as Supabase, Neon, or Railway) and Discord OAuth.

---

## ⚡ Deployment Checklist & Flow

```mermaid
graph TD
    A[Setup Remote Database] --> B[Push Code to GitHub]
    B --> C[Import Repo into Vercel]
    C --> D[Configure Vercel Environment variables]
    D --> E[Trigger Vercel Build & Deploy]
    E --> F[Run Database Migrations & Seeds]
```

---

## 🐙 Step 1: Push Code to GitHub

Since you are deploying directly to Vercel, your code must be hosted on a GitHub repository.

1. **Log in to GitHub**: Visit [GitHub.com](https://github.com) and sign in.
2. **Create a New Repository**:
   - Click the **"+"** icon in the upper-right corner -> **New repository**.
   - Set Repository Name to `alternate` (or your choice).
   - Keep the repository **Private**.
   - Click **Create repository** (do NOT add a README, `.gitignore`, or license).
3. **Push the Code from your terminal**:
   Open your command prompt or terminal in the project workspace folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initialize alternate.lol full-stack website"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/alternate.git
   git push -u origin main
   ```

---

## 🗄️ Step 2: Set Up Your Hosted Database

Alternate requires a PostgreSQL database. You can set one up in 2 minutes:

1. **Get a Database URL**:
   - **Neon** (neon.tech) or **Supabase** (supabase.com) are recommended free-tier providers.
   - Create a new project and copy your connection string. It will look like this:
     `postgresql://postgres:password@ep-cool-snowflake-123456.us-east-2.aws.neon.tech/neondb?sslmode=require`

---

## 🚀 Step 3: Deploying on Vercel

1. Open your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** -> **Project**.
3. Locate your `alternate` repository and click **Import**.
4. In the project creation panel, expand **Environment Variables** and add these required production variables:

| Variable Name | Example/Description |
| :--- | :--- |
| `DATABASE_URL` | Your remote PostgreSQL connection string (e.g. from Neon or Supabase). |
| `JWT_SECRET` | A long, secure random string used to encrypt cookies (e.g., `alternate-session-secure-key-hash`). |
| `NEXT_PUBLIC_APP_URL` | Your production URL, e.g., `https://alternate.lol` or `https://your-app.vercel.app` (no trailing slash). |
| `ADMIN_SETUP_SECRET` | A secure key of your choice to create the first Owner account (e.g. `setup-alternate-owner-2026`). |
| `DISCORD_CLIENT_ID` | Your Discord developer client ID. |
| `DISCORD_CLIENT_SECRET` | Your Discord developer client secret. |
| `DISCORD_REDIRECT_URI` | `https://your-app.vercel.app/api/auth/callback/discord` (matching the Vercel URL). |
| `STORAGE_PROVIDER` | Set to `local` for mock Vercel local storage, or `supabase` / `s3` for permanent CDN asset uploads. |

5. Click **Deploy**. Vercel will automatically run `npm run build` which triggers the `postinstall` step (`prisma generate`) and compiles the application successfully.

---

## 🛢️ Step 4: Run Migrations and Seed Database

Once the app is running on Vercel, you need to create the database tables and populate them with the initial verification badges, layouts, and the first administrator user:

Run this command **once** in your local terminal to create the tables in your hosted database:
```bash
# Push tables to your remote database
npx prisma db push --accept-data-loss

# Seed default configs, badges, and template items
npx prisma db seed
```
*Note: Make sure your local `.env`'s `DATABASE_URL` is pointed to your remote database before running these, or set it inline:*
```bash
DATABASE_URL="YOUR_REMOTE_POSTGRES_URL" npx prisma db push
DATABASE_URL="YOUR_REMOTE_POSTGRES_URL" npx prisma db seed
```

---

## 👑 Step 5: Initialize First Administrator Account

1. Once Vercel deployment completes, navigate to your deployment URL: `https://your-app.vercel.app/admin`.
2. The page will detect that no admins exist and show the **First-time Owner Setup**.
3. Input your `ADMIN_SETUP_SECRET` (configured in Vercel environment variables), set your admin email/password, and submit.
4. The setup route is now permanently locked and disabled! You can now log into `/admin` to ban users, resolve abuse reports, or distribute badges.
