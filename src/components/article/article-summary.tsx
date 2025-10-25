'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  BookOpen, 
  FileText, 
  Volume2, 
  Share2, 
  BookmarkPlus,
  ExternalLink
} from 'lucide-react';

interface ArticleSummaryProps {
  articleId: string; // instead of passing whole article, we pass just ID
}

export default function ArticleSummary({ articleId }: ArticleSummaryProps) {
  const [article, setArticle] = useState<null | {
    title: string;
    summary?: string;
    content: string;
    category: string;
    author: string;
    publishedAt?: string;
    readTime?: number;
    url: string;
  }>(null);

  const [showFullContent, setShowFullContent] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // 🔹 Fetch article dynamically
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/articles/${articleId}`);
        if (!res.ok) throw new Error('Failed to load article');
        const data = await res.json();
        setArticle(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchArticle();
  }, [articleId]);

  if (!article) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading article...
        </CardContent>
      </Card>
    );
  }

  // --- existing helper functions ---
  const generateSummary = () => {
    if (article.summary) return article.summary; // prefer backend summary if exists
    const sentences = article.content.split('.').filter(s => s.trim().length > 0);
    return sentences.slice(0, 3).join('. ') + '.';
  };

  const generateQuickRead = () => {
    const sentences = article.content.split('.').filter(s => s.trim().length > 0);
    return sentences.slice(0, 5).map((s, i) => `${i + 1}. ${s.trim()}`).join('\n\n');
  };

  const handleTextToSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(
          showFullContent ? article.content : generateSummary()
        );
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: generateSummary(),
          url: article.url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(
          `${article.title}\n\n${generateSummary()}`
        );
        alert('Link copied to clipboard!');
      } catch (error) {
        console.log('Error copying to clipboard:', error);
      }
    }
  };

  const handleBookmark = () => {
    alert('Article bookmarked!');
  };

  const readTime = article.readTime || Math.ceil(article.content.split(' ').length / 200);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {readTime} min read
              </span>
              <span>{article.author}</span>
              {article.publishedAt && (
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              )}
            </div>
            <Badge variant="secondary" className="mt-2">
              {article.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button
            variant={showFullContent ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFullContent(!showFullContent)}
          >
            <FileText className="w-4 h-4 mr-2" />
            {showFullContent ? 'Show Summary' : 'Show Full'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleTextToSpeech}>
            <Volume2 className="w-4 h-4 mr-2" />
            {isPlaying ? 'Stop' : 'Listen'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleBookmark}>
            <BookmarkPlus className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>

        <div className="prose prose-sm max-w-none">
          {showFullContent ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Full Article
              </h3>
              <div className="whitespace-pre-wrap">{article.content}</div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Quick Summary
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {generateSummary()}
              </p>
              <div className="border-l-4 border-blue-200 pl-4 bg-blue-50 p-3">
                <h4 className="font-semibold text-blue-900 mb-2">Key Points</h4>
                <div className="text-blue-800 whitespace-pre-line text-sm">
                  {generateQuickRead()}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          {!showFullContent && (
            <Button onClick={() => setShowFullContent(true)}>
              Read Full Article
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
