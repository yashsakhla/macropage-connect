# Macropage Connect — Claude Code Project Memory

## What this project is
A multi-tenant WhatsApp Business API SaaS platform called **Macropage Connect**.
Businesses sign up, connect their WhatsApp number via Meta Embedded Signup,
and use our dashboard for live chat, campaigns, templates, contacts and analytics.
We use Meta Cloud API directly — no BSP (Business Solution Provider).

---

## Tech stack

| Layer         | Technology                                                    |
|--------------|---------------------------------------------------------------|
| Framework    | React 18 + TypeScript (strict mode)                           |
| Build tool   | Vite 5                                                        |
| Styling      | Tailwind CSS v3 + custom utility classes in `src/index.css`   |
| Routing      | React Router v6 (lazy loaded routes in `src/App.tsx`)         |
| Data fetching| TanStack React Query v5                                       |
| HTTP client  | Axios — singleton at `src/lib/axios.ts` (JWT auto-attach)     |
| State        | Zustand — `authStore.ts` (user/token) + `uiStore.ts` (sidebar/theme) |
| Real-time    | Socket.io client — singleton at `src/lib/socket.ts`           |
| Charts       | Recharts                                                      |
| Forms        | React Hook Form + Zod                                         |
| Toasts       | React Hot Toast                                               |
| Icons        | Lucide React                                                  |
| Payments     | Razorpay (Indian billing)                                     |
| Dates        | date-fns                                                      |

---

## Folder structure

```
macropage-connect/
├── CLAUDE.md                  ← you are here
├── src/
│   ├── App.tsx                ← all routes defined here
│   ├── main.tsx               ← app entry, QueryClient, Toaster
│   ├── index.css              ← Tailwind + all global utility classes
│   ├── types/
│   │   └── index.ts           ← ALL shared TypeScript interfaces
│   ├── lib/
│   │   ├── axios.ts           ← configured axios instance
│   │   ├── socket.ts          ← Socket.io singleton
│   │   └── utils.ts           ← cn(), formatIndian(), getInitials(), etc.
│   ├── store/
│   │   ├── authStore.ts       ← user, token, isAuthenticated (persisted)
│   │   └── uiStore.ts         ← sidebarOpen, theme (persisted)
│   ├── hooks/
│   │   └── useAuth.ts         ← useLogin, useRegister, useLogout
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx      ← sidebar + navbar + <Outlet />
│   │   │   ├── AuthLayout.tsx      ← centered card layout for auth pages
│   │   │   ├── Sidebar.tsx         ← collapsible sidebar nav
│   │   │   ├── Navbar.tsx          ← top bar, theme toggle, logout
│   │   │   └── ProtectedRoute.tsx  ← redirects if not authenticated
│   │   ├── shared/
│   │   │   └── PageLoader.tsx
│   │   └── ui/                ← reusable low-level components (to be built)
│   └── pages/
│       ├── auth/              Login, Register, ForgotPassword, ResetPassword
│       ├── dashboard/         Dashboard
│       ├── inbox/             Inbox
│       ├── campaigns/         Campaigns, Templates
│       ├── contacts/          Contacts
│       └── settings/          Settings
```

---

## Path alias

Always use `@/` instead of relative `../` paths. `@/` maps to `src/`.

```ts
// correct
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/axios'
import { cn } from '@/lib/utils'

// never do this
import { useAuthStore } from '../../store/authStore'
```

---

## CSS conventions

Use existing utility classes from `src/index.css` — do NOT recreate them inline with Tailwind:

```
Buttons:    .btn-primary  .btn-secondary  .btn-outline  .btn-ghost  .btn-danger
Inputs:     .input
Cards:      .card
Badges:     .badge  .badge-green  .badge-red  .badge-blue  .badge-yellow  .badge-gray
Layout:     .page-title  .page-header
Stats:      .stat-card  .stat-value  .stat-label
Tables:     .table-wrapper  table.data-table
Nav:        .nav-item  .nav-item.active
Typography: .text-2xs (0.625rem)
```

Brand colors are in `tailwind.config.ts` under `brand.50` through `brand.600`.
brand-300 = #1D9E75 (primary green action color).

---

## API conventions

