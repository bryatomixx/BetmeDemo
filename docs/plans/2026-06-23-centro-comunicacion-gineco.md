# Centro de Comunicación — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a realistic demo of an omnichannel internal communication command center for Hospital Centro Ginecológico (WhatsApp + Instagram + Facebook + internal department chat in one ordered inbox).

**Architecture:** Next.js 16 App Router single-page-feeling command center. A mock data layer (in-memory) sits behind a `CommsProvider` interface (FAKE now, REAL later). A React Context + reducer store wraps the provider; a client-side live engine injects simulated incoming messages. UI modules (inbox, internal chat, social, dashboard) are independent routes consuming the shared store.

**Tech Stack:** Next.js 16.2.1, React 19.2.4, TypeScript, Tailwind v4 (`@tailwindcss/postcss`), lucide-react, clsx, tailwind-merge, framer-motion, vitest.

## Global Constraints

- Next.js 16.2.1, React 19.2.4 — match workspace demos exactly (verbatim versions).
- This Next 16 has breaking changes vs known Next. READ `node_modules/next/dist/docs/` before writing any Next-specific code (App Router conventions, config, metadata).
- Brand colors verbatim: primary blue `#0067f8`, accent green `#4ac12f`, base white `#ffffff`. Tagline "Somos parte de tu vida".
- No em-dashes anywhere (UI copy, code, commits). Use comma/period/colon/parens.
- Do NOT reuse the hospital's original logo SVG (copyright). Use an own wordmark "Centro Ginecológico" in brand blue.
- Spanish (salvadoreño) copy throughout the UI.
- No phone/voice calls. Messaging channels only.
- Dev server on port 3000, launched on Windows via PowerShell `Start-Process` (npm background shim exits 127 on Win).
- All data is mock/in-memory. No real network, no real Meta API.

---

## File Structure

```
centro-comunicacion-gineco/
  package.json, tsconfig.json, next.config.ts, postcss.config.mjs, .gitignore
  app/
    layout.tsx              # root layout, fonts, AppProviders, sidebar shell
    globals.css             # tailwind + brand tokens
    page.tsx                # Bandeja unificada (inbox) — the core
    interno/page.tsx        # Chat interno
    redes/page.tsx          # Publicaciones redes sociales
    dashboard/page.tsx      # Métricas
  components/
    shell/Sidebar.tsx, RoleSwitcher.tsx, Brand.tsx
    inbox/ConversationList.tsx, ConversationListItem.tsx, InboxFilters.tsx,
          Thread.tsx, MessageBubble.tsx, Composer.tsx, ContextPanel.tsx
    internal/ChannelList.tsx, InternalThread.tsx
    social/PostList.tsx, PostComposer.tsx
    dashboard/MetricCard.tsx, DeptBreakdown.tsx
    ui/ChannelBadge.tsx, StatusPill.tsx, Avatar.tsx, EmptyState.tsx
  lib/
    data/types.ts, seed.ts, provider.ts, live-engine.ts
    store.tsx               # Context + reducer
    roles.ts
    cn.ts                   # clsx+tailwind-merge helper
  lib/data/__tests__/provider.test.ts, store.test.ts
```

---

### Task 1: Scaffold Next 16 project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `next-env.d.ts`
- Create: `app/layout.tsx`, `app/globals.css`, `app/page.tsx` (placeholder)
- Create: `lib/cn.ts`

**Interfaces:**
- Produces: `cn(...classes)` helper from `lib/cn.ts`.

- [ ] **Step 1:** Write `package.json` matching workspace versions:

```json
{
  "name": "centro-comunicacion-gineco",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "framer-motion": "^12.38.0",
    "lucide-react": "^0.469.0",
    "next": "16.2.1",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "tailwind-merge": "^3.6.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.1",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^4.1.9"
  }
}
```

