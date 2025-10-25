'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';

interface Source {
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

interface SourceManagementProps {
  sources: Source[];
  loading: boolean;
  onAddSource: (source: Partial<Source>) => void;
  onUpdateSource: (id: string, source: Partial<Source>) => void;
  onDeleteSource: (id: string) => void;
  onToggleSource: (id: string, active: boolean) => void;
  onRefreshSources: () => void;
}

export function SourceManagement({ 
  sources, 
  loading, 
  onAddSource, 
  onUpdateSource, 
  onDeleteSource, 
  onToggleSource, 
  onRefreshSources 
}: SourceManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [newSource, setNewSource] = useState<Partial<Source>>({
    name: '',
    url: '',
    rssUrls: [],
    type: 'rss',
    lang: 'en',
    categories: [],
    active: true
  });

  const handleAddSource = () => {
    if (newSource.name && newSource.url && newSource.type && newSource.lang) {
      onAddSource(newSource);
      setNewSource({
        name: '',
        url: '',
        rssUrls: [],
        type: 'rss',
        lang: 'en',
        categories: [],
        active: true
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleUpdateSource = () => {
    if (editingSource) {
      onUpdateSource(editingSource._id, editingSource);
      setEditingSource(null);
    }
  };

  const handleDeleteSource = (id: string) => {
    if (confirm('Are you sure you want to delete this source?')) {
      onDeleteSource(id);
    }
  };

  const handleToggleSource = (id: string, active: boolean) => {
    onToggleSource(id, active);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Source Management</CardTitle>
          <CardDescription>Loading sources...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Source Management</CardTitle>
            <CardDescription>
              Manage RSS feeds and API sources for news aggregation
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshSources}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Source</DialogTitle>
                  <DialogDescription>
                    Add a new RSS feed or API source for news aggregation.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newSource.name}
                      onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                      className="col-span-3"
                      placeholder="Source name"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="url" className="text-right">
                      URL
                    </Label>
                    <Input
                      id="url"
                      value={newSource.url}
                      onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                      className="col-span-3"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rssUrl" className="text-right">
                      RSS URL
                    </Label>
                    <Input
                      id="rssUrl"
                      value={newSource.rssUrls?.[0] || ''}
                      onChange={(e) => setNewSource({ 
                        ...newSource, 
                        rssUrls: e.target.value ? [e.target.value] : [] 
                      })}
                      className="col-span-3"
                      placeholder="https://example.com/rss"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select
                      value={newSource.type}
                      onValueChange={(value: 'rss' | 'api') => setNewSource({ ...newSource, type: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rss">RSS Feed</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="language" className="text-right">
                      Language
                    </Label>
                    <Select
                      value={newSource.lang}
                      onValueChange={(value) => setNewSource({ ...newSource, lang: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                        <SelectItem value="ru">Russian</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ko">Korean</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="active" className="text-right">
                      Active
                    </Label>
                    <Switch
                      id="active"
                      checked={newSource.active}
                      onCheckedChange={(checked) => setNewSource({ ...newSource, active: checked })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSource}>
                    Add Source
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Scraped</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No sources found. Add your first source to get started.
                </TableCell>
              </TableRow>
            ) : (
              sources.map((source) => (
                <TableRow key={source._id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium">{source.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {source.url}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={source.type === 'rss' ? 'default' : 'secondary'}>
                      {source.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {source.lang.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={source.active}
                        onCheckedChange={(checked) => handleToggleSource(source._id, checked)}
                      />
                      <span className="text-sm">
                        {source.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {source.lastScraped 
                      ? new Date(source.lastScraped).toLocaleDateString()
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSource(source)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSource(source._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
