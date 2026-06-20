# Department Connect

A university department management mobile app for Nigerian higher-education departments. Three-tier role system (Student < Admin < Developer) with class scheduling, QR attendance, contributions/payments, categorised notifications, approval workflows, and analytics.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (SDK 54) + Expo Router v6, React Native 0.81
- Auth: custom demo auth with AsyncStorage (Supabase integration pending)
- DB: PostgreSQL + Drizzle ORM (API server)
- Payments: Paystack (planned — demo mode currently)
- Notifications: 4 categories (Lectures, Big Events, Small Events, Extras)

## Where things live

- `artifacts/department-connect/` — Expo mobile app
  - `app/` — Expo Router screens (role-based groups)
  - `app/(student)/` — 5 student screens: home, schedule, attendance, notifications, profile
  - `app/(admin)/` — 5 admin screens: dashboard, students, approvals, events, analytics
  - `app/(developer)/` — 4 developer screens: dashboard, users, logs, config
  - `context/AuthContext.tsx` — auth state + demo users + AsyncStorage
  - `context/DataContext.tsx` — demo data (students, classes, notifications, etc.)
  - `constants/colors.ts` — navy blue university theme (light + dark)

## Architecture decisions

- Role-based Expo Router groups `(student)`, `(admin)`, `(developer)` — each has its own tab bar layout. `app/index.tsx` redirects to the correct group on login.
- Login accepts **Matric Number OR Surname** (case-insensitive), plus password. No email auth.
- All demo passwords are "password" for simplicity; real Supabase auth to be wired in later.
- QR attendance is simulated (tap-to-mark) in demo mode — expo-camera not installed. Will wire in barcode scanning when user provides Supabase keys.
- Paystack integration pending user API keys.

## Product

**Student view:** Dashboard with greeting + stats, today's classes with live QR attendance, animated attendance bars per course, categorised notification inbox (All/Lectures/Big Events/Small Events/Extras), full weekly schedule, profile editor with birthday privacy toggle.

**Admin view:** Dashboard stats, pending approvals queue (approve/reject with reason), searchable student list with level/status filters, event creation modal, attendance + contribution analytics.

**Developer view:** System health dashboard, all-user list with role filter, audit log stream, feature-flag config panel.

## Demo Credentials (all passwords: "password")

| Role | Identifier |
|------|-----------|
| Student | Adeyemi (or ART2500001) |
| Admin | Ibrahim |
| Developer | Martins |

## User preferences

- User is: Martins (the developer persona in the app)
- Auth by Matric Number or Surname — NOT email
- Demo data first; Supabase API keys to be provided later
- Paystack for payments (keys TBD)

## Gotchas

- Do NOT use expo-camera (not in package.json). QR scanning is simulated in demo mode.
- The `(tabs)` group still exists as dead code (redirect files). Do not delete — overwrite with redirect logic if needed.
- When adding new screens to a role group, add them to both the NativeTabs and ClassicTabs sections in that group's `_layout.tsx`.
- Navigate to role groups with full path: `router.replace('/(student)/')` etc.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
