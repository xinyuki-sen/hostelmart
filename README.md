# HostelMart

Hyper-local campus corridor marketplace enabling room-to-room student commerce with zero shipping overhead.

## What It Does

HostelMart lets hostel students buy and sell items (textbooks, electronics, furniture) directly within their campus. Sellers list items with photos, buyers browse by category, and deals are closed instantly via WhatsApp — no shipping fees, no middlemen.

## Key Features

- **Zero-cost WhatsApp handoff** — clicking "Contact Seller" opens a pre-filled WhatsApp message for direct negotiation
- **Client-side image compression** — uses HTML5 Canvas to resize photos before upload, eliminating cloud storage bloat
- **Room verification** — sellers are tied to real hostel rooms for trust and proximity
- **Admin dashboard** — moderation panel for reviewing and managing listings
- **ISO (In Search Of) board** — buyers can post requests for items they need

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Styling | Custom CSS with Chrono theme |
| Deployment | Vercel |

## Project Structure

```
src/
├── app/             Pages: home, sell, login, my-ads, admin
├── components/      ListingCard, ProductDetailModal, ISOModal, Sidebar
├── lib/             Supabase client, auth, compression, WhatsApp, validations
├── styles/          Global styles and component-specific CSS
└── types/           TypeScript type definitions
supabase/
└── schema.sql       Database schema
```

## Getting Started

```bash
npm install
cp .env.example .env.local  # Add Supabase URL and anon key
npm run dev
```

## License

MIT
