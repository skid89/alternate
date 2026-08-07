# Deployment Setup — alternate.lol

This guide covers **Railway** (database), **Cloudinary** (media), and **Vercel** (hosting + env vars).

---

## 1. Railway — PostgreSQL database

Vercel's filesystem is ephemeral, so profile data must live in Postgres.

1. Go to [railway.app](https://railway.app) and create a project.
2. Click **+ New** → **Database** → **PostgreSQL**.
3. Open the Postgres service → **Connect** tab → copy **`DATABASE_URL`** (or `POSTGRES_URL`).
4. Paste it into Vercel env vars (see section 3 below).

The app auto-creates tables and seeds default users (`koni` / `zuka`, password `password123`) on first request.

---

## 2. Cloudinary — file uploads

Used by `POST /api/upload` for profile images, audio tracks, etc.

1. Sign up at [cloudinary.com](https://cloudinary.com).
2. Dashboard → **Settings** → copy:
   - **Cloud name**
   - **API Key**
   - **API Secret**
3. Add all three to Vercel env vars.

**Upload from dashboard (after login):**

```bash
curl -X POST https://your-domain.vercel.app/api/upload \
  -H "Cookie: session_user=koni" \
  -F "file=@./my-image.png" \
  -F "folder=alternate-lol"
```

Response: `{ "success": true, "url": "https://res.cloudinary.com/..." }`

---

## 3. Vercel — deploy + environment variables

### Deploy

1. Push repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repo.
3. Framework preset: **Next.js** (auto-detected).
4. Deploy once, then add env vars and redeploy.

### Environment variables

**Vercel → Project → Settings → Environment Variables**

Add these for **Production** and **Preview**:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** (prod) | Railway Postgres connection string |
| `DEMO_DISCORD_USER_ID` | For live homepage preview | Your Discord user ID (Lanyard must be on) |
| `CLOUDINARY_CLOUD_NAME` | For uploads | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | For uploads | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | For uploads | Cloudinary API secret |

After adding/changing env vars: **Deployments → ⋯ → Redeploy**.

### Local dev

```bash
cp .env.example .env.local
# fill in values
npm run dev
```

---

## 4. Discord live presence (homepage only)

The homepage demo card polls `/api/discord/preview` every 15s using **Lanyard**.

1. Get your Discord user ID (Settings → Advanced → Developer Mode → right-click avatar → Copy User ID).
2. Enable Lanyard: join [discord.gg/lanyard](https://discord.gg/lanyard) or add the Lanyard bot to a server you're in.
3. Set `DEMO_DISCORD_USER_ID` in Vercel and `.env.local`.
4. Redeploy.

Public profile pages and the dashboard editor still use **mock** Discord data from each user's saved config — only the homepage preview is live.

---

## 5. Quick checklist

- [ ] Railway Postgres created, `DATABASE_URL` in Vercel
- [ ] Cloudinary account, three `CLOUDINARY_*` vars in Vercel
- [ ] `DEMO_DISCORD_USER_ID` set + Lanyard enabled
- [ ] Redeployed after env changes
- [ ] Logged in at `/login`, changed default passwords

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Profiles reset after deploy | `DATABASE_URL` missing or wrong in Vercel |
| Homepage shows mock Discord | `DEMO_DISCORD_USER_ID` unset or Lanyard not enabled |
| Upload returns 503 | Cloudinary env vars not set |
| Upload returns 401 | Not logged in (need `session_user` cookie) |
