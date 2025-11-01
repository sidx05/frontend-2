import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Settings } from '@/models/Settings';

// GET /api/admin/sources - Get all sources
export async function GET() {
  try {
    // Prefer calling backend to avoid direct DB access from Vercel
    let backendUrl = (process.env.BACKEND_URL || '').trim();
    let token = (process.env.BACKEND_ADMIN_TOKEN || process.env.ADMIN_TOKEN || '').trim();

    if (!backendUrl || !token) {
      try {
        await connectDB();
        const settings = (await Settings.findOne().lean()) as any;
        if (!backendUrl && settings?.integrations?.backendUrl) backendUrl = String(settings.integrations.backendUrl).trim();
        if (!token && settings?.integrations?.backendAdminToken) token = String(settings.integrations.backendAdminToken).trim();
      } catch {
        // ignore; if still missing we'll error below
      }
    }

    if (!backendUrl || !token) {
      return NextResponse.json({ success: false, error: 'Backend URL/token not configured' }, { status: 500 });
    }

    const res = await fetch(`${backendUrl.replace(/\/$/, '')}/admin/sources`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.success) {
      return NextResponse.json({ success: false, error: json?.message || json?.error || 'Failed to fetch sources' }, { status: res.status || 500 });
    }

    const sources = json.data || json.sources || [];
    const configSummary = {
      totalSources: sources.length,
      activeSources: sources.filter((s: any) => s.active).length,
      rssSources: sources.filter((s: any) => s.type === 'rss').length,
      apiSources: sources.filter((s: any) => s.type === 'api').length,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, sources, config: configSummary });
  } catch (error) {
    console.error('Error proxying sources GET:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch sources' }, { status: 500 });
  }
}

// POST /api/admin/sources - Add new source
export async function POST(request: NextRequest) {
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

    if (!backendUrl || !token) {
      return NextResponse.json({ success: false, error: 'Backend URL/token not configured' }, { status: 500 });
    }

    const body = await request.json();
    const payload = {
      name: body.name,
      url: body.url,
      rssUrls: body.rssUrl ? [body.rssUrl] : Array.isArray(body.rssUrls) ? body.rssUrls : [],
      lang: body.language || body.lang || 'en',
      categories: body.categories || [],
      active: body.active !== undefined ? body.active : true,
    };

    const res = await fetch(`${backendUrl.replace(/\/$/, '')}/admin/sources`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.success) {
      return NextResponse.json({ success: false, error: json?.message || json?.error || 'Failed to add source' }, { status: res.status || 500 });
    }

    return NextResponse.json({ success: true, source: json.data || json.source, message: json.message || 'Source added successfully' });
  } catch (error) {
    console.error('Error proxying source POST:', error);
    return NextResponse.json({ success: false, error: 'Failed to add source' }, { status: 500 });
  }
}