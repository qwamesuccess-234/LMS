# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LMS (Learning Management System) — a React Native / Expo mobile app using file-based routing (Expo Router). The project targets iOS, Android, and web.

## Commands

- **Start dev server:** `npx expo start`
- **iOS:** `npx expo start --ios`
- **Android:** `npx expo start --android`
- **Web:** `npx expo start --web`
- **Lint:** `npx expo lint`
- **Install deps:** `npm install`

## Architecture

- **Expo SDK 55** with React Native 0.83, React 19, TypeScript 5.9
- **File-based routing** via `expo-router` — routes live in `src/app/`
- **`src/app/` is screens and layouts only** — never put contexts, hooks, helpers, or other non-route files in the `app/` directory
- **Providers/contexts** go in `src/providers/`
- **Data hooks** go in `src/services/`
- **Utilities and shared logic** go in `src/lib/`
- **Path aliases:** `@/*` maps to `./src/*`, `@/assets/*` maps to `./assets/*`
- **React Compiler** is enabled (`experiments.reactCompiler: true` in app.json)
- **Typed routes** are enabled (`experiments.typedRoutes: true`)
- Entry point: `expo-router/entry` (configured in package.json `main`)
- The `example/` directory contains the original Expo template code for reference — it is not part of the running app

## Styling — Tailwind CSS v4 + NativeWind v5

- Uses `react-native-css` with `useCssElement` wrappers — **do not use raw RN components with `className`**
- Import styled components from `@/tw` (View, Text, ScrollView, Pressable, TextInput, Link, TouchableHighlight, AnimatedScrollView) and `@/tw/image` (Image)
- `@/tw/animated` exports `Animated.View` wrapped for CSS support
- Global CSS lives in `src/global.css` (imported in `_layout.tsx`); theme customization uses `@theme` blocks in CSS, not a JS config file
- Platform-specific styles use `@media ios` / `@media android` in CSS
- `useCSSVariable` hook from `@/tw` reads CSS variables in JS (returns `var(--name)` on web, resolved value on native)
- `tailwind-merge` and `clsx` are available for conditional/merged class names
- Metro config (`metro.config.js`) wraps with `withNativewind`; PostCSS config uses `@tailwindcss/postcss`

## Authentication — Clerk

- `@clerk/expo` handles all authentication (sign-in, sign-up, session management)
- `ClerkProvider` wraps the app in `src/app/_layout.tsx` with `tokenCache` for secure token storage
- Use `useAuth()` for auth state, `useUser()` for user info
- Clerk session tokens are automatically forwarded to Supabase (see below)

## Backend — Supabase

- Local Supabase dev environment (`npx supabase start` / `npx supabase stop`)
- **Client:** `useSupabase()` hook from `@/lib/supabase` — returns a typed Supabase client that attaches the Clerk JWT automatically
- **Types:** `src/lib/database.types.ts` — auto-generated, do not edit manually. Regenerate with `npx supabase gen types typescript --local > src/lib/database.types.ts`
- **Migrations:** `supabase/migrations/` — create new ones with `npx supabase migration new <name>`
- **Seed data:** `supabase/seed.sql` — applied on `npx supabase db reset`
- **RLS:** All tables must have Row Level Security enabled. Policies use `(auth.jwt() ->> 'sub')` to match the Clerk user ID
- Prefer `.throwOnError()` on Supabase queries/mutations so errors propagate to TanStack Query instead of being silently swallowed

## Data Fetching — TanStack Query

- `QueryClientProvider` wraps the app inside `ClerkProvider` in `src/app/_layout.tsx`
- **All remote data fetching and mutations must go through TanStack Query** (`useQuery`, `useMutation`)
- **Service hooks pattern:** Data logic lives in `src/services/<entity>.ts`, not in screen components
  - Each service file exports a query key factory (e.g. `coursesKeys`), query hooks (e.g. `useCourses`), and mutation hooks (e.g. `useDeleteCourse`)
  - Screen components import and use these hooks — they should contain no direct Supabase calls
- Mutations should invalidate relevant query keys on success

## Key Dependencies

- `react-native-reanimated` + `react-native-gesture-handler` for animations/gestures
- `react-native-screens` + `react-native-safe-area-context` for navigation
- `expo-image` for optimized image loading
- `expo-glass-effect` for blur/glass UI effects
- `@clerk/expo` for authentication
- `@supabase/supabase-js` for backend/database
- `@tanstack/react-query` for data fetching and cache management