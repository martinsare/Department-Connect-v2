# Department Connect API

Express + TypeScript backend for the Department Connect mobile app. Hosted on Vercel, backed by Supabase.

## Stack

- **Runtime:** Node.js 22
- **Framework:** Express
- **Database / Auth:** Supabase (PostgreSQL)
- **Auth tokens:** JWT
- **Deployment:** Vercel (serverless)

## Local development

```bash
npm install
npm run dev        # tsx watch — hot reload on :3001
```

## Environment variables

Set these in Vercel → Project → Settings → Environment Variables:

| Key | Description |
|-----|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role secret key |
| `JWT_SECRET` | Secret used to sign JWT tokens |

## Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard — it auto-deploys on every push to `main`.

## API routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | Public | Login with matric/surname/staffId + password |
| POST | `/api/auth/register` | Public | Submit student or admin application |
| GET | `/api/auth/me` | Bearer | Get own profile |
| PATCH | `/api/auth/me` | Bearer | Update own profile / change password |
| GET | `/api/profiles` | Bearer | List profiles (admin/dev) or own (student) |
| PATCH | `/api/profiles/:id` | Bearer | Approve / reject / update a profile |
| GET | `/api/profiles/:id/attendance` | Bearer | Attendance summary for a student |
| GET | `/api/classes` | Bearer | List class sessions |
| POST | `/api/classes` | Admin/Dev | Create a class session |
| PATCH | `/api/classes/:id` | Admin/Dev | Update class (toggle attendance, etc.) |
| POST | `/api/classes/:id/attendance` | Student | Mark attendance via QR |
| GET | `/api/classes/:id/attendees` | Admin/Dev | List attendees for a class |
| GET | `/api/contributions` | Bearer | List contributions |
| POST | `/api/contributions` | Admin/Dev | Create a contribution |
| POST | `/api/contributions/:id/submit-payment` | Student | Submit payment claim |
| PATCH | `/api/contributions/:id/verify` | Admin/Dev | Confirm or reject payment |
| GET | `/api/notifications` | Bearer | Get notifications for the logged-in user |
| PATCH | `/api/notifications/:id/read` | Bearer | Mark a notification read |
| GET | `/api/events` | Bearer | List events |
| POST | `/api/events` | Admin/Dev | Create an event |
| GET | `/api/announcements` | Bearer | List announcements |
| POST | `/api/announcements` | Admin/Dev | Post an announcement |
| GET | `/api/audit-logs` | Developer | View audit log (last 200 entries) |
| GET | `/health` | Public | Health check |
