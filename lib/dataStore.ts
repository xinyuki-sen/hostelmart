// ====================================================================
// HOSTELMART COMMERCIAL DATA STORE
// Unified Hybrid Store: Supabase Cloud Database + High-Performance Local Cache
// Real-time Event Dispatcher for Cross-Component & Cross-Tab Reactivity
// ====================================================================

import type { Listing, ISORequest, ListingStatus } from '@/types';
import { supabase } from '@/lib/supabase';

const LISTINGS_STORAGE_KEY = 'hostelmart_listings_v2';
const ISO_STORAGE_KEY = 'hostelmart_iso_v2';
const EVENT_DATA_CHANGED = 'hostelmart_data_changed';

export const SEED_LISTINGS: Listing[] = [];
export const SEED_ISO: ISORequest[] = [];

const DEMO_LISTING_IDS = new Set(['101', '102', '103', '104', '105']);
const DEMO_ISO_IDS = new Set(['iso-1', 'iso-2']);

// Helper: dispatch cross-component refresh event
function notifyStoreChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_DATA_CHANGED));
  }
}

// Check if Supabase credentials are valid
function hasValidSupabase(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url && 
    !url.includes('placeholder') && 
    key && 
    !key.includes('placeholder') && 
    !key.includes('your_copied')
  );
}

// --------------------------------------------------------------------
// 1. LISTINGS API
// --------------------------------------------------------------------

/**
 * Fetch all listings from Local Storage or Supabase
 */
export async function getStoredListings(): Promise<Listing[]> {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(LISTINGS_STORAGE_KEY);
    if (raw) {
      const parsed: Listing[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Strip out any previously seeded demo items
        const clean = parsed.filter(item => !DEMO_LISTING_IDS.has(item.id));
        if (clean.length !== parsed.length) {
          saveListingsToLocal(clean);
        }
        return clean;
      }
    }
  } catch (err) {
    console.warn('[HostelMart] Failed to read from localStorage:', err);
  }

  return [];
}

function saveListingsToLocal(listings: Listing[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(listings));
    notifyStoreChanged();
  } catch (err) {
    console.error('[HostelMart] Failed to write listings to localStorage:', err);
  }
}

/**
 * Create a new listing with 'pending' status for Supervisor Verification
 */
