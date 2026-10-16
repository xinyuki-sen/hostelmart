# ⚡ HostelMart — Hyper-Local Campus P2P Marketplace

> **Hand-to-hand student marketplace** for hostel essentials, textbooks, appliances, and bicycles — with zero shipping, instant corridor pickups, and WhatsApp deal negotiation.

🔗 **Live Demo:** [hostelmart-mocha.vercel.app](https://hostelmart-mocha.vercel.app/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [File Structure & Connection Map](#-file-structure--connection-map)
- [Data Flow — How Everything Connects](#-data-flow--how-everything-connects)
- [Page-by-Page Breakdown](#-page-by-page-breakdown)
- [Library Modules](#-library-modules-lib)
- [Design System](#-design-system-styles)
- [Database Schema](#-database-schema-supabase)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)

---

## 🚀 Features

### For Students (Buyers & Sellers)

| Feature | Description |
|---------|-------------|
| **📦 Listing Creation** | 3-step form: upload 1–4 photos → fill item details → submit for admin approval |
| **📷 Silent Photo Compression** | Client-side HTML5 Canvas auto-compresses 10MB phone photos to ~120KB WebP in <500ms — students never manually resize |
| **💬 WhatsApp Deal Bridge** | 1-click `wa.me/` deep link pre-filled with item title, price, negotiability status, and room pickup location |
| **🎁 Hostel Karma (₹0 Free Stuff)** | Graduating students post unwanted items for ₹0 — juniors claim them via WhatsApp |
| **🔍 Looking For (ISO Board)** | Reverse request board — students post "I need X" with budget & urgency, sellers contact them |
| **❤️ Save / Heart Items** | Tap the heart button on any card to bookmark items |
| **🔥 48h Move-Out Clearance** | Urgent clearance ribbon on cards for students leaving in 48 hours |
| **📦 My Listed Ads Dashboard** | View all your posted items, toggle "Mark as Sold", or delete listings |
| **🔐 Student Login & Registration** | Username + password auth with hostel block and room number |

### For Admins / Supervisors

| Feature | Description |
|---------|-------------|
| **📥 Moderation Queue** | Every new listing enters a `pending` state — admins approve or reject before it goes live |
| **✓ Approve → Instant Live** | Clicking "Approve" changes status to `active` — the item instantly appears on the marketplace feed |
| **✕ Reject → Hidden** | Rejected items never reach the public feed |
| **📝 Private Research Notes** | Per-item private field notes visible only to supervisors (never shown to students) |
| **📥 CSV Dataset Export** | 1-click RFC-4180 compliant CSV download of all listings with deal velocity and admin notes |
| **📊 Live Metrics Dashboard** | Total inventory count, sell-through rate, average time-to-sell, and pending review count |
| **🛡️ Role-Gated Access** | The entire Supervisor Hub and admin sidebar link are 100% hidden from students |

### Platform-Wide

| Feature | Description |
|---------|-------------|
| **🔄 Real-Time Reactivity** | Custom event dispatcher (`hostelmart_data_changed`) syncs all pages instantly — no manual refresh needed |
| **🔍 Search & Filter** | Full-text search across item titles and hostel blocks, with category pills and price sorting |
| **📱 Responsive Design** | 3-column desktop layout collapses gracefully on tablets and mobile |
| **🌙 Chrono Dark Theme** | Premium dark slate UI (`#080c14`) with high contrast, glassmorphism, and micro-animations |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router, React 19, TypeScript) |
| **Styling** | Vanilla CSS Design System (4 layered stylesheets) |
| **Database** | Supabase (PostgreSQL + Row Level Security) |
| **Storage** | Supabase Storage (`listing-images` bucket) |
| **Auth** | JWT via `jose` + HTTP-Only Cookies + bcryptjs |
| **Validation** | Zod schemas for all input surfaces |
| **Deployment** | Vercel (auto-deploy on `git push` to `main`) |
| **Font** | Inter (Google Fonts — 400/500/600/700/800) |

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                         │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  / (Feed) │  │  /sell   │  │ /my-ads  │  │  /admin       │  │
│  │  page.tsx │  │ page.tsx │  │ page.tsx │  │  page.tsx      │  │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └──────┬────────┘  │
│        │             │             │               │            │
│        └─────────────┴─────────────┴───────────────┘            │
│                              │                                  │
│                    ┌─────────▼──────────┐                       │
│                    │   lib/dataStore.ts  │ ← Central Data Hub   │
│                    │  (Reactive Store)   │                       │
│                    └─────────┬──────────┘                       │
│                              │                                  │
│               ┌──────────────┼──────────────┐                   │
│               ▼              ▼              ▼                   │
│        ┌────────────┐ ┌───────────┐ ┌──────────────┐           │
│        │ localStorage│ │ CustomEvent│ │ StorageEvent │           │
│        │  (persist)  │ │ (same tab) │ │ (cross tab)  │           │
│        └────────────┘ └───────────┘ └──────────────┘           │
│                              │                                  │
│                    ┌─────────▼──────────┐                       │
│                    │  lib/supabase.ts   │ ← Cloud Sync          │
│                    │  (Optional Async)  │                       │
│                    └───────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                 ┌─────────────────────────┐
                 │   Supabase Cloud (PG)   │
                 │  bsodewkqbwfpzzaufsri   │
                 │  ap-south-1 (Mumbai)    │
                 └─────────────────────────┘
```

### Key Architecture Decisions

1. **Hybrid Persistence**: `dataStore.ts` writes to `localStorage` for instant reads and dispatches to Supabase asynchronously when credentials are configured. This makes the app fully functional even without a database connection.

2. **Event-Driven Reactivity**: Instead of prop drilling or a state management library, the store uses `window.dispatchEvent(new CustomEvent('hostelmart_data_changed'))` for same-tab reactivity and `window.addEventListener('storage', ...)` for cross-tab sync. Every page subscribes via `subscribeToStore()`.

3. **Strict Role Separation**: The admin sidebar link, Supervisor Hub route, research notes, and moderation controls are conditionally rendered based on `user.role === 'admin'` — never present in the DOM for students.

---

## 📁 File Structure & Connection Map

```
hostelmart/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root HTML shell, font loading, CSS imports
│   ├── page.tsx                  # Main marketplace feed + product detail modal + ISO board
│   ├── login/page.tsx            # Student & Admin login portals (tabbed)
│   ├── sell/page.tsx             # 3-step listing creation with photo compression
│   ├── my-ads/page.tsx           # Seller dashboard — Mark as Sold toggle + delete
│   └── admin/page.tsx            # Supervisor Hub — moderation queue, notes, CSV export
│
├── lib/                          # Shared business logic modules
│   ├── dataStore.ts              # ⭐ CENTRAL HUB — CRUD operations, reactive subscriptions
│   ├── supabase.ts               # Supabase client initialization (anon + service role)
│   ├── compression.ts            # Client-side image auto-compression (Canvas → WebP)
│   ├── whatsapp.ts               # WhatsApp wa.me/ deep link generator with pre-filled messages
│   ├── auth.ts                   # JWT session tokens via jose + HTTP-Only cookie config
│   ├── validations.ts            # Zod schemas for all form inputs
│   └── exportCsv.ts              # RFC-4180 CSV generator + browser file download
│
├── types/
│   └── index.ts                  # TypeScript interfaces: Listing, User, ISORequest, etc.
│
├── styles/                       # Layered CSS design system
│   ├── globals.css               # Layer 1: CSS variables, reset, base component classes
│   ├── chrono-theme.css          # Layer 2: Layout system, cards, modals, scrolling fixes
│   ├── olx-components.css        # Layer 3: OLX-inspired navigation and sidebar components
│   └── theme.css                 # Layer 4: Additional theme tokens and overrides
│
├── supabase/
│   └── schema.sql                # Full PostgreSQL migration: tables, RLS, indexes, triggers
│
├── .env.local                    # Environment secrets (git-ignored)
├── .env.example                  # Template for required environment variables
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript compiler options
└── package.json                  # Dependencies and scripts
```

---

## 🔄 Data Flow — How Everything Connects

### Flow 1: Student Posts an Item → Admin Approves → Appears on Feed

```
Student fills /sell form
       │
       ▼
sell/page.tsx calls createListing() from dataStore.ts
       │
       ▼
dataStore.ts saves to localStorage with status: "pending"
       │ also dispatches CustomEvent('hostelmart_data_changed')
       │ also syncs to Supabase (if configured)
       │
       ▼
Student redirected to / (feed) — item does NOT appear
(because feed filters: status === 'active' || status === 'sold')
       │
       ▼
Admin opens /admin — page calls getStoredListings()
       │ subscribes to store changes via subscribeToStore()
       │
       ▼
Pending item appears in "📥 Pending Approval Queue"
       │
       ▼
Admin clicks "✓ Approve"
       │
       ▼
admin/page.tsx calls updateListingStatus(id, 'active')
       │
       ▼
dataStore.ts updates localStorage + dispatches event
       │
       ▼
Student refreshes / (feed) — item NOW appears as a live card!
```

### Flow 2: Seller Marks Item as Sold

```
Seller opens /my-ads
       │
       ▼
my-ads/page.tsx calls getStoredListings() filtered by seller name
       │
       ▼
Seller toggles the "Mark as Sold" switch
       │
       ▼
my-ads/page.tsx calls toggleSoldStatus(id) from dataStore.ts
       │
       ▼
dataStore.ts flips status: 'active' ↔ 'sold', saves, dispatches event
       │
       ▼
Feed (/) shows card greyed out with "SOLD ✓" badge
```

### Flow 3: WhatsApp Deal Negotiation

```
Buyer taps item card on / (feed)
       │
       ▼
Product detail modal opens with seller info
       │
       ▼
Buyer clicks "💬 Bargain / Contact on WhatsApp"
       │
       ▼
whatsapp.ts generates: wa.me/91{phone}?text={pre-filled message}
Message includes: item title, price, negotiability, room number
       │
       ▼
Opens WhatsApp with seller — deal happens in person at room
```

---

## 📄 Page-by-Page Breakdown

### `app/page.tsx` — Marketplace Feed (Main Hub)
**Imports from:** `dataStore.ts`, `whatsapp.ts`

The main 3-column dashboard layout:
- **Left sidebar**: Navigation buttons (Marketplace, ISO, My Ads), admin-only Supervisor Hub link, hostel wing status, login/logout
- **Center feed**: Search bar, sort dropdown, category filter pills, 4:3 ratio item cards in a responsive grid
- **Right drawer**: Campus Trends, Hostel Karma promo, Safe Trading guide
- **Product Detail Modal**: Full-screen popup with image carousel, badges, seller info card, and WhatsApp CTA button
- **ISO Board**: Tab switch to "Looking For" reverse request board with budget and urgency
- **ISO Creation Modal**: Form to post a new wanted request

### `app/login/page.tsx` — Authentication Portal
**Standalone** (uses `localStorage` directly)

Two distinct tabbed login interfaces:
- **👤 Student Portal**: Username + password login, with optional registration (phone, hostel block, room number)
- **🛡️ Admin Login**: Restricted portal for `AdminA` / `Admin1` with passcode `123456` or `AdminPass@2026!`

Sets `hostelmart_user` in `localStorage` with role-specific session data.

### `app/sell/page.tsx` — Listing Creation Form
**Imports from:** `dataStore.ts`, `compression.ts`

3-step listing submission:
1. **Photos**: File picker with silent WebP auto-compression via `compressImageToBase64()`, thumbnail preview grid with cover tag and delete buttons
2. **Details**: Title, category dropdown, condition selector, price input (₹0 = Free), hostel block + room
3. **Options**: Negotiable toggle, 48h Move-Out Clearance toggle

Calls `createListing()` → item saved with `status: 'pending'`.

### `app/my-ads/page.tsx` — Seller Dashboard
**Imports from:** `dataStore.ts`

- Loads all listings matching the current logged-in user's `sellerName`
- **Mark as Sold** toggle switch calls `toggleSoldStatus()`
- **Delete** button calls `deleteListing()`
- Subscribes to store for real-time updates

### `app/admin/page.tsx` — Supervisor Command Hub
**Imports from:** `dataStore.ts`, `exportCsv.ts`

Protected behind passphrase authentication:
- **Live Metrics Grid**: Total inventory, sell-through %, avg time-to-sell, pending review count
- **📥 Pending Approval Queue**: Cards for each `status: 'pending'` item with Approve / Reject buttons → calls `updateListingStatus()`
- **📊 Private Research Ledger**: Table of all listings with inline-editable admin notes → calls `updateListingAdminNote()`
- **📥 Export Dataset (CSV)**: Generates RFC-4180 CSV via `generateResearchCsv()` and triggers browser download

---

## 📚 Library Modules (`lib/`)

### `dataStore.ts` — ⭐ Central Reactive Data Store
The **brain** of the application. Every page reads from and writes to this module.

| Function | Purpose |
|----------|---------|
| `getStoredListings()` | Read all listings from localStorage (with seed data fallback) |
| `createListing(item)` | Create a new listing with `status: 'pending'` + sync to Supabase |
| `updateListingStatus(id, status)` | Admin approve/reject → updates localStorage + dispatches event |
| `updateListingAdminNote(id, note)` | Save private supervisor research notes |
| `toggleSoldStatus(id)` | Toggle between `'active'` ↔ `'sold'` |
| `deleteListing(id)` | Remove a listing entirely |
| `getStoredISORequests()` | Read all ISO (Looking For) requests |
| `createISORequest(req)` | Post a new wanted request |
| `subscribeToStore(callback)` | Subscribe to data change events (returns unsubscribe function) |

**Reactivity mechanism:**
- Same-tab: `window.dispatchEvent(new CustomEvent('hostelmart_data_changed'))`
- Cross-tab: `window.addEventListener('storage', ...)` fires when another tab writes to localStorage

### `compression.ts` — Silent Image Auto-Compressor
| Function | Purpose |
|----------|---------|
| `compressImage(file, options)` | Compress via Canvas → returns WebP `Blob` |
| `compressImageToBase64(file, options)` | Compress → returns base64 Data URL (for localStorage persistence) |

Options: `maxWidth` (default 1200), `maxHeight` (1200), `quality` (0.75), `outputType` ('image/webp')

### `whatsapp.ts` — Deal Negotiation Bridge
| Function | Purpose |
|----------|---------|
| `normalizePhoneNumber(phone)` | Strips non-digits, prepends `91` (India) if missing |
| `buildWhatsAppLink(params)` | Generates `wa.me/` URL with pre-filled negotiation message |

The pre-filled message includes: greeting, item title (bold), price with negotiability, pickup location, and context-aware call-to-action.

### `auth.ts` — Session Security
| Function | Purpose |
|----------|---------|
| `createSessionToken(payload)` | Signs a JWT with HS256 via `jose` (7-day expiry) |
| `verifySessionToken(token)` | Verifies and decodes a JWT |
| `getSessionCookieOptions(token)` | Returns HTTP-Only, Secure, SameSite cookie config |
| `assertIsAdmin(session)` | Quick role check helper |

### `validations.ts` — Zod Input Schemas
| Schema | Validates |
|--------|-----------|
| `RegisterSchema` | Username (3–30 chars, alphanumeric), phone (10-digit Indian), hostel block, room, password |
| `LoginSchema` | Username + password presence |
| `ListingSubmissionSchema` | Title, description, price (0–100K), condition enum, category enum, images array (1–5) |
| `ISOSubmissionSchema` | Title, budget, location, urgency |
| `AdminActionSchema` | Listing ID (UUID), action (approve/reject), optional rejection reason |
| `AdminNoteSchema` | Listing ID, note text, optional demand rating (1–5) |

### `exportCsv.ts` — Research Dataset Exporter
| Function | Purpose |
|----------|---------|
| `generateResearchCsv(rows)` | Converts listings array to RFC-4180 CSV string with proper escaping |
| `downloadCsvFile(csv, filename)` | Creates Blob URL and triggers browser file download |

CSV columns: Listing ID, Title, Category, Condition, Price, Negotiable, Status, Block, Room, Created At, Sold At, Time to Sell (Hours), Admin Notes

---

## 🎨 Design System (`styles/`)

The CSS is organized in **4 cascading layers**, imported in order by `app/layout.tsx`:

| Layer | File | Purpose |
|-------|------|---------|
| **1. Foundation** | `globals.css` | CSS custom properties (`--bg-app`, `--text-main`, etc.), box-sizing reset, `.btn`, `.modal-overlay`, `.modal-card`, `.form-input` base classes |
| **2. Layout & Components** | `chrono-theme.css` | 3-column grid (`.chrono-layout`), cards (`.chrono-card`), category pills, product detail modal with scroll fixes, carousel, seller card, mobile breakpoints |
| **3. Navigation** | `olx-components.css` | OLX-inspired sidebar navigation, nav buttons, wing items, brand header, live indicator animation, sidebar footer |
| **4. Theme Tokens** | `theme.css` | Additional color tokens, button variants, badge styles, status indicators |

### Design Tokens (CSS Variables)
```css
--bg-app:              #080c14    /* Deep dark slate */
--bg-sidebar:          #0b0f17    /* Sidebar panel */
--bg-card:             #0f1520    /* Card surfaces */
--accent-blue:         #3b82f6    /* Primary action blue */
--text-main:           #e2e8f0    /* High contrast white */
--text-dim:            #94a3b8    /* Secondary text */
--text-muted:          #64748b    /* Tertiary text */
--radius-sm/md/lg:     6/10/14px  /* Border radius scale */
```

---

## 🗄 Database Schema (`supabase/`)

The `schema.sql` migration creates a full production-grade PostgreSQL schema:

### Tables

| Table | Purpose |
|-------|---------|
| `users` | Student/admin accounts with `password_hash`, `role` enum, `hostel_block`, `room_number` |
| `listings` | Item listings with `status` lifecycle (`pending` → `active` → `sold`), `images` array, `view_count` |
| `iso_requests` | Wanted/Looking For requests with `budget`, `urgency`, and fulfillment status |
| `admin_research_notes` | Private supervisor notes linked to listings with `demand_rating` and `time_to_sell_hours` |

### Custom Enums
- `user_role`: `'user'` | `'admin'`
- `listing_status`: `'pending'` | `'active'` | `'sold'` | `'rejected'` | `'archived'`
- `item_condition`: `'Like New'` | `'Gently Used'` | `'Well Used'`
- `item_category`: 6 categories (room essentials, electronics, books, mobility, clothing, other)

### Security
- **Row Level Security (RLS)** enabled on all tables
- Performance indexes on `seller_id`, `status`, `category`, and `created_at`
- Auto-update trigger on `updated_at` timestamps

---

## ⚙ Setup & Installation

```bash
# 1. Clone the repository
git clone https://github.com/xinyuki-sen/hostelmart.git
cd hostelmart

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Fill in your Supabase credentials in .env.local

# 5. Run the database migration
# (Paste supabase/schema.sql into Supabase SQL Editor and execute)

# 6. Start development server
npm run dev
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service role key for admin operations (bypasses RLS) |
| `JWT_SECRET_KEY` | Yes | 32+ character secret for JWT session signing |
| `NEXT_PUBLIC_APP_URL` | Optional | Application URL (defaults to `http://localhost:3000`) |

> **Note:** The app works fully without Supabase credentials using localStorage-only mode. Supabase sync activates automatically when valid credentials are detected.

---

## 🚀 Deployment

The project is deployed on **Vercel** with automatic deployments:

```bash
# Every push to main triggers a production build
git add .
git commit -m "feat: your changes"
git push origin main
# → Vercel auto-builds and deploys within ~60 seconds
```

### Vercel Environment Variables
Add the same variables from `.env.local` to your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET_KEY`

---

## 📊 Build Benchmarks

```
✓ Compiled successfully in 3.0s
✓ 0 TypeScript errors, 0 build errors

Route (app)                   Size      First Load JS
┌ ○ /                       8.32 kB         179 kB
├ ○ /admin                  5.66 kB         176 kB
├ ○ /login                  2.25 kB         108 kB
├ ○ /my-ads                 4.14 kB         175 kB
└ ○ /sell                   5.81 kB         177 kB
+ First Load JS shared       103 kB
```

---

## 📜 License

Built for educational and commercial use. MIT License.
