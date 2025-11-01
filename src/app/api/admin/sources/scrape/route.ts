import { NextRequest, NextResponse } from 'next/server';

// Proxy to backend /admin/scrape, forwarding the admin token as Bearer auth
export async function POST(request: NextRequest) {
  const backendBase = process.env.NEXT_PUBLIC_API_URL;
  if (!backendBase) {
    return NextResponse.json(
      { success: false, error: 'Backend URL not configured (NEXT_PUBLIC_API_URL)' },
      { status: 500 }
    );
  }

  try {
    const token = request.cookies.get('adminToken')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Missing admin token' }, { status: 401 });
    }

    const res = await fetch(`${backendBase}/admin/scrape`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ success: false, error: data?.error || 'Scrape failed' }, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying scrape:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to trigger scraping' },
      { status: 500 }
    );
  }
}

// Optional status proxy (not implemented on backend by default)
export async function GET(request: NextRequest) {
  return NextResponse.json({ success: false, error: 'Not implemented' }, { status: 501 });
}
