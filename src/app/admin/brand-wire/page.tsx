"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Calendar, User, Tag, Image as ImageIcon, Search } from 'lucide-react';
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

interface BrandWireArticle {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  images: Array<{
    url: string;
    alt: string;
    caption?: string;
  }>;
  category: string;
  tags: string[];
  author: string;
  language: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  priority: number;
  publishedAt: string;
  expiresAt?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { value: 'influential-personalities', label: 'Influential Personalities' },
  { value: 'brand-spotlight', label: 'Brand Spotlight' },
  { value: 'industry-insights', label: 'Industry Insights' },
  { value: 'thought-leadership', label: 'Thought Leadership' },
  { value: 'company-news', label: 'Company News' }
];

const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
];

export default function BrandWireAdmin() {
  const [articles, setArticles] = useState<BrandWireArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<BrandWireArticle | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'influential-personalities',
    tags: '',
    author: '',
    language: 'en',
    status: 'draft',
    featured: false,
    priority: 0,
    publishedAt: new Date().toISOString().split('T')[0],
    expiresAt: '',
    imageUrl: '',
    imageAlt: '',
    imageCaption: ''
  });

  useEffect(() => {
    fetchArticles();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) {
        // For now, we'll filter client-side since the API doesn't have search yet
        // In a real implementation, you'd add search to the API
      }

      const response = await fetch(`/api/brand-wire?${params}`);
      const data = await response.json();
      
      if (data.success) {
        let filteredArticles = data.articles;
        
        // Client-side search filtering
        if (searchTerm) {
          filteredArticles = data.articles.filter((article: BrandWireArticle) =>
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        
        setArticles(filteredArticles);
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
        images: formData.imageUrl ? [{
          url: formData.imageUrl,
          alt: formData.imageAlt,
          caption: formData.imageCaption
        }] : [],
        priority: parseInt(formData.priority.toString())
      };

      const url = editingArticle ? `/api/brand-wire/${editingArticle._id}` : '/api/brand-wire';
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

  const handleEdit = (article: BrandWireArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      summary: article.summary,
      content: article.content,
      category: article.category,
      tags: article.tags.join(', '),
      author: article.author,
      language: article.language,
      status: article.status,
      featured: article.featured,
      priority: article.priority,
      publishedAt: article.publishedAt.split('T')[0],
      expiresAt: article.expiresAt ? article.expiresAt.split('T')[0] : '',
      imageUrl: article.images[0]?.url || '',
      imageAlt: article.images[0]?.alt || '',
      imageCaption: article.images[0]?.caption || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const response = await fetch(`/api/brand-wire/${id}`, { method: 'DELETE' });
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
      category: 'influential-personalities',
      tags: '',
      author: '',
      language: 'en',
      status: 'draft',
      featured: false,
      priority: 0,
      publishedAt: new Date().toISOString().split('T')[0],
      expiresAt: '',
      imageUrl: '',
      imageAlt: '',
      imageCaption: ''
    });
  };

  const openCreateDialog = () => {
    setEditingArticle(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Brand Wire Management</h1>
          <p className="text-muted-foreground">Manage your Brand Wire content</p>
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
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
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
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  />
                </div>
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
                  <Label htmlFor="imageAlt">Image Alt Text</Label>
                  <Input
                    id="imageAlt"
                    value={formData.imageAlt}
                    onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                    placeholder="Description of image"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="publishedAt">Published Date</Label>
                  <Input
                    id="publishedAt"
                    type="date"
                    value={formData.publishedAt}
                    onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="expiresAt">Expires Date (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label htmlFor="featured">Featured Article</Label>
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

      <div className="grid gap-4">
        {articles.map((article) => (
          <Card key={article._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                      {article.status}
                    </Badge>
                    <Badge variant="outline">{article.category}</Badge>
                    {article.featured && <Badge variant="destructive">Featured</Badge>}
                    <span className="text-sm text-muted-foreground">
                      <User className="h-3 w-3 inline mr-1" />
                      {article.author}
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
              <p className="text-muted-foreground mb-3">{article.summary}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  <Calendar className="h-3 w-3 inline mr-1" />
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
                {article.tags.length > 0 && (
                  <span>
                    <Tag className="h-3 w-3 inline mr-1" />
                    {article.tags.join(', ')}
                  </span>
                )}
                {article.images.length > 0 && (
                  <span>
                    <ImageIcon className="h-3 w-3 inline mr-1" />
                    {article.images.length} image(s)
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No Brand Wire articles found.</p>
          <Button onClick={openCreateDialog} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Article
          </Button>
        </div>
      )}

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
      </div>
    </div>
  );
}
