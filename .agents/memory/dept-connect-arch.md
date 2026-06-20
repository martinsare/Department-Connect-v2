---
name: Department Connect architecture
description: Key non-obvious decisions for the Department Connect Expo app — routing, auth, and feature flags
---

## Role-based routing

Three Expo Router groups: `(student)`, `(admin)`, `(developer)`. Each has its own tab bar (`_layout.tsx`) using NativeTabs + ClassicTabs pattern. `app/index.tsx` redirects based on `user.role` from AuthContext. Navigate with full group path: `router.replace('/(student)/')`.

The `app/(tabs)/` directory still exists as thin redirect files (avoid deleting — overwrite if needed).

**Why:** Expo Router groups allow separate tab bar layouts per role while sharing the same URL space. Each group IS reachable via explicit navigation even though they share the "/" URL.

**How to apply:** When adding a new role, create `app/(newrole)/_layout.tsx` with NativeTabs+ClassicTabs, register `(newrole)` in root `app/_layout.tsx` Stack, and add a redirect branch in `app/index.tsx`.

## Auth model

Login accepts: Matric Number OR Surname OR StaffId (case-insensitive), plus password. No email auth. Demo password for all accounts: "password". Pending/Rejected students cannot log in (blocked with error message).

**Why:** University department context — matric numbers and surnames are the identifiers students know.

## QR attendance

expo-camera is NOT installed. QR scanning is simulated via a tap-to-mark button. Real scanning can be added by installing expo-camera when the user provides Supabase keys.

## Paystack

Payment integration is planned (Paystack, not Stripe per user request). Currently demo-only with a "Pay Now" button that does nothing. Wire in when user provides Paystack public/secret keys.

## Data

All data lives in `context/DataContext.tsx` as in-memory arrays. Supabase integration is deferred until user provides API keys. AuthContext uses AsyncStorage for persistence across app restarts.

## Color theme

Primary: #1B4FD8 (navy blue university brand). Gradient: #0D2B7E → #1B4FD8. Accent: #F59E0B (amber/gold). Full light + dark mode in `constants/colors.ts`. Use `useColors()` hook everywhere.