- All HTTP calls go through `src/lib/axios.ts` — never use raw `fetch` or `axios`
- GET requests → `useQuery` from React Query
- POST / PUT / PATCH / DELETE → `useMutation` from React Query
- API base URL comes from `VITE_API_BASE_URL` env variable
- Backend returns `{ success: boolean, data: T, message?: string }`
- Use the `ApiResponse<T>` and `PaginatedResponse<T>` types from `src/types/index.ts`

```ts
// example query
const { data, isLoading } = useQuery({
  queryKey: ['contacts'],
  queryFn: () => api.get('/contacts').then(r => r.data.data),
})

// example mutation
const create = useMutation({
  mutationFn: (payload: CreateCampaignPayload) =>
    api.post('/campaigns', payload).then(r => r.data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    toast.success('Campaign created')
  },
})
```

---

## Real-time (Socket.io)

Connect on login, disconnect on logout:

```ts
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket'

// Listen to events in hooks
const socket = getSocket()
socket.on('message:new', (msg: Message) => { ... })

// Clean up in useEffect return
return () => { socket.off('message:new') }
```

Key socket events:
- `message:new` — new inbound message arrives
- `conversation:updated` — status/assignment changed
- `agent:typing` — agent typing indicator
- `message:status` — delivery status update

---

## TypeScript rules

- Strict mode enabled — no implicit `any`
- All shared types live in `src/types/index.ts`
- One component per file
- Hook files prefixed with `use` (e.g. `useConversations.ts`)
- No direct `localStorage` access — use Zustand stores only
- Export types with `export type`, not `export`

---

## WhatsApp / Meta specifics

- We use Meta **Cloud API** directly (no BSP)
- Each client (tenant) has their own **WABA** (WhatsApp Business Account)
- Meta charges per 24-hour conversation window (not per message)
- Templates require Meta approval before they can be sent
- Template categories: `MARKETING`, `UTILITY`, `AUTHENTICATION`
- Quality ratings: `GREEN` (good) → `YELLOW` (warning) → `RED` (restricted)
- Messaging tiers: TIER_1K → TIER_10K → TIER_100K → TIER_UNLIMITED
- **Embedded Signup flow** connects a client's WABA directly inside our portal

---

## Infrastructure

| Service              | Provider                        | Purpose                          |
|--------------------|---------------------------------|----------------------------------|
| Frontend hosting    | Vercel                          | React app, CDN                   |
| Backend + workers   | DigitalOcean Droplet (4vCPU/8GB)| Node.js API + BullMQ             |
| Primary database    | DO Managed PostgreSQL           | Tenants, contacts, campaigns     |
| Message history     | DO Managed MongoDB              | Conversations, messages          |
| Cache + queue       | DO Managed Redis                | BullMQ + sessions + Socket.io    |
| Media storage       | DO Spaces (S3-compatible)       | Images, PDFs, audio from chats   |
| DNS + SSL + DDoS    | Cloudflare (free tier)          | Sits in front of everything      |

---

