'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, RefreshCw } from 'lucide-react';

interface DisplaySettingsProps {
  onSaveSettings: (settings: any) => void;
}

export function DisplaySettings({ onSaveSettings }: DisplaySettingsProps) {
  const [settings, setSettings] = useState({
    articlesPerPage: 20,
    articlesPerCategory: 15,
    featuredArticlesCount: 5,
    trendingArticlesCount: 10,
    enablePagination: true,
    enableInfiniteScroll: false,
    showArticleImages: true,
    showArticleSummary: true,
    showArticleAuthor: true,
    showArticleDate: true,
    showArticleViews: false,
    enableDarkMode: true,
    enableComments: false,
    enableSocialSharing: true,
    enableRelatedArticles: true,
    maxRelatedArticles: 5,
    cacheTimeout: 300, // 5 minutes
    enableCDN: false,
    enableCompression: true,
    perLanguageViewAllLimit: {
      en: 12,
      hi: 12,
      te: 12,
      ta: 12,
      mr: 12,
      gu: 12,
      bn: 12
    }
  });

  // Load current settings from API
  // Kept simple inside component to avoid lifting into page for now
  // This ensures admin sees persisted values and saving updates them
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (!res.ok) return;
        const data = await res.json();
        if (data?.success && data.settings) {
          const s = data.settings;
          setSettings((prev) => ({
            ...prev,
            articlesPerPage: s.categoryDisplay?.articlesPerCategory ?? prev.articlesPerPage,
            articlesPerCategory: s.categoryDisplay?.articlesPerCategory ?? prev.articlesPerCategory,
            featuredArticlesCount: s.homepage?.featuredArticlesCount ?? prev.featuredArticlesCount,
            trendingArticlesCount: s.homepage?.trendingTopicsCount ?? prev.trendingArticlesCount,
            enablePagination: true,
            enableInfiniteScroll: false,
            showArticleImages: true,
            showArticleSummary: true,
            showArticleAuthor: true,
            showArticleDate: true,
            showArticleViews: false,
            enableDarkMode: true,
            enableComments: false,
            enableSocialSharing: true,
            enableRelatedArticles: true,
            maxRelatedArticles: 5,
            cacheTimeout: 300,
            enableCDN: false,
            enableCompression: true,
            perLanguageViewAllLimit: s.perLanguageViewAllLimit || prev.perLanguageViewAllLimit,
          }));
        }
      } catch {}
    })();
  }, []);

  const handleSave = () => {
    onSaveSettings(settings);
  };

  const handleReset = () => {
    setSettings({
      articlesPerPage: 20,
      articlesPerCategory: 15,
      featuredArticlesCount: 5,
      trendingArticlesCount: 10,
      enablePagination: true,
      enableInfiniteScroll: false,
      showArticleImages: true,
      showArticleSummary: true,
      showArticleAuthor: true,
      showArticleDate: true,
      showArticleViews: false,
      enableDarkMode: true,
      enableComments: false,
      enableSocialSharing: true,
      enableRelatedArticles: true,
      maxRelatedArticles: 5,
      cacheTimeout: 300,
      enableCDN: false,
      enableCompression: true,
      perLanguageViewAllLimit: { en: 12, hi: 12, te: 12, ta: 12, mr: 12, gu: 12, bn: 12 }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Display Settings</CardTitle>
            <CardDescription>
              Configure how articles are displayed and paginated
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Per-language View All Limits */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">View All Limits by Language</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(settings.perLanguageViewAllLimit).map(([lang, value]) => (
              <div className="space-y-2" key={lang}>
                <Label htmlFor={`limit-${lang}`}>{lang.toUpperCase()} articles when View All</Label>
                <Input
                  id={`limit-${lang}`}
                  type="number"
                  value={value as number}
                  onChange={(e) => setSettings({
                    ...settings,
                    perLanguageViewAllLimit: {
                      ...settings.perLanguageViewAllLimit,
                      [lang]: parseInt(e.target.value) || 12
                    }
                  })}
                  min="1"
                  max="100"
                />
              </div>
            ))}
          </div>
        </div>
        {/* Pagination Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Pagination & Display</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="articlesPerPage">Articles per page</Label>
              <Input
                id="articlesPerPage"
                type="number"
                value={settings.articlesPerPage}
                onChange={(e) => setSettings({ ...settings, articlesPerPage: parseInt(e.target.value) || 20 })}
                min="1"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="articlesPerCategory">Articles per category</Label>
              <Input
                id="articlesPerCategory"
                type="number"
                value={settings.articlesPerCategory}
                onChange={(e) => setSettings({ ...settings, articlesPerCategory: parseInt(e.target.value) || 15 })}
                min="1"
                max="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="featuredArticlesCount">Featured articles count</Label>
              <Input
                id="featuredArticlesCount"
                type="number"
                value={settings.featuredArticlesCount}
                onChange={(e) => setSettings({ ...settings, featuredArticlesCount: parseInt(e.target.value) || 5 })}
                min="1"
                max="20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trendingArticlesCount">Trending articles count</Label>
              <Input
                id="trendingArticlesCount"
                type="number"
                value={settings.trendingArticlesCount}
                onChange={(e) => setSettings({ ...settings, trendingArticlesCount: parseInt(e.target.value) || 10 })}
                min="1"
                max="50"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Navigation Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Navigation</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable pagination</Label>
                <p className="text-sm text-muted-foreground">
                  Show page numbers for navigation
                </p>
              </div>
              <Switch
                checked={settings.enablePagination}
                onCheckedChange={(checked) => setSettings({ ...settings, enablePagination: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable infinite scroll</Label>
                <p className="text-sm text-muted-foreground">
                  Load more articles automatically when scrolling
                </p>
              </div>
              <Switch
                checked={settings.enableInfiniteScroll}
                onCheckedChange={(checked) => setSettings({ ...settings, enableInfiniteScroll: checked })}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Article Display Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Article Display</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show article images</Label>
                <p className="text-sm text-muted-foreground">
                  Display article thumbnails and images
                </p>
              </div>
              <Switch
                checked={settings.showArticleImages}
                onCheckedChange={(checked) => setSettings({ ...settings, showArticleImages: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show article summary</Label>
                <p className="text-sm text-muted-foreground">
                  Display article summaries in lists
                </p>
              </div>
              <Switch
                checked={settings.showArticleSummary}
                onCheckedChange={(checked) => setSettings({ ...settings, showArticleSummary: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show article author</Label>
                <p className="text-sm text-muted-foreground">
                  Display author information
                </p>
              </div>
              <Switch
                checked={settings.showArticleAuthor}
                onCheckedChange={(checked) => setSettings({ ...settings, showArticleAuthor: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show article date</Label>
                <p className="text-sm text-muted-foreground">
                  Display publication date
                </p>
              </div>
              <Switch
                checked={settings.showArticleDate}
                onCheckedChange={(checked) => setSettings({ ...settings, showArticleDate: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show article views</Label>
                <p className="text-sm text-muted-foreground">
                  Display view count
                </p>
              </div>
              <Switch
                checked={settings.showArticleViews}
                onCheckedChange={(checked) => setSettings({ ...settings, showArticleViews: checked })}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Features Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Features</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable dark mode</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to switch between light and dark themes
                </p>
              </div>
              <Switch
                checked={settings.enableDarkMode}
                onCheckedChange={(checked) => setSettings({ ...settings, enableDarkMode: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable comments</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to comment on articles
                </p>
              </div>
              <Switch
                checked={settings.enableComments}
                onCheckedChange={(checked) => setSettings({ ...settings, enableComments: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable social sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Show social media sharing buttons
                </p>
              </div>
              <Switch
                checked={settings.enableSocialSharing}
                onCheckedChange={(checked) => setSettings({ ...settings, enableSocialSharing: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable related articles</Label>
                <p className="text-sm text-muted-foreground">
                  Show related articles at the bottom of each article
                </p>
              </div>
              <Switch
                checked={settings.enableRelatedArticles}
                onCheckedChange={(checked) => setSettings({ ...settings, enableRelatedArticles: checked })}
              />
            </div>
            {settings.enableRelatedArticles && (
              <div className="space-y-2">
                <Label htmlFor="maxRelatedArticles">Max related articles</Label>
                <Input
                  id="maxRelatedArticles"
                  type="number"
                  value={settings.maxRelatedArticles}
                  onChange={(e) => setSettings({ ...settings, maxRelatedArticles: parseInt(e.target.value) || 5 })}
                  min="1"
                  max="20"
                />
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Performance Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Performance</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cacheTimeout">Cache timeout (seconds)</Label>
              <Input
                id="cacheTimeout"
                type="number"
                value={settings.cacheTimeout}
                onChange={(e) => setSettings({ ...settings, cacheTimeout: parseInt(e.target.value) || 300 })}
                min="60"
                max="3600"
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable CDN</Label>
                <p className="text-sm text-muted-foreground">
                  Use Content Delivery Network for faster loading
                </p>
              </div>
              <Switch
                checked={settings.enableCDN}
                onCheckedChange={(checked) => setSettings({ ...settings, enableCDN: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable compression</Label>
                <p className="text-sm text-muted-foreground">
                  Compress responses for faster loading
                </p>
              </div>
              <Switch
                checked={settings.enableCompression}
                onCheckedChange={(checked) => setSettings({ ...settings, enableCompression: checked })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
