import { NextRequest, NextResponse } from 'next/server';

// Server-side proxy to the backend admin scrape endpoint
// This avoids exposing backend admin tokens to the browser.
export async function POST(_request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.BACKEND_PORT || '3001'}`;
    const token = process.env.BACKEND_ADMIN_TOKEN || process.env.ADMIN_TOKEN;

    if (!backendUrl) {
      return NextResponse.json({ success: false, error: 'BACKEND_URL not configured' }, { status: 500 });
    }
    if (!token) {
      return NextResponse.json({ success: false, error: 'BACKEND_ADMIN_TOKEN or ADMIN_TOKEN not configured' }, { status: 500 });
    }

    const res = await fetch(`${backendUrl.replace(/\/$/, '')}/admin/scrape`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      // Optionally pass a body if needed later
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ success: false, error: json?.error || 'Backend scrape failed' }, { status: res.status });
    }

    return NextResponse.json(json);
  } catch (err: any) {
    console.error('Error proxying scrape:', err);
    return NextResponse.json({ success: false, error: 'Failed to trigger scraping' }, { status: 500 });
  }
}
