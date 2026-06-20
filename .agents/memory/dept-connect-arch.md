---
name: Department Connect architecture
description: Role-based Expo Router app — Student / Admin / Developer — full MVP, all mutations wired, in-memory DataContext, no backend.
---

## Role-based routing

Three Expo Router groups: `(student)`, `(admin)`, `(developer)`. Each has its own tab bar (`_layout.tsx`) using NativeTabs + ClassicTabs pattern. `app/index.tsx` redirects based on `user.role` from AuthContext. Navigate with full group path: `router.replace('/(student)/')`.

The `app/(tabs)/` directory still exists as thin redirect files (avoid deleting — overwrite if needed).

**Why:** Expo Router groups allow separate tab bar layouts per role while sharing the same URL space.

**How to apply:** When adding a new role, create `app/(newrole)/_layout.tsx` with NativeTabs+ClassicTabs, register `(newrole)` in root `app/_layout.tsx` Stack, and add a redirect branch in `app/index.tsx`.

## Auth model

Login accepts: Matric Number OR Surname OR StaffId (case-insensitive), plus password. No email auth. Demo password for all accounts: "password". Pending/Rejected students cannot log in (blocked with error message).

## DataContext mutations (all implemented as of MVP build)
- `createEvent(event)` — adds to events[]
- `addStudent(student)` — adds with Pending status to students[]
- `createClass(cls)` — adds to classes[]
- `addAnnouncement(ann)` — adds to announcements[] + fires in-app notification
- `payContribution(id)` — marks paid + fires success notification

## Student tabs (in order)
Home, Schedule, Attendance, **Payments**, Inbox (Notifications), Profile

## Payments screen
Full Paystack-style demo card modal: card number auto-formats, shows processing animation, success animation via react-native Animated API. Navigated to via `router.push("/(student)/payments")` from Pay Now button on Home.

## Admin features
- Students screen: Add Student button → modal form with matric regex (ART + 7 digits), phone regex (11 digits, 07x/08x/09x), level picker. Creates with Pending status.
- Events screen: Two tabs — Events / Classes. Create button opens modal with Event or Class Session mode toggle. Both save to DataContext state.
- Dashboard: "Announce" quick action → modal to post announcement with category + audience targeting. Saves to announcements[] + triggers notification.

## Animations
- react-native Animated API used throughout (NOT lottie-react-native — not needed)
- `useNativeDriver` warning on web is expected/harmless — falls back to JS
- Login: logo scale-in + card slide-up on mount. Demo chips auto-fill on tap.
- Payments: processing dots, success circle + checkmark spring animation

## Port and CORS
- Workflow: `PORT=8080`
- artifact.toml (department-connect): `localPort=8080`, `router="expo-domain"`
- artifact.toml (api-server): `localPort=3001` — was 8080, caused conflict; fixed via verifyAndReplaceArtifactToml
- app.config.js: `extra.router.origin = https://${REPLIT_DEV_DOMAIN}:8080`
- **When all workflows start simultaneously they all try port 8080 — if api-server grabs it first, Expo fails. Fix: restart api-server first (picks up new port from TOML), then restart Department Connect.**

## QR attendance
expo-camera is NOT installed. Tap-to-mark simulated. Real scanning needs expo-camera + Supabase.

## Color theme
Primary: #1B4FD8, Gradient: #0D2B7E→#1B4FD8, Accent: #F59E0B. Use `useColors()` hook everywhere.
