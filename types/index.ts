// ====================================================================
// HOSTELMART TYPESCRIPT DEFINITIONS
// Complete type safety for database records, session states & API payloads
// ====================================================================

export type UserRole = 'user' | 'admin';

export type ListingStatus = 'pending' | 'active' | 'sold' | 'rejected' | 'archived';

export type ItemCondition = 'Like New' | 'Gently Used' | 'Well Used';

export type ItemCategory = 
  | 'room_essentials'
  | 'electronics'
  | 'books_academics'
  | 'mobility_fitness'
  | 'clothing_fashion'
  | 'other';

export interface User {
  id: string;
  username: string;
  phone: string;
  hostelBlock: string;
  roomNumber: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
}

export interface UserSession {
  userId: string;
  username: string;
  role: UserRole;
  hostelBlock: string;
  roomNumber: string;
}

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  hostelBlock: string;
  roomNumber: string;
  title: string;
  description: string;
  price: number; // 0 indicates Free Hostel Karma
  isNegotiable: boolean;
  isUrgent?: boolean; // 48h Moving Out clearance
  condition: ItemCondition;
  category: ItemCategory;
  images: string[];
  status: ListingStatus;
  rejectionReason?: string;
  viewCount?: number;
  adminNote?: string;
  timeAgo?: string;
  isLiked?: boolean;
  soldAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ISORequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterPhone: string;
  title: string;
  budget: number;
  location: string;
  urgency: string;
  status: 'active' | 'fulfilled' | 'closed';
  createdAt: string;
}

export interface AdminResearchRecord {
  id: string;
  listingId: string;
  itemTitle: string;
  price: number;
  category: ItemCategory;
  status: ListingStatus;
  timeToSellHours: number | null;
  adminNotes: string;
  demandRating?: number;
  createdAt: string;
}