## Environment variables

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=Macropage Connect
VITE_RAZORPAY_KEY_ID=rzp_test_REPLACE_ME
```

---

## Phase 1 — Frontend task tracker

Mark tasks complete as you build them. All 60 tasks across 7 phases.

### Phase 1 · Project setup & tooling (Week 1)
- [x] Scaffold React + TypeScript + Vite project
- [x] Install and configure Tailwind CSS
- [x] Set up shadcn/ui component library
- [x] Configure ESLint + Prettier
- [x] Set up React Router v6
- [x] Configure environment variables (.env.local, .env.production)
- [x] Set up Axios + React Query (QueryClient in main.tsx)
- [x] Create folder structure (pages/, components/, hooks/, store/, lib/, types/)

### Phase 2 · Auth & layout shell (Week 1–2)
- [x] Login page — email + password + remember me + Zod validation
- [x] Register page — name, company, email, password, terms
- [x] Forgot password page — email input + success state
- [x] Reset password page — token from URL + new password
- [x] Auth context + Zustand store (authStore.ts)
- [x] Protected route wrapper (ProtectedRoute.tsx)
- [x] Main sidebar layout (MainLayout.tsx + Sidebar.tsx)
- [x] Sidebar nav items + active state + collapse
- [x] Top navbar (Navbar.tsx) — theme toggle, logout, WABA selector

### Phase 3 · Dashboard & analytics (Week 2–3)
- [x] Overview dashboard page — stat cards + health banner + quick links
- [x] Metric summary cards (StatCard component with trend arrows)
- [x] Messages trend line chart (Recharts LineChart, last 7 days)
- [ ] Campaign performance bar chart — top 5 by delivery rate
- [x] Account health banner — quality rating indicator
- [ ] Date range picker — last 7d / 30d / 90d / custom
- [ ] Analytics page — deep-dive delivery funnel + template stats
- [ ] Export to CSV button

### Phase 4 · Live chat inbox (Week 3–5)
- [ ] Inbox layout — three-panel view (contact list | thread | profile)
- [ ] Conversation list panel — search, filter by status/agent/label
- [ ] Message thread view — text, image, PDF, audio, video bubbles
- [ ] Message input bar — text, emoji, file attach, send
- [ ] Real-time updates via Socket.io (new messages push)
- [ ] Quick replies / canned responses (slash-command picker)
- [ ] Assign conversation to agent (dropdown + auto-assign)
- [ ] Conversation labels / tags (colour-coded pills)
- [ ] Contact profile sidebar (name, number, tags, history)
- [ ] Internal notes panel (private, not sent to customer)
- [ ] Bot / human handoff toggle
- [ ] Conversation filters & search

### Phase 5 · Campaigns & templates (Week 5–7)
- [ ] Campaigns list page — table with status, delivery %, schedule time
- [ ] Create campaign wizard — 3 steps: template → contacts → schedule
- [ ] Contact CSV uploader — drag-drop, column mapping, preview
- [ ] Campaign detail page — delivery funnel + contact-level status
- [ ] Template manager page — list with status badges + category filter
- [ ] Create template form — header / body / footer / buttons builder
- [ ] Template live preview — phone preview panel while typing
- [ ] Template approval status tracker — pending / approved / rejected
- [ ] Schedule picker — date + time + timezone
- [ ] A/B test campaign setup — split audience, two templates

### Phase 6 · Contacts & team (Week 7–8)
- [ ] Contacts list page — searchable sortable table + tag filter
- [ ] Contact detail page — fields, tags, conversation history
- [ ] Add / edit contact form
- [ ] Bulk CSV import with column mapping
- [ ] Opt-out management (unsubscribe handling)
- [ ] Team members page — list agents, invite, deactivate
- [ ] Invite team member modal — email + role
- [ ] Role-based UI guards (admin / manager / agent)

### Phase 7 · Settings, billing & onboarding (Week 8–10)
- [ ] Settings layout — left nav: Profile, WABA, Team, Billing, Notifications, API
- [ ] Business profile settings — logo, display name, category, website
- [ ] Business hours configuration — per-day open/close + timezone
- [ ] Meta Embedded Signup flow — connect WABA button + OAuth popup
- [ ] Phone number management — add, display name, delete
- [ ] Billing & subscription page — plan display + usage meter
- [ ] Razorpay checkout integration — subscription plans + payment modal
- [ ] Invoice download — list + PDF download
- [ ] API keys page — generate / revoke + copy
- [ ] Notification preferences — toggles per event type
- [ ] Onboarding checklist widget — step-by-step for new clients

---

## Useful commands

```bash
# Start dev server
npm run dev

# Type check
npx tsc --noEmit

# Format all files
npm run format

# Lint
npm run lint

# Build for production
npm run build
```

---

## Common patterns

### Loading state for a page
```tsx
if (isLoading) return <PageLoader />
if (error) return <div className="text-red-500">Failed to load</div>
```

### Empty state
```tsx
{items.length === 0 && (
  <div className="text-center py-16 text-gray-400">
    <Icon size={32} className="mx-auto mb-2 opacity-40" />
    <p className="text-sm">No items yet</p>
  </div>
)}
```

### Role guard
```tsx
import { useAuthStore } from '@/store/authStore'
const { user } = useAuthStore()
{user?.role === 'admin' && <AdminOnlyButton />}
```

---

## Next tasks to build

1. `src/pages/inbox/Inbox.tsx` — three-panel layout with Socket.io
2. `src/pages/campaigns/Campaigns.tsx` — list + create wizard
3. `src/pages/campaigns/Templates.tsx` — list + create form + live preview
4. `src/pages/contacts/Contacts.tsx` — table + CSV import
5. `src/pages/settings/Settings.tsx` — settings shell + WABA connect
