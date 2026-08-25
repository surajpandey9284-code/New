# Suraj Pandey — Portfolio + Admin Panel

One website. Public portfolio + admin content editor live in the same app —
click **"Login as Admin"** in the top-right nav to sign in, no separate URL needed.

## What's inside
- `server.js` — Express server, session-based admin login, contact form emailing, JSON-based content storage
- `data/data.json` — your editable content (profile, experience, projects, skills, education, certifications)
- `data/messages.json` — contact form submissions land here (auto-created)
- `public/index.html` + `public/js/main.js` — the public site (loads content from the API)
- `public/admin.html` + `public/js/admin.js` — the admin dashboard (protected, edits everything, views messages)

## Run locally
```bash
npm install
cp .env.example .env
# edit .env with your real values
npm start
```
Visit `http://localhost:10000`. Click **Login as Admin** to sign in with the `ADMIN_USER` / `ADMIN_PASS` you set in `.env`.

## Deploy on Render (same flow as your other projects)
1. Push this project to a GitHub repo.
2. Render → New → Web Service → connect the repo.
3. **Build Command:** `npm install`
4. **Start Command:** `node server.js`
5. **Environment Variables** — add these (values from your own `.env`):

| Key | Value |
|---|---|
| `PORT` | `10000` |
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | any long random string |
| `ADMIN_USER` | your chosen admin username |
| `ADMIN_PASS` | your chosen admin password |
| `EMAIL_USER` | your Gmail address |
| `EMAIL_PASS` | Gmail **App Password** (16 chars, not your login password) |
| `EMAIL_TO` | where contact form messages should be emailed |

6. Click **Deploy Web Service**.
7. Once live, go to `https://your-app.onrender.com`, click **Login as Admin**, and start editing.

## What's new in this version
- **Redesign**: gradient color grading, glow effects, scroll-triggered reveal animations, hero entrance animation, hover micro-interactions on every card, chip, and button.
- **Contact buttons**: WhatsApp, Instagram, and LinkedIn buttons on the Contact section, plus a floating WhatsApp button — all editable from **Admin → Profile** or **Admin → Management**.
- **Social preview image**: `/public/images/social-preview.png` is wired up via Open Graph tags, so your link shows a proper preview card when shared on WhatsApp, LinkedIn, etc.
- **Sitemap & robots.txt**: live at `/sitemap.xml` and `/robots.txt` for search engines.
- **Built-in analytics**: every page load pings `/api/track`; view total visits, today's visits, and top page in **Admin → Management**. No third-party account needed.
- **Launch checklist**: **Admin → Management** has a checklist mirroring pre-launch essentials (social preview, subdomain, onboarding, analytics, sitemap) so you can track what's done.

### Hosting on a subdomain (do this on Render, not in code)
1. Buy/own a domain, or use a subdomain of one you already have (e.g. `suraj.yourdomain.com`).
2. In Render: your service → **Settings → Custom Domain → Add Custom Domain**.
3. Enter your subdomain. Render gives you a CNAME target.
4. In your domain registrar's DNS settings, add a **CNAME record**: `suraj` → the Render target Render shows you.
5. Wait for DNS to propagate (a few minutes to a few hours), then Render auto-issues an SSL certificate.

## Notes
- Content edits (profile, experience, projects, skills, education, certifications) are saved to `data/data.json` on the server. On Render's **free tier**, the filesystem is not persistent across deploys/restarts — edits can be lost if the service restarts. If you plan to edit content often after going live, consider upgrading to a paid instance with a persistent disk, or ask me to switch storage to a database (e.g., a free MongoDB Atlas cluster) so nothing is ever lost.
- The contact form saves every message to `data/messages.json` (visible in the admin **Messages** tab) even if email sending fails, so you never lose an inquiry.

## Local admin login

For local development, create `.env` in the project root with:

```env
PORT=10000
NODE_ENV=development
SESSION_SECRET=change-this-to-a-long-random-string
ADMIN_USER=choose-a-username
ADMIN_PASS=choose-a-strong-password
```

Then restart the Node server after changing `.env`.

## Contact social buttons

The Contact section includes animated WhatsApp, Instagram, and LinkedIn buttons. Update the values under `profile.social` in `data/data.json` if your social handles change.