export async function createListing(item: {
  title: string;
  category: Listing['category'];
  condition: Listing['condition'];
  price: number;
  hostelBlock: string;
  roomNumber: string;
  description: string;
  isNegotiable: boolean;
  isUrgent: boolean;
  images: string[];
  sellerName?: string;
  sellerPhone?: string;
  sellerId?: string;
}): Promise<Listing> {
  const currentListings = await getStoredListings();
  const id = `list-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const newListing: Listing = {
    id,
    sellerId: item.sellerId || 'u-local-student',
    sellerName: item.sellerName || 'student_resident',
    sellerPhone: item.sellerPhone || '9876543210',
    hostelBlock: item.hostelBlock,
    roomNumber: item.roomNumber,
    title: item.title,
    description: item.description,
    price: Number(item.price),
    isNegotiable: item.isNegotiable,
    isUrgent: item.isUrgent,
    condition: item.condition,
    category: item.category,
    images: item.images.length > 0 ? item.images : [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'pending', // Awaiting Admin Approval
    timeAgo: 'Just now',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updated = [newListing, ...currentListings];
  saveListingsToLocal(updated);

  // Sync with Supabase asynchronously if configured
  if (hasValidSupabase()) {
    try {
      supabase.from('listings').insert([{
        id: newListing.id,
        title: newListing.title,
        description: newListing.description,
        price: newListing.price,
        is_negotiable: newListing.isNegotiable,
        is_urgent: newListing.isUrgent,
        condition: newListing.condition,
        category: newListing.category,
        images: newListing.images,
        status: 'pending'
      }]).then(() => {});
    } catch {
      // Graceful fallback to local
    }
  }

  return newListing;
}

/**
 * Update listing status (e.g. Admin approving to 'active' or rejecting)
 */
export async function updateListingStatus(
  id: string, 
  newStatus: ListingStatus, 
  rejectionReason?: string
): Promise<Listing[]> {
  const listings = await getStoredListings();
  const updated = listings.map(item => {
    if (item.id === id) {
      return {
        ...item,
        status: newStatus,
        rejectionReason: rejectionReason || item.rejectionReason,
        updatedAt: new Date().toISOString()
      };
    }
    return item;
  });

  saveListingsToLocal(updated);

  if (hasValidSupabase()) {
    try {
      supabase.from('listings').update({
        status: newStatus,
        rejection_reason: rejectionReason,
        updated_at: new Date().toISOString()
      }).eq('id', id).then(() => {});
    } catch {
      // Graceful fallback
    }
  }

  return updated;
}

/**
 * Save private supervisor research notes
 */
export async function updateListingAdminNote(id: string, note: string): Promise<Listing[]> {
  const listings = await getStoredListings();
  const updated = listings.map(item => {
    if (item.id === id) {
      return {
        ...item,
        adminNote: note,
        updatedAt: new Date().toISOString()
      };
    }
    return item;
  });

  saveListingsToLocal(updated);
  return updated;
}

/**
 * Toggle listing between 'sold' and 'active'
 */
export async function toggleSoldStatus(id: string): Promise<ListingStatus> {
  const listings = await getStoredListings();
  let nextStatus: ListingStatus = 'active';

  const updated = listings.map(item => {
    if (item.id === id) {
      nextStatus = item.status === 'sold' ? 'active' : 'sold';
      return {
        ...item,
        status: nextStatus,
        soldAt: nextStatus === 'sold' ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString()
      };
    }
    return item;
  });

  saveListingsToLocal(updated);
  return nextStatus;
}

/**
 * Delete a listing
 */
export async function deleteListing(id: string): Promise<Listing[]> {
  const listings = await getStoredListings();
  const updated = listings.filter(item => item.id !== id);
  saveListingsToLocal(updated);
  return updated;
}

// --------------------------------------------------------------------
// 2. ISO (LOOKING FOR / WANTED) API
// --------------------------------------------------------------------

export async function getStoredISORequests(): Promise<ISORequest[]> {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(ISO_STORAGE_KEY);
    if (raw) {
      const parsed: ISORequest[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const clean = parsed.filter(item => !DEMO_ISO_IDS.has(item.id));
        if (clean.length !== parsed.length) {
          saveISOToLocal(clean);
        }
        return clean;
      }
    }
  } catch (err) {
    console.warn('[HostelMart] Failed to read ISO requests:', err);
  }

  return [];
}

function saveISOToLocal(requests: ISORequest[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ISO_STORAGE_KEY, JSON.stringify(requests));
    notifyStoreChanged();
  } catch (err) {
    console.error('[HostelMart] Failed to write ISO requests:', err);
  }
}

export async function createISORequest(req: {
  title: string;
  budget: number;
  location: string;
  urgency: string;
  requesterName?: string;
  requesterPhone?: string;
}): Promise<ISORequest> {
  const current = await getStoredISORequests();
  const newReq: ISORequest = {
    id: `iso-${Date.now()}`,
    requesterId: 'u-local-student',
    requesterName: req.requesterName || 'student_resident',
    requesterPhone: req.requesterPhone || '9876543210',
    title: req.title,
    budget: Number(req.budget),
    location: req.location,
    urgency: req.urgency,
    status: 'active',
    createdAt: 'Just now'
  };

  const updated = [newReq, ...current];
  saveISOToLocal(updated);
  return newReq;
}

// --------------------------------------------------------------------
// 3. REACTIVITY SUBSCRIPTION
// --------------------------------------------------------------------

export function subscribeToStore(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustom = () => callback();
  const handleStorage = (e: StorageEvent) => {
    if (e.key === LISTINGS_STORAGE_KEY || e.key === ISO_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(EVENT_DATA_CHANGED, handleCustom);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(EVENT_DATA_CHANGED, handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
}
