'use client';

import { useEffect, useState } from 'react';
import { SourceManagement } from '@/components/admin/source-management';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, PlayCircle } from 'lucide-react';

interface SourceItem {
  _id: string;
  name: string;
  url: string;
  rssUrls: string[];
  type: 'rss' | 'api';
  lang: string;
  categories: string[];
  active: boolean;
  lastScraped?: string;
}

export default function AdminSourcesPage() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busy, setBusy] = useState<boolean>(false);

  const loadSources = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/sources', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load sources');
      setSources(json.sources || json.data || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load sources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const onAddSource = async (partial: Partial<SourceItem>) => {
    try {
      setBusy(true);
      const res = await fetch('/api/admin/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: partial.name,
          url: partial.url,
          rssUrl: partial.rssUrls?.[0] || '',
          type: partial.type || 'rss',
          categories: partial.categories || [],
          language: partial.lang || 'en',
          active: partial.active ?? true,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add source');
      toast.success('Source added');
      await loadSources();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add source');
    } finally {
      setBusy(false);
    }
  };

  const onUpdateSource = async (id: string, partial: Partial<SourceItem>) => {
    try {
      setBusy(true);
      const res = await fetch(`/api/admin/sources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update source');
      toast.success('Source updated');
      await loadSources();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update source');
    } finally {
      setBusy(false);
    }
  };

  const onDeleteSource = async (id: string) => {
    try {
      setBusy(true);
      const res = await fetch(`/api/admin/sources/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete source');
      toast.success('Source deleted');
      setSources((prev) => prev.filter((s) => s._id !== id));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete source');
    } finally {
      setBusy(false);
    }
  };

  const onToggleSource = async (id: string, active: boolean) => {
    return onUpdateSource(id, { active });
  };

  const onRefreshSources = async () => loadSources();

  const onScrapeAll = async () => {
    try {
      setBusy(true);
      const res = await fetch('/api/admin/scrape', { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to trigger scraping');
      toast.success(`Scrape started${json.count ? `: ${json.count} tasks` : ''}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to trigger scraping');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Sources</CardTitle>
            <CardDescription>Add and manage RSS/API sources. Scraping runs on the backend.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRefreshSources} disabled={loading || busy}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button size="sm" onClick={onScrapeAll} disabled={busy}>
              <PlayCircle className="h-4 w-4 mr-2" /> Scrape All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SourceManagement
            sources={sources}
            loading={loading}
            onAddSource={onAddSource}
            onUpdateSource={onUpdateSource}
            onDeleteSource={onDeleteSource}
            onToggleSource={onToggleSource}
            onRefreshSources={onRefreshSources}
          />
        </CardContent>
      </Card>
    </div>
  );
}
