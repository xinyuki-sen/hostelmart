# ⚡ HostelMart — Hyper-Local Campus P2P Marketplace

> **Hand-to-hand student corridor marketplace** for hostel essentials, textbooks, appliances, bicycles, and wanted requests — with zero shipping fees, verified room pickups, and direct WhatsApp negotiation.

🔗 **Live Production App:** [hostelmart-mocha.vercel.app](https://hostelmart-mocha.vercel.app/)

---

## 📋 Table of Contents

- [Implemented Features Overview](#-implemented-features-overview)
  - [1. Student Account & Authentication Database](#1-student-account--authentication-database)
  - [2. Marketplace Feed & Browsing](#2-marketplace-feed--browsing)
  - [3. Product Details & WhatsApp Bridge](#3-product-details--whatsapp-bridge)
  - [4. Looking For (Wanted / ISO Board)](#4-looking-for-wanted--iso-board)
  - [5. Live Campus Trends Sidebar](#5-live-campus-trends-sidebar)
  - [6. Item Listing & Photo Compression](#6-item-listing--photo-compression)
  - [7. Seller Dashboard (My Listed Ads)](#7-seller-dashboard-my-listed-ads)
  - [8. Dedicated Supervisor Hub (Admin Console)](#8-dedicated-supervisor-hub-admin-console)
- [Role-Based Access & Portal Separation](#-role-based-access--portal-separation)
- [How Data Flows Across the App](#-how-data-flows-across-the-app)
- [Architecture & File Structure](#-architecture--file-structure)
- [Tech Stack](#-tech-stack)
- [Demo Credentials](#-demo-credentials)
- [Setup & Local Development](#-setup--local-development)

---

## 🚀 Implemented Features Overview

### 1. Student Account & Authentication Database

- **Account Registration (`/login` -> Student Portal -> Register)**:
  - Input fields: Username (alphanumeric, 3+ characters), 10-digit Mobile Phone, Hostel Block, Room Number, Password (4+ characters).
  - **Duplicate check**: Strictly blocks duplicate usernames with an inline warning.
  - Stores student account in the database and automatically logs them in.
- **Strict Login Authentication (`/login` -> Student Portal -> Sign In)**:
  - **Account Verification**: Unregistered usernames are rejected (*"Account '@username' not found. Please click 'Register now' to create your account."*).
  - **Password Verification**: Incorrect passwords are rejected (*"Incorrect password for @username. Please try again."*).
  - **Audit Logging**: Every successful login updates the student's `lastLogin` timestamp and login count in the Supervisor Tracking Ledger.
- **Unique Student Identity**:
  - Each registered user is assigned a unique identifier (`u-{username}`). No two students share IDs or listings.

---

### 2. Marketplace Feed & Browsing (`/`)

- **4:3 Aspect-Ratio Item Cards**:
  - Cover photo with photo count badge (e.g. `📷 2`).
  - Price tag in INR (₹) or **`FREE 🎁`** badge for ₹0 giveaways.
  - Price status: **`Negotiable`** or **`Fixed`** badge.
  - Moving-out banner: **`🔥 48h MOVING OUT CLEARANCE`** for urgent listings.
  - Sold indicator: **`SOLD ✓`** badge with dimmed card opacity for sold-out items.
  - Location badge: Hostel Block & Room Number (e.g. `📍 Block B • Rm 304`).
  - Verified resident checkmark and relative timestamp.
- **Live Search**:
  - Real-time search across item titles and hostel blocks.
- **Category Filter Pills**:
  - `🔥 All`
  - `🎁 Free Stuff (₹0)` (Hostel Karma filter)
  - `⚡ Under ₹500` (Pocket-money deals)
  - `🛏️ Room Essentials`
  - `⚡ Electronics`
  - `📚 Books`
  - `🚲 Cycles`
- **Sorting**:
  - `✨ Newest First`
  - `💰 Price: Low to High`
  - `💎 Price: High to Low`
- **Like / Bookmark Button**:
  - Interactive heart button (`🤍` / `❤️`) on every card to save items.
- **Empty State Handling**:
  - When no listings match filters or before any items are posted, displays a friendly empty state with a direct `+ Post the First Item` button.

---

### 3. Product Details & WhatsApp Bridge

- **Full-Screen Detail Modal**:
  - Tap any card to open the detail view.
  - Multi-photo carousel with clickable navigation thumbnails.
  - Full item title, description, category, condition (`Like New`, `Gently Used`, `Well Used`), price, and clearance badges.
  - **Verified Resident Seller Card**: Displays seller username, hostel block, room number, and reputation badge.
- **Context-Aware Action Button**:
  - **When viewing someone else's item**: Displays **`💬 Bargain / Contact on WhatsApp`** — opens a direct `wa.me/` link with a pre-filled negotiation message containing the item title, listed price, negotiability, and pickup room.
  - **When viewing your own item**: Automatically detects ownership. Replaces the WhatsApp button with:
    > 📦 **This is your listing** (Interested buyers will contact your WhatsApp)  
    > `⚙️ Manage in "My Listed Ads" →`

---

### 4. Looking For (Wanted / ISO Board) (`/` -> Looking For tab)

- **Student Wanted Requests**:
  - Reverse marketplace board where students post items they urgently need.
  - Each card displays item name, budget in INR (`₹`), needed-by urgency deadline, requester username, and hostel room location.
- **Context-Aware Action Button**:
  - **For other students**: Displays **`💬 I Have This! Message`** (opens WhatsApp directly with the student who posted the request).
  - **For the requester who posted it**: Hides the WhatsApp button and displays **`✨ Your Request`** with a **`🗑️ Remove`** button so students can delete their request once fulfilled.
- **Post a Request Modal**:
  - Form to enter: Item needed, Budget (₹), Urgency deadline (e.g. *"Tonight before 10 PM"*).
  - Immediately publishes live to the Wanted Board.

---

### 5. Live Campus Trends Sidebar (`/` -> Right Sidebar)

- **100% Dynamic & Live**:
  - Automatically calculates the **top 3 most active categories** based on actual listings in the marketplace and displays real-time item counts.
  - Automatically displays the **most recent Wanted/ISO requests** with student budgets and "Wanted" badges.
  - **Summary Footer**: Live count of active marketplace items and wanted requests.
  - Informational cards on **🎁 Hostel Karma** (₹0 giveaways for juniors) and **🛡️ Safe Trading** (in-corridor inspections before payment).

---

### 6. Item Listing & Photo Compression (`/sell`)

- **3-Step Listing Creation**:
  1. **Photos**: File picker with client-side **silent WebP auto-compression** (Canvas scales images to 640×640 at ~30KB) with instant preview thumbnails and remove button.
  2. **Details**: Title, category dropdown, condition radio selector, price (₹0 allowed for free stuff), hostel block, room number, description.
  3. **Options**: Negotiable toggle and 48h Moving Out Clearance toggle.
- **Authentication Guard**:
  - Guests are notified to sign in so that listings are properly attributed to their account.
- **Moderation Routing**:
  - Newly submitted items are saved with `status: 'pending'` and queued in the Supervisor Hub for approval before appearing on the public feed.

---

### 7. Seller Dashboard (My Listed Ads) (`/my-ads`)

- **Strict User Isolation**:
  - Displays **only** listings created by the logged-in student. Other students' items never appear.
- **Status Badges**:
  - `LIVE` (approved and active on marketplace)
  - `SOLD OUT` (marked as sold by seller)
  - `⏳ AWAITING APPROVAL` (queued in supervisor moderation)
- **Mark as Sold Toggle Switch**:
  - Live toggle that immediately changes status between `active` and `sold`.
  - Marking an item as sold instantly updates the marketplace feed across all tabs.
- **Delete Button**:
  - Permanently deletes the listing with ownership authorization check.
- **Empty States**:
  - Directs logged-out visitors to `/login`.
  - Directs students with 0 items to `/sell` with a `+ Post Your First Item` button.

---

### 8. Dedicated Supervisor Hub (Admin Console) (`/admin`)

- **Strict Admin Isolation**:
  - Admins do **not** see student navigation (Marketplace feed, Look for ISO, My Listed Ads are completely removed).
  - If an admin visits `/`, they are automatically redirected to `/admin`.
  - Passcode protection with demo pass `123456` or `AdminPass@2026!`.
- **Top Header**:
  - Supervisor badge (`AdminA Active`), **🔄 Refresh** button, and **🚪 Logout Admin** button.
- **Live Metrics Bar**:
  - Pending Review count (highlighted red when items await review)
  - Active on Feed count
  - Wanted Requests count
  - Tracked Students count
- **Tab 1: 📥 Pending Approval Queue (Accept or Reject)**:
  - Displays each pending item: photo, title, price, category, condition, description, seller username, hostel block, room number, and **direct WhatsApp link to verify resident**.
  - **`✓ Approve & Publish`**: Immediately publishes listing live to the student marketplace feed.
  - **`✕ Reject Listing`**: Rejects and hides listing.
- **Tab 2: 🔍 Wanted Board Requests Management**:
  - Shows all student wanted requests (item, budget, urgency, requester room, WhatsApp link).
  - **`🗑️ Remove Request`**: Supervisor can remove fulfilled or inappropriate requests with 1 click.
- **Tab 3: 👥 Student Logins & Identity Tracking**:
  - Live audit table tracking every student who registered or logged in:
    - Student Username (`@username`)
    - Hostel Block & Room Number
    - Mobile Phone (with 1-click WhatsApp chat link)
    - Role (`USER`)
    - Number of logins
    - Exact timestamp of last login session
- **Tab 4: 📊 All Listings & Research Ledger**:
  - Complete inventory table (Active, Sold, Pending, Rejected) with supervisor delete button.
  - Inline-editable private supervisor research notes (persisted per listing).
  - **`📥 Export Dataset (CSV)`**: 1-click RFC-4180 CSV export with item details and deal velocity.

---

## 🛡️ Role-Based Access & Portal Separation

| Route | Student Experience | Admin Experience |
|-------|-------------------|------------------|
| `/` | Full Marketplace Feed, ISO Board, Dynamic Trends, Dynamic My Ads Badge | Automatically redirected to `/admin` |
| `/login` | Tabbed login: Student Portal & Admin Login | Directs to `/admin` upon supervisor authentication |
| `/sell` | Listing form with silent photo compression | N/A (Student feature) |
| `/my-ads` | Manages only their own items (Mark as Sold, Delete) | N/A (Student feature) |
| `/admin` | Gated by supervisor passcode (`123456`) | Dedicated console (Approvals, ISO Moderation, Student Login Tracking, CSV Export) |

---

## 🔄 How Data Flows Across the App

```
Student registers / signs in on /login
       │
       ▼
Credentials validated against database
       │ (Session saved in localStorage; login audit logged)
       │
Student visits /sell and posts an item
       │
       ▼
Photo compressed via HTML5 Canvas (640×640 WebP)
       │
Listing saved in dataStore with status: 'pending'
       │ (Cross-tab custom event dispatched: hostelmart_data_changed)
       │
       ├─────────────────────────────────────────────────┐
       ▼                                                 ▼
Student Feed (/)                               Supervisor Hub (/admin)
Item is hidden from feed                        Item appears in "📥 Approval Queue"
(feed only shows active/sold)                   Supervisor clicks "✓ Approve & Publish"
                                                         │
                                                         ▼
                                                Status updated to 'active'
                                                         │
                                                         ▼
                                                Item instantly appears live
                                                on the Marketplace Feed (/)
                                                         │
                                                         ▼
                                                Buyer taps item → Opens WhatsApp
                                                deal negotiation with seller!
```

---

## 📁 Clean Frontend vs Backend Architecture

```
hostelmart/
├── 🎨 FRONTEND (Safe to edit & style):
│   ├── components/               # Modular UI Elements (Designers & Frontend Devs edit here)
│   │   ├── ListingCard.tsx       # Product card display, badges, heart button
│   │   ├── ProductDetailModal.tsx# Photo carousel, condition specs, WhatsApp CTA
│   │   ├── ProfileModal.tsx      # Student room & WhatsApp contact updater
│   │   ├── ISOModal.tsx          # "Looking For" wanted request popup
│   │   ├── MarketplaceSidebar.tsx# Left navigation, wing filters, user persona
│   │   └── index.ts              # Clean barrel export for components
│   │
│   ├── app/                      # Page Routes (Next.js App Router orchestration)
│   │   ├── layout.tsx            # HTML shell, Google Fonts (Inter), CSS stylesheets
│   │   ├── page.tsx              # Main marketplace feed & campus trends
│   │   ├── login/page.tsx        # Student registration & supervisor login
│   │   ├── sell/page.tsx         # 3-step listing creation with silent photo compression
│   │   ├── my-ads/page.tsx       # Seller dashboard (Mark as Sold, Delete, Resubmit)
│   │   └── admin/page.tsx        # Dedicated Supervisor Console (Approvals, ISO, Cloud Sync)
│   │
│   └── styles/                   # Design System & Styling (100% Safe to tweak)
│       ├── globals.css           # CSS variables, buttons, modals, input styles
│       ├── chrono-theme.css      # Responsive 3-column layout, cards, carousels
│       ├── olx-components.css    # Sidebar navigation buttons, status indicators, badges
│       └── theme.css             # HSL color tokens and utility classes
│
├── ⚙️ BACKEND & SERVICES (Core Engine):
│   ├── lib/
│   │   ├── dataStore.ts          # Central reactive data layer (CRUD, auth, reactivity, audit)
│   │   ├── auth.ts               # JWT token creation and verification via jose
│   │   ├── whatsapp.ts           # WhatsApp wa.me/ deep link generator with deal negotiation prefill
│   │   ├── compression.ts        # Client-side image compression (Canvas → WebP)
│   │   ├── exportCsv.ts          # RFC-4180 CSV generator and browser file download
│   │   ├── validations.ts        # Zod validation schemas for forms
│   │   ├── supabase.ts           # Supabase client initialization
│   │   └── index.ts              # Unified backend barrel export
│   │
│   └── supabase/
│       └── schema.sql            # PostgreSQL database schema with RLS security policies
│
└── 📦 SHARED CONTRACTS:
    └── types/
        └── index.ts              # TypeScript interfaces: Listing, StudentAccount, UserAuditRecord
```

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router, React 19, TypeScript)
- **Styling**: Vanilla CSS Design System with dark slate chrono theme (`#080c14`)
- **State & Reactivity**: Custom Event Dispatcher (`hostelmart_data_changed`) + Storage event listeners for zero-latency cross-tab sync
- **Image Processing**: Client-side HTML5 Canvas auto-compression to WebP
- **Data Persistence**: LocalStorage with optional Supabase PostgreSQL sync
- **Typography**: Google Fonts Inter (400, 500, 600, 700, 800)
- **Deployment**: Vercel (CI/CD auto-deploy on push to `main`)

---

## 🔑 Demo Credentials

### Student Portal
Students can register a new account instantly with their hostel block and room number on the `/login` page.

### Supervisor Hub (Admin Portal)
- **Username**: `AdminA` or `Admin1`
- **Passphrase**: `123456` or `AdminPass@2026!`
- **Access URL**: `/login` (Admin tab) or `/admin`

---

## 💻 Setup & Local Development

```bash
# 1. Clone the repository
git clone https://github.com/xinyuki-sen/hostelmart.git
cd hostelmart

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Open in browser
# http://localhost:3000
```

---

## 📜 License

MIT License. Built for campus student communities.
