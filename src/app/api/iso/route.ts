import { NextResponse } from 'next/server';
import type { ISORequest } from '@/types';

// In-memory server-side shared cache across all clients hitting the server
let sharedServerISO: ISORequest[] = [];

export async function GET() {
  return NextResponse.json({
    success: true,
    requests: sharedServerISO,
    count: sharedServerISO.length
  });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (data && data.id) {
      const existingIdx = sharedServerISO.findIndex(i => i.id === data.id);
      if (existingIdx >= 0) {
        sharedServerISO[existingIdx] = { ...sharedServerISO[existingIdx], ...data };
      } else {
        sharedServerISO.unshift(data);
      }
    } else if (Array.isArray(data)) {
      const map = new Map<string, ISORequest>();
      data.forEach(i => map.set(i.id, i));
      sharedServerISO.forEach(i => {
        if (!map.has(i.id)) map.set(i.id, i);
      });
      sharedServerISO = Array.from(map.values());
    }

    return NextResponse.json({
      success: true,
      requests: sharedServerISO,
      count: sharedServerISO.length
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to sync ISO requests';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (id) {
      sharedServerISO = sharedServerISO.filter(i => i.id !== id);
    }
    return NextResponse.json({ success: true, count: sharedServerISO.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete ISO request';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
