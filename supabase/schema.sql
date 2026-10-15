-- ====================================================================
-- HOSTELMART PRODUCTION DATABASE MIGRATION SCRIPT
-- PostgreSQL 15+ / Supabase Schema with Row Level Security (RLS)
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_status AS ENUM ('pending', 'active', 'sold', 'rejected', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE item_condition AS ENUM ('Like New', 'Gently Used', 'Well Used');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE item_category AS ENUM (
      'room_essentials', 
      'electronics', 
      'books_academics', 
      'mobility_fitness', 
      'clothing_fashion', 
      'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(40) UNIQUE NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  hostel_block VARCHAR(30) NOT NULL,
  room_number VARCHAR(10) NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role DEFAULT 'user',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  is_negotiable BOOLEAN DEFAULT FALSE,
  is_urgent BOOLEAN DEFAULT FALSE,
  condition item_condition DEFAULT 'Gently Used',
  category item_category NOT NULL,
  images TEXT[] NOT NULL CHECK (array_length(images, 1) >= 1 AND array_length(images, 1) <= 5),
  status listing_status DEFAULT 'pending',
  rejection_reason TEXT,
  view_count INTEGER DEFAULT 0,
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ISO (LOOKING FOR / WANTED) TABLE
CREATE TABLE IF NOT EXISTS public.iso_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  budget NUMERIC(10, 2) NOT NULL CHECK (budget >= 0),
  location VARCHAR(50) NOT NULL,
  urgency VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ADMIN RESEARCH & AUDIT NOTES TABLE
CREATE TABLE IF NOT EXISTS public.admin_research_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES public.users(id),
  note TEXT NOT NULL,
  time_to_sell_hours NUMERIC(8, 2),
  demand_rating INTEGER CHECK (demand_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iso_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_research_notes ENABLE ROW LEVEL SECURITY;

-- Listings: Public view active listings
DROP POLICY IF EXISTS "Public can view active listings" ON public.listings;
CREATE POLICY "Public can view active listings" 
  ON public.listings FOR SELECT 
  USING (status = 'active');

-- Listings: Sellers can view own listings (pending, active, sold)
DROP POLICY IF EXISTS "Sellers can view own listings" ON public.listings;
CREATE POLICY "Sellers can view own listings" 
  ON public.listings FOR SELECT 
  USING (auth.uid() = seller_id);

-- Listings: Sellers can update own listings (mark as sold)
DROP POLICY IF EXISTS "Sellers can update own listings" ON public.listings;
CREATE POLICY "Sellers can update own listings" 
  ON public.listings FOR UPDATE 
  USING (auth.uid() = seller_id);

-- ISO: Public can view active ISO requests
DROP POLICY IF EXISTS "Public can view active ISO" ON public.iso_requests;
CREATE POLICY "Public can view active ISO" 
  ON public.iso_requests FOR SELECT 
  USING (status = 'active');

-- Admins have full access to listings
DROP POLICY IF EXISTS "Admin full access to listings" ON public.listings;
CREATE POLICY "Admin full access to listings" 
  ON public.listings FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Admin research notes are strictly viewable and writable by admins
DROP POLICY IF EXISTS "Admin full access to research notes" ON public.admin_research_notes;
CREATE POLICY "Admin full access to research notes" 
  ON public.admin_research_notes FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 8. AUTOMATIC TIMESTAMP TRIGGERS
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_listings_timestamp ON public.listings;
CREATE TRIGGER trigger_update_listings_timestamp
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 9. SEED DATA (For Initial Pilot Testing)
INSERT INTO public.users (username, phone, hostel_block, room_number, password_hash, role, is_verified)
VALUES 
  ('AdminA', '9876543210', 'AdminBlock', '101', crypt('AdminPass@2026!', gen_salt('bf', 10)), 'admin', TRUE),
  ('Admin1', '9876543211', 'AdminBlock', '102', crypt('AdminPass@2026!', gen_salt('bf', 10)), 'admin', TRUE)
ON CONFLICT (username) DO NOTHING;
