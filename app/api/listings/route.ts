import { NextResponse } from 'next/server';
import type { Listing } from '@/types';

// In-memory server-side shared cache across all clients hitting the server
let sharedServerListings: Listing[] = [];

export async function GET() {
  return NextResponse.json({
    success: true,
    listings: sharedServerListings,
    count: sharedServerListings.length
  });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (data && data.id) {
      // Upsert single listing
      const existingIdx = sharedServerListings.findIndex(i => i.id === data.id);
      if (existingIdx >= 0) {
        sharedServerListings[existingIdx] = { ...sharedServerListings[existingIdx], ...data };
      } else {
        sharedServerListings.unshift(data);
      }
    } else if (Array.isArray(data)) {
      // Bulk merge
      const map = new Map<string, Listing>();
      data.forEach(i => map.set(i.id, i));
      sharedServerListings.forEach(i => {
        if (!map.has(i.id)) map.set(i.id, i);
      });
      sharedServerListings = Array.from(map.values());
    }

    return NextResponse.json({
      success: true,
      listings: sharedServerListings,
      count: sharedServerListings.length
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to sync listings';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (id) {
      sharedServerListings = sharedServerListings.filter(i => i.id !== id);
    }
    return NextResponse.json({ success: true, count: sharedServerListings.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete listing';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
