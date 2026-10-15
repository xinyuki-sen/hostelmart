# ⚡ HostelMart: Hyper-Local Campus P2P Marketplace

A commercial-grade, student-to-student marketplace engineered for university hostels and residential colleges. Built with **Next.js 15 (React 19)**, **TypeScript**, **Supabase PostgreSQL with Row Level Security (RLS)**, and deployed on **Vercel**.

---

## 🚀 Key Features

* **Zero-Friction Selling**: Post an item in under 60 seconds with 1 to 4 photos, condition rating, and fixed vs. negotiable pricing.
* **Silent Client-Side Image Compression**: Shrinks 5–10MB camera uploads to ~120KB WebP files in under 500ms using the HTML5 Canvas API before uploading.
* **Direct WhatsApp Deal Bridge**: Instant click-to-chat links with pre-filled greetings, prices, and room numbers—no server chat maintenance required.
* **1-Click "Mark as Sold"**: Sellers toggle items sold with one tap; items immediately dim and exit the public marketplace feed.
* **"🎁 Free Stuff (₹0)" Tab (Hostel Karma)**: High-retention section for graduating seniors offloading hangers, laundry bags, and notebooks.
* **"🔍 Looking For (ISO)" Reverse Board**: Students post urgent requests (*"Need Casio fx-991EX calculator tonight for tomorrow's exam"*).
* **Admin Command & Research Center**:
  * Moderation queue for `AdminA` and `Admin1` to approve or reject items before they go live.
  * Private research ledger tracking average time-to-sell, category velocity, and private audit field notes.
  * 1-Click RFC-4180 CSV Dataset Export for academic research, reports, or pitch decks.
* **Commercial-Grade Security Architecture**:
  * PostgreSQL Row Level Security (RLS) policies.
  * Zod schema parsing and mass-assignment defense.
  * Cryptographic password hashing (`bcryptjs`).
  * Tamper-proof HTTP-Only JWT session cookies (`jose`).

---

## 🛠️ Tech Stack

* **Framework**: Next.js 15 (React 19) + TypeScript (App Router)
* **Styling**: Vanilla CSS (Chrono Dark Slate Design System)
* **Database & File Storage**: Supabase (PostgreSQL with RLS + Storage Bucket)
* **Security & Auth**: `zod` + `jose` + `bcryptjs`
* **Hosting & CI/CD**: Vercel + GitHub

---

## 📁 Project Structure

```text
hostelmart/
├── app/
│   ├── layout.tsx            # Root layout with fonts & metadata
│   ├── page.tsx              # Main marketplace feed & ISO reverse board
│   ├── sell/
│   │   └── page.tsx          # 3-step listing wizard with thumbnail grid
│   ├── my-ads/
│   │   └── page.tsx          # Seller dashboard with "Mark as Sold" toggle
│   └── admin/
│       └── page.tsx          # Protected Admin Command & Research Center
├── lib/
│   ├── auth.ts               # JWT signing & HTTP-only cookies
│   ├── compression.ts        # Client-side Canvas image compressor
│   ├── exportCsv.ts          # RFC-4180 CSV dataset exporter
│   ├── supabase.ts           # Supabase client instances
│   ├── validations.ts        # Zod input schemas & TS inference
│   └── whatsapp.ts           # WhatsApp deep-link builder
├── styles/
│   ├── globals.css           # Design tokens, reset, modal rules
│   ├── chrono-theme.css      # Dark slate palette, 4:3 cards
│   └── olx-components.css    # Mobile bottom navigation & badges
├── supabase/
│   └── schema.sql            # PostgreSQL DDL with RLS policies & seed admins
├── types/
│   └── index.ts              # TypeScript interface definitions
├── .env.example              # Environment variables template
├── .gitignore                # Protects secrets from Git
├── package.json              # Dependencies & scripts
└── tsconfig.json             # Strict TypeScript compiler options
```

---

## 📋 Getting Started

### 1. Set Up the Supabase Database
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Open the **SQL Editor** in the Supabase dashboard.
3. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**.
4. In **Storage**, create a new public bucket named `listing-images`.

### 2. Configure Local Environment
```bash
cp .env.example .env.local
```
Fill in your Supabase URL, Anon Key, and generate a 32+ character `JWT_SECRET_KEY`.

### 3. Install & Run Locally
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Git Setup & Vercel Deployment

Run the following commands inside the `hostelmart` directory:

```bash
cd c:\Users\pradh\Downloads\desktop-mate\hostelmart

# 1. Initialize Git Repository
git init
git add .
git commit -m "feat: initial commit of HostelMart production architecture"

# 2. Connect to your GitHub Repo
git branch -M main
git remote add origin https://github.com/<your-username>/hostelmart.git
git push -u origin main
```

### Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) $\rightarrow$ **"Add New Project"**.
2. Select your `hostelmart` repository.
3. Add your environment variables from `.env.local` to Vercel's Environment Variables settings.
4. Click **Deploy**. Your app is live with automatic CI/CD on every Git push!
