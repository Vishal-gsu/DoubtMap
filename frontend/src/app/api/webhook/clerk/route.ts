import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    // Forward the webhook event to backend to sync users
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl) {
      await fetch(`${backendUrl}/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    return NextResponse.json({ status: 'ok' });
  } catch {
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
