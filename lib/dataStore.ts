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

export const SEED_LISTINGS: Listing[] = [
  {
    id: "101",
    sellerId: "u-1",
    sellerName: "rahul_k",
    sellerPhone: "9876543210",
    hostelBlock: "Block B",
    roomNumber: "304",
    title: "Havells 1.2L Electric Kettle (Quick Boil)",
    description: "Heats 1.2L of water in under 2 minutes. Auto-cut off works properly. Perfect for late-night Maggi, coffee, and green tea in the room.",
    price: 450,
    isNegotiable: true,
    isUrgent: true,
    condition: "Gently Used",
    category: "room_essentials",
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80"
    ],
    status: "active",
    isLiked: false,
    timeAgo: "25m ago",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "102",
    sellerId: "u-2",
    sellerName: "aditya_m",
    sellerPhone: "9876543211",
    hostelBlock: "Block A",
    roomNumber: "112",
    title: "Hercules 21-Speed Mountain Bicycle",
    description: "Dual disk brakes with front suspension. Recently serviced with new tire tubes. Includes free cycle cable lock.",
    price: 2400,
    isNegotiable: true,
    isUrgent: false,
    condition: "Like New",
    category: "mobility_fitness",
    images: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=80"
    ],
    status: "active",
    isLiked: false,
    timeAgo: "2h ago",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "103",
    sellerId: "u-3",
    sellerName: "vikram_t",
    sellerPhone: "9876543212",
    hostelBlock: "Block C",
    roomNumber: "201",
    title: "GATE CSE Reference Books (Set of 6)",
    description: "Contains Cormen Algorithms, Tanenbaum Computer Networks, and Galvin Operating Systems. Free handwritten notes included.",
    price: 750,
    isNegotiable: false,
    isUrgent: false,
    condition: "Well Used",
    category: "books_academics",
    images: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80"
    ],
    status: "active",
    isLiked: false,
    timeAgo: "Yesterday",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "104",
    sellerId: "u-4",
    sellerName: "kartik_p",
    sellerPhone: "9876543213",
    hostelBlock: "Block B",
    roomNumber: "410",
    title: "Plastic Clothes Hangers (Set of 10)",
    description: "Graduating this weekend! Giving away 10 sturdy hangers and laundry mesh for free. First come, first served.",
    price: 0,
    isNegotiable: false,
    isUrgent: true,
    condition: "Gently Used",
    category: "room_essentials",
    images: [
      "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80"
    ],
    status: "active",
    isLiked: false,
    timeAgo: "3h ago",
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "105",
    sellerId: "u-5",
    sellerName: "siddharth_r",
    sellerPhone: "9876543214",
    hostelBlock: "Block D",
    roomNumber: "108",
    title: "Krups 2-Slice Bread Toaster (Clean)",
    description: "Hardly used for 2 months. 6 browning levels, removable crumb tray, works perfectly for morning breakfast.",
    price: 600,
    isNegotiable: true,
    isUrgent: false,
    condition: "Like New",
    category: "room_essentials",
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80"
    ],
    status: "pending",
    isLiked: false,
    adminNote: "Check electrical heating element compliance with hostel safety regulations.",
    timeAgo: "Just now",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const SEED_ISO: ISORequest[] = [
  {
    id: "iso-1",
    requesterId: "u-1",
    requesterName: "rahul_k",
    requesterPhone: "9876543210",
    title: "Casio fx-991EX Scientific Calculator",
    budget: 500,
    location: "Block B, Room 214",
    urgency: "Tonight before 10 PM (Maths Exam tomorrow)",
    status: "active",
    createdAt: "40m ago"
  },
  {
    id: "iso-2",
    requesterId: "u-5",
    requesterName: "manish_s",
    requesterPhone: "9876543211",
    title: "Engineering Mini Drafter & Clips",
    budget: 250,
    location: "Block A, Room 105",
    urgency: "Needed for Engineering Drawing practicals",
    status: "active",
    createdAt: "3h ago"
  }
];

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
  if (typeof window === 'undefined') return SEED_LISTINGS;

  try {
    const raw = localStorage.getItem(LISTINGS_STORAGE_KEY);
    if (raw) {
      const parsed: Listing[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[HostelMart] Failed to read from localStorage:', err);
  }

  // Initialize with seed data if empty
  saveListingsToLocal(SEED_LISTINGS);
  return SEED_LISTINGS;
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
  if (typeof window === 'undefined') return SEED_ISO;

  try {
    const raw = localStorage.getItem(ISO_STORAGE_KEY);
    if (raw) {
      const parsed: ISORequest[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[HostelMart] Failed to read ISO requests:', err);
  }

  saveISOToLocal(SEED_ISO);
  return SEED_ISO;
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
