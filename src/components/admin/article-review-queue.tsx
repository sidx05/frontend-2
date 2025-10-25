'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, CheckCircle, XCircle, Edit, Clock, AlertCircle } from 'lucide-react';

interface Article {
  _id: string;
  title: string;
  summary: string;
  status: 'draft' | 'published' | 'rejected' | 'needs_review' | 'pending';
  category: string;
  author: string;
  publishedAt?: string;
  createdAt: string;
  
  factCheck?: {
    isReliable: boolean;
    confidence: number;
  };
  viewCount: number;
}

interface ArticleReviewQueueProps {
  articles: Article[];
  loading: boolean;
  onViewArticle: (article: Article) => void;
  onApproveArticle: (article: Article) => void;
  onRejectArticle: (article: Article) => void;
  onEditArticle: (article: Article) => void;
}

export function ArticleReviewQueue({ 
  articles, 
  loading, 
  onViewArticle, 
  onApproveArticle, 
  onRejectArticle, 
  onEditArticle 
}: ArticleReviewQueueProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: 'Published', variant: 'default' as const, icon: CheckCircle },
      pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
      needs_review: { label: 'Review', variant: 'destructive' as const, icon: AlertCircle },
      rejected: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
      draft: { label: 'Draft', variant: 'outline' as const, icon: Edit }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Article Review Queue</CardTitle>
          <CardDescription>Loading articles...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayArticles = (articles || []).slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Article Review Queue</CardTitle>
        <CardDescription>
          Review and manage articles before publication
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No articles found
                </TableCell>
              </TableRow>
            ) : (
              displayArticles.map((article) => (
                <TableRow key={article._id}>
                  <TableCell className="font-medium max-w-xs">
                    <div className="truncate" title={article.title}>
                      {article.title}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(article.status)}</TableCell>
                  <TableCell>{article.category || 'Uncategorized'}</TableCell>
                  
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewArticle(article)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onApproveArticle(article)}
                        disabled={article.status === 'published'}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRejectArticle(article)}
                        disabled={article.status === 'rejected'}
                      >
                        <XCircle className="h-4 w-4" />
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
