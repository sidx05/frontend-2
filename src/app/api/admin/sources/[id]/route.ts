import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Settings } from '@/models/Settings';

// Minimal handlers to ensure this route file is a module and avoid Next typegen errors.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // No dedicated backend GET-by-id; fall back to list filtering if needed later
    const { id } = await params;
    // For now, return 405 to avoid silent failures
    return NextResponse.json({ success: false, error: 'Not implemented' }, { status: 405 });
  } catch (err) {
    console.error('Error in admin/sources/[id] GET:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    let backendUrl = (process.env.BACKEND_URL || '').trim();
    let token = (process.env.BACKEND_ADMIN_TOKEN || process.env.ADMIN_TOKEN || '').trim();
    if (!backendUrl || !token) {
      try {
        await connectDB();
        const settings = (await Settings.findOne().lean()) as any;
        if (!backendUrl && settings?.integrations?.backendUrl) backendUrl = String(settings.integrations.backendUrl).trim();
        if (!token && settings?.integrations?.backendAdminToken) token = String(settings.integrations.backendAdminToken).trim();
      } catch {}
    }
    if (!backendUrl || !token) return NextResponse.json({ success: false, error: 'Backend URL/token not configured' }, { status: 500 });

    const body = await request.json();
    const payload = {
      name: body.name,
      url: body.url,
      rssUrls: body.rssUrls || (body.rssUrl ? [body.rssUrl] : undefined),
      lang: body.language || body.lang,
      categories: body.categories,
      active: body.active,
    };
    const { id } = await params;
    const res = await fetch(`${backendUrl.replace(/\/$/, '')}/admin/sources/${id}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.success) {
      return NextResponse.json({ success: false, error: json?.message || json?.error || 'Update failed' }, { status: res.status || 500 });
    }
    return NextResponse.json({ success: true, source: json.data || json.source });
  } catch (err) {
    console.error('Error in admin/sources/[id] PUT:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    let backendUrl = (process.env.BACKEND_URL || '').trim();
    let token = (process.env.BACKEND_ADMIN_TOKEN || process.env.ADMIN_TOKEN || '').trim();
    if (!backendUrl || !token) {
      try {
        await connectDB();
        const settings = (await Settings.findOne().lean()) as any;
        if (!backendUrl && settings?.integrations?.backendUrl) backendUrl = String(settings.integrations.backendUrl).trim();
        if (!token && settings?.integrations?.backendAdminToken) token = String(settings.integrations.backendAdminToken).trim();
      } catch {}
    }
    if (!backendUrl || !token) return NextResponse.json({ success: false, error: 'Backend URL/token not configured' }, { status: 500 });

    const { id } = await params;
    const res = await fetch(`${backendUrl.replace(/\/$/, '')}/admin/sources/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.success) {
      return NextResponse.json({ success: false, error: json?.message || json?.error || 'Delete failed' }, { status: res.status || 500 });
    }
    return NextResponse.json({ success: true, message: json?.message || 'Deleted' });
  } catch (err) {
    console.error('Error in admin/sources/[id] DELETE:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
