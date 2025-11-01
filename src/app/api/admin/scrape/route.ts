import { NextRequest, NextResponse } from 'next/server';

// Server-side proxy to the backend admin scrape endpoint
// This avoids exposing backend admin tokens to the browser.
export async function POST(_request: NextRequest) {
  try {
    // Auto-detect backend URL: use env or fallback to localhost:3001
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.BACKEND_PORT || '3001'}`;
    
    // Try multiple token sources with clear fallback
    const token = process.env.BACKEND_ADMIN_TOKEN || process.env.ADMIN_TOKEN || 'dev-auto-token';

    // Only fail if we're in production and no proper token is set
    if (!token || (process.env.NODE_ENV === 'production' && token === 'dev-auto-token')) {
      return NextResponse.json({ 
        success: false, 
        error: 'BACKEND_ADMIN_TOKEN not configured. Set it in Vercel env to match backend ADMIN_TOKEN.' 
      }, { status: 500 });
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
