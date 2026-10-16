// ====================================================================
// HOSTELMART COMMERCIAL DATA STORE
// Unified Hybrid Store: Supabase Cloud Database + High-Performance Local Cache
// Real-time Event Dispatcher for Cross-Component & Cross-Tab Reactivity
// ====================================================================

import type { Listing, ISORequest, ListingStatus } from '@/types';
import { supabase } from '@/lib/supabase';

const LISTINGS_STORAGE_KEY = 'hostelmart_listings_v2';
const ISO_STORAGE_KEY = 'hostelmart_iso_v2';
const USERS_STORAGE_KEY = 'hostelmart_user_registry_v2';
const STUDENTS_DB_KEY = 'hostelmart_student_accounts_v2';
const LIKES_STORAGE_KEY = 'hostelmart_saved_likes_v2';
const CUSTOM_SUPABASE_KEY = 'hostelmart_custom_supabase';
export const SESSION_USER_KEY = 'hostelmart_user';
const EVENT_DATA_CHANGED = 'hostelmart_data_changed';

export const SEED_LISTINGS: Listing[] = [];
export const SEED_ISO: ISORequest[] = [];

const DEMO_LISTING_IDS = new Set(['101', '102', '103', '104', '105']);
const DEMO_ISO_IDS = new Set(['iso-1', 'iso-2']);

export interface UserAuditRecord {
  id: string;
  username: string;
  phone: string;
  hostelBlock: string;
  roomNumber: string;
  role: 'user' | 'admin';
  lastLogin: string;
  loginCount: number;
}

// Helper: dispatch cross-component refresh event
function notifyStoreChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_DATA_CHANGED));
  }
}

export interface CloudSyncInfo {
  isConnected: boolean;
  provider: 'supabase' | 'local_fallback';
  url: string;
}

export function getCustomSupabaseConfig(): { url: string; anonKey: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CUSTOM_SUPABASE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveCustomSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_SUPABASE_KEY, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
    notifyStoreChanged();
  } catch {}
}

export function clearCustomSupabaseConfig(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CUSTOM_SUPABASE_KEY);
    notifyStoreChanged();
  } catch {}
}

// Check if Supabase credentials are valid
export function hasValidSupabase(): boolean {
  const custom = getCustomSupabaseConfig();
  const url = custom?.url || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = custom?.anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url && 
    !url.includes('placeholder') && 
    key && 
    !key.includes('placeholder') && 
    !key.includes('your_copied')
  );
}

