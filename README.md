# Macropage Connect — Frontend

WhatsApp Business API SaaS platform · React + TypeScript + Vite + Tailwind

## Quick start

```bash
npm install
cp .env.example .env.local   # edit with your backend URL
npm run dev                  # http://localhost:3000
```

## Tech stack
React 18 · TypeScript · Vite 5 · Tailwind CSS · React Router v6
TanStack Query v5 · Axios · Zustand · Socket.io · Recharts
React Hook Form · Zod · Lucide React · Razorpay

## Key files
- `CLAUDE.md` — full project memory for Claude Code (read this first)
- `src/lib/axios.ts` — pre-configured API client (JWT auto-attach)
- `src/lib/socket.ts` — Socket.io singleton
- `src/store/authStore.ts` — auth state (persisted)
- `src/types/index.ts` — all shared TypeScript types
- `src/index.css` — global utility classes (.btn-primary, .card, .input etc.)

## Path alias
Use `@/` for `src/` in all imports.

## Build
```bash
npm run build    # production build
npm run lint     # ESLint check
npm run format   # Prettier format
```
