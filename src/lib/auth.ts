// ====================================================================
// HOSTELMART AUTH & SESSION SECURITY
// Cryptographically signed JWT tokens via jose + HTTP-Only Cookie rules
// ====================================================================

import { SignJWT, jwtVerify } from 'jose';
import type { UserRole, UserSession } from '@/types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || 'hostelmart_dev_fallback_secret_must_change_in_production_32chars!'
);

const TOKEN_EXPIRY = '7d';

export async function createSessionToken(payload: UserSession): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions(token: string) {
  return {
    name: 'hostelmart_session',
    value: token,
    httpOnly: true, // Immune to JavaScript access (Anti-XSS)
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  };
}

export function assertIsAdmin(session: UserSession | null): boolean {
  return session !== null && session.role === 'admin';
}