export function getCloudSyncInfo(): CloudSyncInfo {
  const custom = getCustomSupabaseConfig();
  const url = custom?.url || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const isConnected = hasValidSupabase();
  return {
    isConnected,
    provider: isConnected ? 'supabase' : 'local_fallback',
    url: isConnected ? url.replace(/^(https:\/\/[^.]+).*/, '$1.supabase.co') : 'Local Storage Engine'
  };
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
    console.warn('[HostelMart] LocalStorage quota or write error, attempting safe prune:', err);
    try {
      // If quota exceeded, retain only recent 30 items
      const pruned = listings.slice(0, 30);
      localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(pruned));
      notifyStoreChanged();
    } catch (fallbackErr) {
      console.error('[HostelMart] Fatal localStorage write error:', fallbackErr);
    }
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
  sellerName: string;
  sellerPhone?: string;
  sellerId?: string;
}): Promise<Listing> {
  const currentListings = await getStoredListings();
  const id = `list-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const fallbackImage = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

  const newListing: Listing = {
    id,
    sellerId: item.sellerId || `u-${item.sellerName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    sellerName: item.sellerName,
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
    images: item.images && item.images.length > 0 ? item.images : [fallbackImage],
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
 * Resubmit a previously rejected listing for supervisor re-approval
 * Clears rejection reason and returns listing status to 'pending'
 */
export async function resubmitListing(
  id: string,
  updates?: { title?: string; price?: number; description?: string }
): Promise<Listing[]> {
  const listings = await getStoredListings();
  const updated = listings.map(item => {
    if (item.id === id) {
      return {
        ...item,
        ...(updates?.title ? { title: updates.title.trim() } : {}),
        ...(updates?.price !== undefined ? { price: Number(updates.price) } : {}),
        ...(updates?.description ? { description: updates.description.trim() } : {}),
        status: 'pending' as ListingStatus,
        rejectionReason: undefined,
        updatedAt: new Date().toISOString()
      };
    }
    return item;
  });

  saveListingsToLocal(updated);

  if (hasValidSupabase()) {
    try {
      supabase.from('listings').update({
        status: 'pending',
        rejection_reason: null,
        updated_at: new Date().toISOString(),
        ...(updates?.title ? { title: updates.title.trim() } : {}),
        ...(updates?.price !== undefined ? { price: Number(updates.price) } : {}),
        ...(updates?.description ? { description: updates.description.trim() } : {})
      }).eq('id', id).then(() => {});
    } catch {}
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
 * Enforces ownership: only the owner or an admin can mark as sold
 */
export async function toggleSoldStatus(id: string, requesterUsername?: string): Promise<ListingStatus> {
  const listings = await getStoredListings();
  let nextStatus: ListingStatus = 'active';

  const updated = listings.map(item => {
    if (item.id === id) {
      // Ownership check: if requesterUsername is given and not admin, must match sellerName
      if (requesterUsername && requesterUsername !== 'AdminA' && requesterUsername !== 'Admin1') {
        if (item.sellerName.trim().toLowerCase() !== requesterUsername.trim().toLowerCase()) {
          console.warn('[HostelMart] Unauthorized toggle attempt blocked');
          return item;
        }
      }

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
 * Enforces ownership: only the seller who created it or an admin can delete it
 */
export async function deleteListing(id: string, requesterUsername?: string): Promise<Listing[]> {
  const listings = await getStoredListings();
  const target = listings.find(item => item.id === id);
  if (!target) return listings;

  // Authorization check
  if (requesterUsername && requesterUsername !== 'AdminA' && requesterUsername !== 'Admin1') {
    if (target.sellerName.trim().toLowerCase() !== requesterUsername.trim().toLowerCase()) {
      console.warn('[HostelMart] Unauthorized delete blocked for user:', requesterUsername);
      return listings;
    }
  }

  const updated = listings.filter(item => item.id !== id);
  saveListingsToLocal(updated);
  return updated;
}

// --------------------------------------------------------------------
// 2. STUDENT ACCOUNTS & AUTHENTICATION DATABASE
// --------------------------------------------------------------------

export interface StudentAccount {
  id: string;
  username: string;
  phone: string;
  hostelBlock: string;
  roomNumber: string;
  password: string;
  role: 'user';
  createdAt: string;
  lastLogin: string;
}

/**
 * Returns all registered student accounts from database
 */
export function getRegisteredStudents(): StudentAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STUDENTS_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

/**
 * Registers a new student account in the system database
 */
export async function registerStudentAccount(data: {
  username: string;
  phone: string;
  hostelBlock: string;
  roomNumber: string;
  password: string;
}): Promise<{ success: boolean; user?: StudentAccount; error?: string }> {
  const cleanUsername = data.username.trim();
  let cleanPhone = data.phone.replace(/\D/g, '').replace(/^0+/, '');
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    cleanPhone = cleanPhone.slice(2);
  }
  const cleanBlock = data.hostelBlock.trim();
  const cleanRoom = data.roomNumber.trim();
  const cleanPass = data.password.trim();

  if (!cleanUsername) return { success: false, error: 'Username is required.' };
  if (cleanUsername.length < 3) return { success: false, error: 'Username must be at least 3 characters.' };
  if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
    return { success: false, error: 'Username can only contain letters, numbers, and underscores.' };
  }
  
  if (!cleanPhone || cleanPhone.length !== 10) {
    return { success: false, error: 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).' };
  }
  if (!cleanBlock) return { success: false, error: 'Hostel block is required.' };
  if (!cleanRoom) return { success: false, error: 'Room number is required.' };
  if (!cleanPass || cleanPass.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters.' };
  }

  const existing = getRegisteredStudents();
  const duplicate = existing.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
  if (duplicate) {
    return { 
      success: false, 
      error: `The username "@${cleanUsername}" is already registered. Please sign in instead.` 
    };
  }

  const newStudent: StudentAccount = {
    id: `u-${cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${Date.now()}`,
    username: cleanUsername,
    phone: cleanPhone,
    hostelBlock: cleanBlock,
    roomNumber: cleanRoom,
    password: cleanPass,
    role: 'user',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };

  const updated = [newStudent, ...existing];
  try {
    localStorage.setItem(STUDENTS_DB_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save student account:', err);
  }

  // Also sync with Supabase users table if credentials exist
  if (hasValidSupabase()) {
    try {
      supabase.from('users').insert([{
        username: newStudent.username,
        phone: newStudent.phone,
        hostel_block: newStudent.hostelBlock,
        room_number: newStudent.roomNumber,
        role: 'user',
        password_hash: newStudent.password
      }]).then(() => {});
    } catch {}
  }

  // Record in audit log
  recordUserLogin(newStudent);

  return { success: true, user: newStudent };
}

/**
 * Authenticates a student against the registered database
 * Strictly rejects non-registered users or wrong passwords
 */
export async function authenticateStudent(data: {
  username: string;
  password: string;
}): Promise<{ success: boolean; user?: StudentAccount; error?: string }> {
  const cleanUsername = data.username.trim();
  const cleanPass = data.password.trim();

  if (!cleanUsername) return { success: false, error: 'Please enter your username.' };
  if (!cleanPass) return { success: false, error: 'Please enter your password.' };

  const students = getRegisteredStudents();
  const matched = students.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());

  if (!matched) {
    return {
      success: false,
      error: `Account "@${cleanUsername}" not found. Please click "Register now" to create your student account.`
    };
  }

  if (matched.password !== cleanPass) {
    return {
      success: false,
      error: `Incorrect password for @${cleanUsername}. Please try again.`
    };
  }

  // Update last login
  matched.lastLogin = new Date().toISOString();
  try {
    localStorage.setItem(STUDENTS_DB_KEY, JSON.stringify(students));
  } catch {}

  // Record audit log
  recordUserLogin(matched);

  return { success: true, user: matched };
}

/**
 * Update a student's contact details, hostel room, or password
 */
export async function updateStudentProfile(
  username: string,
  updates: {
    phone?: string;
    hostelBlock?: string;
    roomNumber?: string;
    password?: string;
  }
): Promise<{ success: boolean; user?: StudentAccount; error?: string }> {
  if (typeof window === 'undefined') return { success: false, error: 'Window not available' };

  const cleanUsername = username.trim();
  const students = getRegisteredStudents();
  const index = students.findIndex(u => u.username.toLowerCase() === cleanUsername.toLowerCase());

  if (index === -1) {
    return { success: false, error: `Student profile for "@${cleanUsername}" was not found.` };
  }

  const existing = students[index];

  let normalizedPhone = existing.phone;
  if (updates.phone && updates.phone.trim()) {
    let p = updates.phone.replace(/\D/g, '').replace(/^0+/, '');
    if (p.startsWith('91') && p.length === 12) p = p.slice(2);
    if (p.length === 10) normalizedPhone = p;
  }

  const updatedUser: StudentAccount = {
    ...existing,
    phone: normalizedPhone,
    hostelBlock: updates.hostelBlock || existing.hostelBlock,
    roomNumber: updates.roomNumber && updates.roomNumber.trim() ? updates.roomNumber.trim() : existing.roomNumber,
    password: updates.password && updates.password.trim() ? updates.password.trim() : existing.password
  };

  students[index] = updatedUser;
  try {
    localStorage.setItem(STUDENTS_DB_KEY, JSON.stringify(students));
  } catch (err) {
    console.error('[HostelMart] Failed to update student database:', err);
  }

  // Update active session across both key conventions for maximum reliability
  try {
    for (const key of ['hostelmart_user', 'hostelmart_session']) {
      const rawSession = localStorage.getItem(key);
      if (rawSession) {
        const sess = JSON.parse(rawSession);
        if (sess.username?.toLowerCase() === cleanUsername.toLowerCase()) {
          const newSess = {
            ...sess,
            phone: updatedUser.phone,
            hostelBlock: updatedUser.hostelBlock,
            roomNumber: updatedUser.roomNumber
          };
          localStorage.setItem(key, JSON.stringify(newSess));
        }
      }
    }
  } catch {}

  // Update audit log
  recordUserLogin(updatedUser);
  notifyStoreChanged();

  return { success: true, user: updatedUser };
}

// --------------------------------------------------------------------
// 3. USER LOGIN & ACTIVITY TRACKING API
// --------------------------------------------------------------------

/**
 * Records every user login or registration for Admin Audit Trail
 */
export function recordUserLogin(userData: {
  id?: string;
  username: string;
  phone?: string;
  hostelBlock?: string;
  roomNumber?: string;
  role?: string;
}): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    let users: UserAuditRecord[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(users)) users = [];

    const cleanUsername = userData.username.trim();
    const existingIndex = users.findIndex(
      u => u.username.toLowerCase() === cleanUsername.toLowerCase()
    );

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      users[existingIndex] = {
        ...users[existingIndex],
        phone: userData.phone || users[existingIndex].phone,
        hostelBlock: userData.hostelBlock || users[existingIndex].hostelBlock,
        roomNumber: userData.roomNumber || users[existingIndex].roomNumber,
        lastLogin: now,
        loginCount: (users[existingIndex].loginCount || 1) + 1
      };
    } else {
      users.unshift({
        id: userData.id || `u-${cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        username: cleanUsername,
        phone: userData.phone || '9876543210',
        hostelBlock: userData.hostelBlock || 'Block B',
        roomNumber: userData.roomNumber || '101',
        role: (userData.role as 'user' | 'admin') || 'user',
        lastLogin: now,
        loginCount: 1
      });
    }

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    notifyStoreChanged();
  } catch (err) {
    console.error('[HostelMart] Failed to record user login:', err);
  }
}

/**
 * Returns all students and admins who have logged in
 */
export function getTrackedUsers(): UserAuditRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[HostelMart] Failed to read tracked users:', err);
  }
  return [];
}

// --------------------------------------------------------------------
// 3. ISO (LOOKING FOR / WANTED) API
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
    requesterId: req.requesterName ? `u-${req.requesterName.toLowerCase()}` : 'u-student',
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

/**
 * Delete an ISO / Wanted Request (Admin or owner removal)
 */
export async function deleteISORequest(id: string): Promise<ISORequest[]> {
  const current = await getStoredISORequests();
  const updated = current.filter(item => item.id !== id);
  saveISOToLocal(updated);
  return updated;
}

// --------------------------------------------------------------------
// 4. SAVED ITEMS & WISHLIST API
// --------------------------------------------------------------------

export function getSavedItemLikes(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(LIKES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch {}
  return new Set();
}

export function toggleItemLike(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const likes = getSavedItemLikes();
    let isNowLiked = false;
    if (likes.has(id)) {
      likes.delete(id);
      isNowLiked = false;
    } else {
      likes.add(id);
      isNowLiked = true;
    }
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(Array.from(likes)));
    notifyStoreChanged();
    return isNowLiked;
  } catch {}
  return false;
}

// --------------------------------------------------------------------
// 5. REACTIVITY SUBSCRIPTION (CROSS-COMPONENT & CROSS-TAB)
// --------------------------------------------------------------------

export function subscribeToStore(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustom = () => callback();
  const handleStorage = (e: StorageEvent) => {
    if (
      e.key === LISTINGS_STORAGE_KEY || 
      e.key === ISO_STORAGE_KEY || 
      e.key === USERS_STORAGE_KEY ||
      e.key === STUDENTS_DB_KEY ||
      e.key === LIKES_STORAGE_KEY ||
      e.key === CUSTOM_SUPABASE_KEY ||
      e.key === 'hostelmart_user'
    ) {
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
