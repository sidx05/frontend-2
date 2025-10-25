"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminNav from '@/components/admin/AdminNav';
import { FileText, Users, BarChart3, Settings, Plus, Eye } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
        <AdminNav />
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your NewsHub content and settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Brand Wire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Manage your Brand Wire content - articles, spotlights, and industry insights.
              </p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/admin/brand-wire">
                    <Plus className="h-4 w-4 mr-2" />
                    Manage
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/brand-wire">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Manage news articles, categories, and content moderation.
              </p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/admin/articles">
                    <Plus className="h-4 w-4 mr-2" />
                    Manage
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/news">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Manage user accounts, permissions, and subscriptions.
              </p>
              <Button asChild>
                <Link href="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View site analytics, traffic, and content performance.
              </p>
              <Button asChild>
                <Link href="/admin/analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Configure system settings, themes, and preferences.
              </p>
              <Button asChild>
                <Link href="/admin/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Quick access to common admin tasks and site views.
              </p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/">View Homepage</Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/news">View News</Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/brand-wire">View Brand Wire</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}