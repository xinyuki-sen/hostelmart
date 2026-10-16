// ====================================================================
// HOSTELMART ZOD VALIDATION SCHEMAS
// Enforces input safety, prevents mass-assignment, and derives TS types
// ====================================================================

import { z } from 'zod';

export const RegisterSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  hostelBlock: z
    .string()
    .trim()
    .min(1, "Hostel block is required")
    .max(30, "Hostel block name too long"),
  roomNumber: z
    .string()
    .trim()
    .min(1, "Room number is required")
    .max(10, "Room number too long"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long")
});

export const LoginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

export const ListingSubmissionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(80, "Title cannot exceed 80 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .min(0, "Price cannot be negative") // 0 is Free Giveaway
    .max(100000, "Price exceeds allowable limit"),
  isNegotiable: z.boolean().default(false),
  isUrgent: z.boolean().default(false),
  condition: z.enum(['Like New', 'Gently Used', 'Well Used']),
  category: z.enum([
    'room_essentials', 
    'electronics', 
    'books_academics', 
    'mobility_fitness', 
    'clothing_fashion', 
    'other'
  ]),
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least 1 image is required")
    .max(5, "Maximum 5 images allowed")
});

export const ISOSubmissionSchema = z.object({
  title: z.string().trim().min(3).max(80),
  budget: z.number().min(0).max(50000),
  location: z.string().trim().min(2).max(50),
  urgency: z.string().trim().min(2).max(100)
});

export const AdminActionSchema = z.object({
  listingId: z.string().uuid("Invalid listing ID"),
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().trim().max(300).optional()
});

export const AdminNoteSchema = z.object({
  listingId: z.string().uuid("Invalid listing ID"),
  note: z.string().trim().min(3).max(2000),
  demandRating: z.number().int().min(1).max(5).optional()
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ListingSubmissionInput = z.infer<typeof ListingSubmissionSchema>;
export type ISOSubmissionInput = z.infer<typeof ISOSubmissionSchema>;
