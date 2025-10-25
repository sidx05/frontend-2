'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Cookie, Shield, ExternalLink } from 'lucide-react';

interface CookieConsentProps {
  className?: string;
}

export default function CookieConsent({ className }: CookieConsentProps) {
  const [showConsent, setShowConsent] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show consent banner after a short delay
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowConsent(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowConsent(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('cookie-consent', 'essential');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowConsent(false);
  };

  if (!showConsent) {
    return null;
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 ${className}`}>
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Cookie className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Cookie Preferences</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConsent(false)}
              className="mt-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We use cookies to enhance your browsing experience, serve personalized content, 
              and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
            </p>

            {showDetails && (
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Essential Cookies
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Required for the website to function properly. Cannot be disabled.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Analytics Cookies</h4>
                    <p className="text-xs text-muted-foreground">
                      Help us understand how visitors interact with our website.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Marketing Cookies</h4>
                    <p className="text-xs text-muted-foreground">
                      Used to track visitors across websites to display relevant ads.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <ExternalLink className="w-3 h-3" />
                  <a 
                    href="/privacy-policy" 
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                  <span>•</span>
                  <a 
                    href="/cookie-policy" 
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Cookie Policy
                  </a>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleAccept}
                className="flex-1"
              >
                Accept All
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleAcceptEssential}
                className="flex-1"
              >
                Accept Essential Only
              </Button>
              
              <Button 
                variant="ghost"
                onClick={() => setShowDetails(!showDetails)}
                className="flex-1"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleReject}
                className="flex-1"
              >
                Reject All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}