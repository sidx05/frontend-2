"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminNav from '@/components/admin/AdminNav';

export default function AdminDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // Get cookie information
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    // Get token info
    const token = cookies.adminToken;
    const user = cookies.adminUser;

    setDebugInfo({
      cookies,
      hasToken: !!token,
      hasUser: !!user,
      tokenLength: token?.length || 0,
      userData: user ? decodeURIComponent(user) : null,
      currentUrl: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  }, []);

  const testLogin = async () => {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'adminpass'
        }),
      });

      const data = await response.json();
      console.log('Login test result:', data);
      
      if (data.success) {
        // Set cookies
        document.cookie = `adminToken=${data.token}; path=/; max-age=${24 * 60 * 60}; samesite=strict`;
        document.cookie = `adminUser=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=${24 * 60 * 60}; samesite=strict`;
        
        // Reload to update debug info
        window.location.reload();
      }
    } catch (error) {
      console.error('Login test error:', error);
    }
  };

  const clearCookies = () => {
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'adminUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Debug</h1>
          <p className="text-muted-foreground">Debug authentication and cookie information</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span>Token Present:</span>
                <Badge variant={debugInfo.hasToken ? "default" : "destructive"}>
                  {debugInfo.hasToken ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>User Data Present:</span>
                <Badge variant={debugInfo.hasUser ? "default" : "destructive"}>
                  {debugInfo.hasUser ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Token Length:</span>
                <Badge variant="outline">{debugInfo.tokenLength}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookie Information</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(debugInfo.cookies, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                {debugInfo.userData || "No user data found"}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Current URL:</strong> {debugInfo.currentUrl}</div>
                <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
                <div><strong>User Agent:</strong> {debugInfo.userAgent}</div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={testLogin}>
              Test Login
            </Button>
            <Button variant="outline" onClick={clearCookies}>
              Clear Cookies
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