- [ ] **Step 2:** `npm install` in the project dir.
- [ ] **Step 3:** READ `node_modules/next/dist/docs/` (at minimum the App Router, config, and metadata guides) before writing `app/` or `next.config.ts`. Note any breaking changes that affect layout/page/config syntax.
- [ ] **Step 4:** Write `tsconfig.json`, `postcss.config.mjs` (`@tailwindcss/postcss`), `next.config.ts`, `.gitignore` (node_modules, .next), copying conventions from `../negocio-capital-crm`.
- [ ] **Step 5:** Write `lib/cn.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 6:** Write `app/globals.css` with Tailwind v4 import and brand tokens:

```css
@import "tailwindcss";
:root {
  --brand-blue: #0067f8;
  --brand-green: #4ac12f;
}
@theme inline {
  --color-brand: var(--brand-blue);
  --color-accent: var(--brand-green);
}
```

- [ ] **Step 7:** Write minimal `app/layout.tsx` (metadata title "Centro de Comunicación — Centro Ginecológico", lang="es") and `app/page.tsx` placeholder ("Bandeja").
- [ ] **Step 8:** Launch dev server via PowerShell `Start-Process` on port 3000, confirm it compiles and renders. Stop it.
- [ ] **Step 9:** Commit `chore: scaffold Next 16 project with brand tokens`.

---

### Task 2: Data layer — types and seed

**Files:**
- Create: `lib/data/types.ts`, `lib/data/seed.ts`

**Interfaces:**
- Produces (consumed by every later task):

```ts
export type Channel = "whatsapp" | "instagram" | "facebook" | "internal";
export type ConversationStatus = "nuevo" | "en_progreso" | "resuelto";
export type DepartmentId =
  | "ginecologia" | "obstetricia" | "pediatria"
  | "reproduccion" | "laboratorio" | "imagenes" | "recepcion";
export type RoleId = "recepcion" | "medico" | "jefe" | "admin";

export interface Department { id: DepartmentId; nombre: string; color: string; }
export interface StaffUser { id: string; nombre: string; rol: RoleId; departamento: DepartmentId; iniciales: string; }
export interface Contact { id: string; nombre: string; telefono?: string; handle?: string; canal: Channel; notas?: string; }
export interface Message {
  id: string; conversationId: string; autor: "paciente" | "staff";
  staffId?: string; texto: string; ts: string; // ISO
}
export interface Conversation {
  id: string; canal: Channel; contactId: string;
  departamento: DepartmentId; estado: ConversationStatus;
  asignadoA?: string; // StaffUser.id
  noLeidos: number; ultimoMensajeTs: string;
}
export interface InternalChannel { id: string; nombre: string; tipo: "canal" | "dm"; miembros: string[]; }
export interface InternalMessage { id: string; channelId: string; staffId: string; texto: string; ts: string; }
export interface SocialPost { id: string; red: "facebook" | "instagram"; estado: "publicado" | "programado" | "borrador"; texto: string; fecha: string; }
export interface Metric { label: string; valor: string | number; delta?: number; }
```

- [ ] **Step 1:** Write `types.ts` exactly as above.
- [ ] **Step 2:** Write `seed.ts` exporting: `departments`, `staff` (8-10 people across departments), `contacts` (12-15 patients), `conversations` (12-15 across channels/statuses), `messages` (3-6 per conversation, realistic salvadoreño Spanish: control prenatal, resultados de laboratorio, costos de ultrasonido, dudas de pediatría, citas de reproducción asistida), `internalChannels`, `internalMessages`, `socialPosts`, `metrics`. Use fixed ISO timestamps (no Date.now — seed is static). Current staff user id `me` exists in `staff`.
- [ ] **Step 3:** Commit `feat: data layer types and realistic seed`.

---

### Task 3: Provider + store reducer (TDD)

**Files:**
- Create: `lib/data/provider.ts`, `lib/store.tsx`
- Test: `lib/data/__tests__/provider.test.ts`, `lib/data/__tests__/store.test.ts`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces:

```ts
// provider.ts
export interface CommsProvider {
  listConversations(): Conversation[];
  getMessages(conversationId: string): Message[];
  getContact(id: string): Contact | undefined;
  listInternalChannels(): InternalChannel[];
  getInternalMessages(channelId: string): InternalMessage[];
  listSocialPosts(): SocialPost[];
  getMetrics(): Metric[];
}
export class FakeCommsProvider implements CommsProvider { /* reads from seed (cloned) */ }

