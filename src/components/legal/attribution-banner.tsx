'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Globe, Copyright, Info } from 'lucide-react';

interface AttributionBannerProps {
  article: {
    title: string;
    source: string;
    sourceUrl: string;
    originalUrl?: string;
    license?: string;
    author?: string;
  };
  className?: string;
}

export default function AttributionBanner({ article, className }: AttributionBannerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  useEffect(() => {
    // Check if user has acknowledged attribution for this article
    const acknowledged = localStorage.getItem(`attribution-${article.title}`);
    if (acknowledged) {
      setHasAcknowledged(true);
    }
  }, [article.title]);

  const handleAcknowledge = () => {
    localStorage.setItem(`attribution-${article.title}`, 'true');
    localStorage.setItem(`attribution-${article.title}-date`, new Date().toISOString());
    setHasAcknowledged(true);
  };

  if (hasAcknowledged) {
    return null;
  }

  return (
    <Card className={`mb-6 border-blue-200 bg-blue-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Content Attribution</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide' : 'Details'}
          </Button>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-blue-800">
            This article was originally published by <strong>{article.source}</strong>. 
            We respect content creators' rights and provide proper attribution.
          </p>

          {showDetails && (
            <div className="space-y-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-semibold text-blue-900 mb-2">Source Information</h5>
                  <div className="space-y-1 text-blue-700">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <span>Source: {article.source}</span>
                    </div>
                    {article.author && (
                      <div>Author: {article.author}</div>
                    )}
                    {article.license && (
                      <div>License: {article.license}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-blue-900 mb-2">Original Content</h5>
                  <div className="space-y-2">
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-blue-200">
                <h5 className="font-semibold text-blue-900 mb-2">Why Attribution Matters</h5>
                <p className="text-xs text-blue-700">
                  We believe in giving credit where credit is due. Proper attribution supports 
                  journalists, writers, and content creators while maintaining transparency 
                  with our readers. This practice complies with copyright laws and journalistic ethics.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-blue-600">
              <Copyright className="w-3 h-3" />
              <span>Content may be subject to copyright. Please respect original creators' rights.</span>
            </div>
            
            <Button
              size="sm"
              onClick={handleAcknowledge}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Acknowledge & Continue
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}