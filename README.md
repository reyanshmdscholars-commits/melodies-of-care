# 🎵 Melodies of Care

Intergenerational Music Outreach Platform — Next.js 14, Supabase, Formspree.

---

## ▶️ Starting the Website

### macOS — double-click `START.command`
If macOS blocks it, right-click → Open → Open anyway.

### Windows — double-click `start.bat`

### Manual (any platform)
```bash
npm install      # first time only
npm run dev
```
Then open **http://localhost:3000** in your browser.

---

## ⚙️ First-time Supabase Setup

1. Go to **https://supabase.com** → sign in → open project `yeghjkhcsstpbkmrblgu`
2. Click **SQL Editor** in the left sidebar
3. Paste the contents of **`supabase-schema.sql`** and click **Run**
4. This creates the `events` and `volunteers` tables + sample seed data

---

## 🔐 Admin Dashboard

- Find the **invisible 4px dot** at the very bottom-right of the footer
- Click it → enter password: `melodiesofcare2025`
- You'll be redirected to `/admin` with full CRUD access

---

## 📄 Pages

| Route | Description |
|-------|-------------|
| `/` | Hero, stat counters, volunteer sign-up form |
| `/about` | Mission, values, timeline |
| `/team` | Team profiles grid |
| `/gallery` | Masonry gallery with lightbox + category filters |
| `/events` | Live calendar pulling from Supabase |
| `/admin` | Password-protected CRUD dashboard |

---

## 🔑 Credentials (already hard-coded)

| Service | Value |
|---------|-------|
| Supabase URL | `https://yeghjkhcsstpbkmrblgu.supabase.co` |
| Formspree | `xgonzkoe` |
| Admin Password | `melodiesofcare2025` |