// store.tsx
export type StoreAction =
  | { type: "SEND_MESSAGE"; conversationId: string; texto: string; staffId: string }
  | { type: "ASSIGN"; conversationId: string; staffId: string }
  | { type: "SET_STATUS"; conversationId: string; estado: ConversationStatus }
  | { type: "MARK_READ"; conversationId: string }
  | { type: "INCOMING"; conversationId: string; texto: string } // from live engine
  | { type: "SEND_INTERNAL"; channelId: string; texto: string; staffId: string };
export function storeReducer(state: StoreState, action: StoreAction): StoreState;
export function useStore(): { state: StoreState; dispatch: Dispatch<StoreAction>; };
export function StoreProvider({ children }: { children: ReactNode }): JSX.Element;
```

- [ ] **Step 1:** Write `vitest.config.ts` (node/jsdom env as needed for pure-logic tests use node).
- [ ] **Step 2:** Write failing `provider.test.ts`: `listConversations()` returns the seed count; `getMessages(id)` returns only that conversation's messages sorted by ts; returns clones (mutating result does not change provider).
- [ ] **Step 3:** Run `npm test` — expect FAIL (module not found).
- [ ] **Step 4:** Implement `FakeCommsProvider` (deep-clone seed on construction so the store owns mutable state).
- [ ] **Step 5:** Run `npm test` — expect provider tests PASS.
- [ ] **Step 6:** Write failing `store.test.ts` for `storeReducer`:
  - `SEND_MESSAGE` appends a staff message to the conversation and sets `estado` to `en_progreso` if it was `nuevo`, updates `ultimoMensajeTs`.
  - `ASSIGN` sets `asignadoA`.
  - `SET_STATUS` sets `estado`.
  - `MARK_READ` sets `noLeidos` to 0.
  - `INCOMING` appends a `paciente` message and increments `noLeidos`.
- [ ] **Step 7:** Run `npm test` — expect FAIL.
- [ ] **Step 8:** Implement `storeReducer` + `StoreProvider` (Context) + `useStore`. Reducer is pure; timestamps for new messages are passed in by callers (default to a monotonic counter, NOT Date.now, to keep tests deterministic — store exposes a `nextTs()` based on an incrementing seconds offset from a fixed base).
- [ ] **Step 9:** Run `npm test` — expect all PASS.
- [ ] **Step 10:** Commit `feat: FakeCommsProvider and store reducer with tests`.

---

### Task 4: Roles

**Files:**
- Create: `lib/roles.ts`, `components/shell/RoleSwitcher.tsx`

**Interfaces:**
- Produces:

```ts
export interface RoleDef { id: RoleId; nombre: string; ve: Array<"bandeja"|"interno"|"redes"|"dashboard">; }
export const ROLES: Record<RoleId, RoleDef>;
export function useRole(): { rol: RoleId; setRol: (r: RoleId) => void; def: RoleDef };
```

- [ ] **Step 1:** Write `roles.ts`: ROLES map. recepcion ve [bandeja, interno]; medico ve [bandeja, interno]; jefe ve [bandeja, interno, dashboard]; admin ve [bandeja, interno, redes, dashboard]. `useRole` reads/writes `localStorage` key `ccg.rol` (default `admin` so demo shows everything), guarded for SSR.
- [ ] **Step 2:** Write `RoleSwitcher.tsx`: a select/segmented control in the sidebar to change role; updates nav visibility.
- [ ] **Step 3:** Commit `feat: roles and role switcher`.

---

### Task 5: App shell — Sidebar, Brand, layout, ui primitives

**Files:**
- Create: `components/shell/Sidebar.tsx`, `components/shell/Brand.tsx`
- Create: `components/ui/ChannelBadge.tsx`, `StatusPill.tsx`, `Avatar.tsx`, `EmptyState.tsx`
- Modify: `app/layout.tsx` (wrap with `StoreProvider`, render Sidebar + main)

**Interfaces:**
- Consumes: `useStore`, `useRole`, `cn`.
- Produces: `ChannelBadge({channel})`, `StatusPill({estado})`, `Avatar({iniciales, color?})`, `EmptyState({titulo, descripcion, icon?})`.

- [ ] **Step 1:** Build `Brand.tsx` (wordmark "Centro Ginecológico" in brand blue + tagline "Somos parte de tu vida").
- [ ] **Step 2:** Build ui primitives: `ChannelBadge` (whatsapp green, instagram pink/gradient, facebook blue, internal gray — with lucide icon), `StatusPill` (nuevo=blue, en_progreso=amber, resuelto=green), `Avatar` (initials circle), `EmptyState`.
- [ ] **Step 3:** Build `Sidebar.tsx`: brand at top, nav items filtered by `useRole().def.ve`, RoleSwitcher at bottom, active route highlight. Icons via lucide.
- [ ] **Step 4:** Update `app/layout.tsx`: `<StoreProvider>` wrapping a flex shell `[Sidebar | main children]`. Mark client boundaries correctly per Next 16 docs.
- [ ] **Step 5:** Verify dev server renders shell with placeholder pages for each route. Commit `feat: app shell, sidebar, brand, ui primitives`.

---

### Task 6: Bandeja unificada (core inbox)

**Files:**
- Create: `app/page.tsx` (replace placeholder)
- Create: `components/inbox/ConversationList.tsx`, `ConversationListItem.tsx`, `InboxFilters.tsx`, `Thread.tsx`, `MessageBubble.tsx`, `Composer.tsx`, `ContextPanel.tsx`

**Interfaces:**
- Consumes: `useStore`, `FakeCommsProvider` data via store, `ChannelBadge`, `StatusPill`, `Avatar`, `EmptyState`, `cn`.

- [ ] **Step 1:** `InboxFilters.tsx`: channel tabs (Todos/WhatsApp/Instagram/Facebook), and filters for estado (Nuevo/En progreso/Resuelto), asignación (Mías/Sin asignar/Todas), departamento dropdown. Holds filter state lifted to `page.tsx`.
- [ ] **Step 2:** `ConversationList.tsx` + `ConversationListItem.tsx`: filtered, sorted by `ultimoMensajeTs` desc; item shows avatar, contact name, last message preview, channel badge, status pill, unread count, time.
- [ ] **Step 3:** `MessageBubble.tsx`: paciente (left, gray) vs staff (right, brand blue). `Thread.tsx`: header (contact + channel + status + assign/resolve actions), scrollable messages, `Composer` at bottom.
- [ ] **Step 4:** `Composer.tsx`: textarea + send button; dispatches `SEND_MESSAGE`; blocks empty; Enter to send.
- [ ] **Step 5:** `ContextPanel.tsx`: selected patient info (nombre, canal, telefono/handle, departamento, notas) + quick actions (assign to me, change status, change department).
- [ ] **Step 6:** `app/page.tsx`: 3-column layout `[list | thread | context]`, selection state, wires actions to store. Empty states when nothing selected/filtered.
- [ ] **Step 7:** Manual verify in browser: filtering, selecting, replying, assigning, resolving all update live. Commit `feat: unified inbox (bandeja)`.

---

### Task 7: Live engine

**Files:**
- Create: `lib/data/live-engine.ts`
- Modify: `app/layout.tsx` or a client mount component to start/stop the engine.

**Interfaces:**
- Consumes: store `dispatch`.
- Produces: `useLiveEngine(dispatch, { enabled })` hook that on an interval picks a random existing conversation and dispatches `INCOMING` with a plausible salvadoreño message; cleans up on unmount; togglable.

- [ ] **Step 1:** Implement `useLiveEngine`: `setInterval` (e.g. every 12-20s), pool of canned incoming messages, dispatch `INCOMING`. Vary selection by an internal counter (no Math.random reliance for determinism is not required here, but guard SSR / mount only).
- [ ] **Step 2:** Add a small "En vivo" toggle in the sidebar or inbox header (default on).
- [ ] **Step 3:** Verify new messages appear, unread badges increment, list re-sorts. Commit `feat: live incoming-message engine`.

---

### Task 8: Chat interno

**Files:**
- Create: `app/interno/page.tsx`, `components/internal/ChannelList.tsx`, `InternalThread.tsx`

**Interfaces:**
- Consumes: store (`listInternalChannels`, `getInternalMessages`, `SEND_INTERNAL`), `Avatar`, `Composer` pattern.

- [ ] **Step 1:** `ChannelList.tsx`: canales (#general, #ginecologia, ...) and DMs sections.
- [ ] **Step 2:** `InternalThread.tsx`: messages grouped by author with avatars + names + time; composer dispatches `SEND_INTERNAL`.
- [ ] **Step 3:** `app/interno/page.tsx`: 2-column `[channels | thread]`. Verify sending works. Commit `feat: internal department chat`.

---

### Task 9: Redes sociales (publicaciones)

**Files:**
- Create: `app/redes/page.tsx`, `components/social/PostList.tsx`, `PostComposer.tsx`

**Interfaces:**
- Consumes: store `listSocialPosts`, `ChannelBadge`.

- [ ] **Step 1:** `PostList.tsx`: posts grouped by estado (publicado/programado/borrador) with red badge (FB/IG), fecha, texto.
- [ ] **Step 2:** `PostComposer.tsx`: mock composer (red selector, textarea, fecha, "Programar" button that adds a `programado` post to local state). No real publishing.
- [ ] **Step 3:** `app/redes/page.tsx` assembles. Only reachable for admin role. Commit `feat: social posts module`.

---

### Task 10: Dashboard métricas

**Files:**
- Create: `app/dashboard/page.tsx`, `components/dashboard/MetricCard.tsx`, `DeptBreakdown.tsx`

**Interfaces:**
- Consumes: store `getMetrics`, conversations (compute counts by departamento/estado).

- [ ] **Step 1:** `MetricCard.tsx`: label, big value, optional delta arrow (brand colors).
- [ ] **Step 2:** `DeptBreakdown.tsx`: horizontal bars of conversations per department (computed from store), and a status breakdown.
- [ ] **Step 3:** `app/dashboard/page.tsx`: grid of MetricCards (volumen, tiempo de respuesta, % resueltas, sin asignar) + breakdowns. Visible to jefe/admin. Commit `feat: metrics dashboard`.

---

### Task 11: Polish, empty states, responsive, final verification

**Files:** touch various components.

- [ ] **Step 1:** Consistent spacing, hover/focus states, loading skeletons where helpful, accessible labels on icon buttons.
- [ ] **Step 2:** Responsive: graceful narrow-width behavior (collapse context panel / channel list).
- [ ] **Step 3:** README.md: what the demo is, how to run (`npm install`, dev via PowerShell Start-Process on :3000), role switcher note, FAKE/REAL seam note.
- [ ] **Step 4:** Full manual pass in browser across all 4 modules and all roles. Screenshot the inbox.
- [ ] **Step 5:** `npm run build` to confirm it compiles for production. Fix any type errors.
- [ ] **Step 6:** Commit `chore: polish, responsive, README, build green`.

---

## Self-Review

**Spec coverage:** Bandeja unificada (T6) + ordering filters (T6.1) ✓; chat interno (T8) ✓; redes DMs into inbox (channel model T2 + inbox T6) + publicaciones (T9) ✓; dashboard (T10) ✓; roles sin llamadas (T4) ✓; FAKE/REAL seam (T3 provider interface) ✓; live feel (T7) ✓; brand verified (T1 tokens, T5 Brand) ✓; mock data realism (T2) ✓; testing on logic (T3) ✓.

**Placeholder scan:** No TBD/TODO. UI tasks specify concrete component responsibilities and the actions they dispatch; logic tasks (T2, T3) include concrete types and test assertions.

**Type consistency:** `Channel`, `ConversationStatus`, `DepartmentId`, `RoleId` defined once in T2 and reused. Store actions in T3 match dispatches referenced in T6/T7/T8. `useRole().def.ve` keys (`bandeja|interno|redes|dashboard`) match sidebar nav and route gating in T4/T5/T9/T10.

## Execution Handoff

Foundation (T1-T5) is sequential and locks shared interfaces; modules (T6-T10) are largely independent and parallelizable once the store interface exists; T11 integrates.
