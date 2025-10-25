"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Calendar, User, Tag, Image as ImageIcon, Search, Filter } from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface Article {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  thumbnail?: string;
  images: Array<{
    url: string;
    alt: string;
    caption?: string;
  }>;
  category: any;
  categories: string[];
  tags: string[];
  author?: string;
  language: string;
  status: 'scraped' | 'pending' | 'processed' | 'published' | 'rejected' | 'needs_review';
  publishedAt: string;
  scrapedAt: string;
  source: {
    name: string;
    url: string;
  };
  viewCount: number;
  wordCount: number;
  readingTime: number;
}

const STATUSES = [
  { value: 'scraped', label: 'Scraped' },
  { value: 'pending', label: 'Pending' },
  { value: 'processed', label: 'Processed' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'needs_review', label: 'Needs Review' }
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'te', label: 'Telugu' },
  { value: 'ta', label: 'Tamil' },
  { value: 'bn', label: 'Bengali' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'mr', label: 'Marathi' }
];

export default function ArticlesAdmin() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    author: '',
    language: 'en',
    status: 'published',
    tags: '',
    imageUrl: '',
    imageCaption: '',
    sourceName: 'Manual Article',
    category: 'general'
  });

  useEffect(() => {
    fetchArticles();
  }, [currentPage, statusFilter, languageFilter, searchTerm]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (statusFilter) params.append('status', statusFilter);
      if (languageFilter) params.append('language', languageFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/articles?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setArticles(data.articles);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const articleData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        thumbnail: formData.imageUrl || undefined,
        sourceUrl: `manual-${Date.now()}`
      };

      const url = editingArticle ? `/api/admin/articles/${editingArticle._id}` : '/api/admin/articles/manual';
      const method = editingArticle ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(editingArticle ? 'Article updated successfully' : 'Article created successfully');
        setIsDialogOpen(false);
        setEditingArticle(null);
        resetForm();
        fetchArticles();
      } else {
        toast.error(data.error || 'Failed to save article');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article');
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      summary: article.summary,
      content: article.content,
      author: article.author || '',
      language: article.language,
      status: article.status,
      tags: article.tags.join(', '),
      imageUrl: (article.images && article.images[0]?.url) || article.thumbnail || '',
      imageCaption: (article.images && article.images[0]?.caption) || '',
      sourceName: article.source?.name || 'Manual Article',
      category: article.category || 'general'
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const response = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Article deleted successfully');
        fetchArticles();
      } else {
        toast.error(data.error || 'Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Failed to delete article');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      content: '',
      author: '',
      language: 'en',
      status: 'published',
      tags: '',
      imageUrl: '',
      imageCaption: '',
      sourceName: 'Manual Article',
      category: 'general'
    });
  };

  const openCreateDialog = () => {
    setEditingArticle(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      case 'needs_review': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading && articles.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <div className="p-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Articles Management</h1>
            <p className="text-muted-foreground">Manage news articles, categories, and content moderation</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingArticle ? 'Edit Article' : 'Create New Article'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="summary">Summary *</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(lang => (
                          <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., politics, sports, entertainment"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sourceName">Source Name</Label>
                    <Input
                      id="sourceName"
                      value={formData.sourceName}
                      onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                      placeholder="e.g., Manual Article, NewsHub"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(status => (
                          <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="imageCaption">Image Caption</Label>
                    <Input
                      id="imageCaption"
                      value={formData.imageCaption}
                      onChange={(e) => setFormData({ ...formData, imageCaption: e.target.value })}
                      placeholder="Optional caption"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingArticle ? 'Update' : 'Create'} Article
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map(status => (
                <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All Languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {LANGUAGES.map(lang => (
                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {articles.map((article) => (
            <Card key={article._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={getStatusColor(article.status)}>
                        {article.status}
                      </Badge>
                      <Badge variant="outline">{article.language.toUpperCase()}</Badge>
                      <span className="text-sm text-muted-foreground">
                        <User className="h-3 w-3 inline mr-1" />
                        {article.author || 'Unknown'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        <Eye className="h-3 w-3 inline mr-1" />
                        {article.viewCount} views
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(article)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(article._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3 line-clamp-2">{article.summary}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                  <span>Source: {article.source.name}</span>
                  {article.tags.length > 0 && (
                    <span>
                      <Tag className="h-3 w-3 inline mr-1" />
                      {article.tags.slice(0, 3).join(', ')}
                      {article.tags.length > 3 && ` +${article.tags.length - 3} more`}
                    </span>
                  )}
                  <span>{article.wordCount} words ({article.readingTime} min read)</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {articles.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles found.</p>
            <Button onClick={openCreateDialog} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Article
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
