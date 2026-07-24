# Department Connect

A React Native / Expo mobile app for academic department management. Features role-based screens for Students, Admins (Teachers/Course Reps), and Developers — with QR-based attendance tracking, class/event management, and payment tracking.

## Stack

- **Framework:** Expo (v54) + Expo Router (v6), React Native 0.81.5
- **Language:** TypeScript
- **UI:** Reanimated, Lottie animations, Expo Blur, Lucide icons
- **State:** TanStack React Query v5 + React Context API
- **Validation:** Zod
- **Storage:** AsyncStorage (local, demo mode)
- **Backend (planned):** Supabase — schemas in `artifacts/department-connect/supabase/` and `data/schema.sql`

## Running the app

The workspace workflow (`artifacts/department-connect: expo`) starts the Expo dev server automatically.

```
pnpm install          # install all workspace dependencies
pnpm --filter @workspace/department-connect run dev
```

The app currently runs in **demo mode** using seed data from `artifacts/department-connect/data/seedData.ts` — no Supabase credentials required.

## Project structure

```
artifacts/department-connect/
  app/              # Expo Router screens (role-based groups: admin, student, developer)
  components/       # Shared UI components
  context/          # React Context providers (AuthContext, etc.)
  data/             # Seed data and schema.sql
  supabase/         # Supabase migration files
  assets/           # Images and Lottie animations
```

## User preferences
