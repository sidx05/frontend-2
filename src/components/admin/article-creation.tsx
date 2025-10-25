'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Save, X } from 'lucide-react';

interface ArticleCreationProps {
  categories: string[];
  sources: any[];
  onCreateArticle: (article: any) => void;
}

export function ArticleCreation({ categories, sources, onCreateArticle }: ArticleCreationProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    summary: '',
    author: '',
    category: '',
    language: 'en',
    sourceName: '',
    sourceUrl: '',
    thumbnail: '',
    tags: '',
    published: false
  });

  const handleCreateArticle = () => {
    const hasRequired = newArticle.title && newArticle.content && newArticle.author && newArticle.category;
    if (!hasRequired) return;

    const sourceName = newArticle.sourceName?.trim() || 'Manual';
    const tags = newArticle.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    if (!tags.includes('manual')) tags.push('manual');

    const articleData = {
      ...newArticle,
      sourceName,
      tags,
      status: newArticle.published ? 'published' : 'draft',
      publishedAt: newArticle.published ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString()
    };

    onCreateArticle(articleData);

    // Reset form
    setNewArticle({
      title: '',
      content: '',
      summary: '',
      author: '',
      category: '',
      language: 'en',
      sourceName: '',
      sourceUrl: '',
      thumbnail: '',
      tags: '',
      published: false
    });
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setNewArticle({
      title: '',
      content: '',
      summary: '',
      author: '',
      category: '',
      language: 'en',
      sourceName: '',
      sourceUrl: '',
      thumbnail: '',
      tags: '',
      published: false
    });
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Article Management</CardTitle>
            <CardDescription>
              Create and manage news articles manually
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Article
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Article</DialogTitle>
                <DialogDescription>
                  Create a new news article with custom content and metadata.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={newArticle.title}
                    onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                    className="col-span-3"
                    placeholder="Article title"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="author" className="text-right">
                    Author *
                  </Label>
                  <Input
                    id="author"
                    value={newArticle.author}
                    onChange={(e) => setNewArticle({ ...newArticle, author: e.target.value })}
                    className="col-span-3"
                    placeholder="Author name"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={newArticle.category}
                    onValueChange={(value) => setNewArticle({ ...newArticle, category: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="language" className="text-right">
                    Language
                  </Label>
                  <Select
                    value={newArticle.language}
                    onValueChange={(value) => setNewArticle({ ...newArticle, language: value })}
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
                  <Label htmlFor="sourceName" className="text-right">
                    Source Name
                  </Label>
                  <Input
                    id="sourceName"
                    value={newArticle.sourceName}
                    onChange={(e) => setNewArticle({ ...newArticle, sourceName: e.target.value })}
                    className="col-span-3"
                    placeholder="e.g., Manual or Publisher name"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sourceUrl" className="text-right">
                    Source URL
                  </Label>
                  <Input
                    id="sourceUrl"
                    value={newArticle.sourceUrl}
                    onChange={(e) => setNewArticle({ ...newArticle, sourceUrl: e.target.value })}
                    className="col-span-3"
                    placeholder="https://example.com/article-url"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="thumbnail" className="text-right">
                    Image URL
                  </Label>
                  <Input
                    id="thumbnail"
                    value={newArticle.thumbnail}
                    onChange={(e) => setNewArticle({ ...newArticle, thumbnail: e.target.value })}
                    className="col-span-3"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tags" className="text-right">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    value={newArticle.tags}
                    onChange={(e) => setNewArticle({ ...newArticle, tags: e.target.value })}
                    className="col-span-3"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="summary" className="text-right pt-2">
                    Summary
                  </Label>
                  <Textarea
                    id="summary"
                    value={newArticle.summary}
                    onChange={(e) => setNewArticle({ ...newArticle, summary: e.target.value })}
                    className="col-span-3"
                    placeholder="Article summary"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="content" className="text-right pt-2">
                    Content *
                  </Label>
                  <Textarea
                    id="content"
                    value={newArticle.content}
                    onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                    className="col-span-3"
                    placeholder="Article content"
                    rows={8}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="published" className="text-right">
                    Publish Now
                  </Label>
                  <Switch
                    id="published"
                    checked={newArticle.published}
                    onCheckedChange={(checked) => setNewArticle({ ...newArticle, published: checked })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleCreateArticle}>
                  <Save className="h-4 w-4 mr-2" />
                  Create Article
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-8">
          <p>Create new articles manually or import from RSS feeds.</p>
          <p className="text-sm mt-2">
            Use the "Create Article" button above to add new content.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
