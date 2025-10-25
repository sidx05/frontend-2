"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Settings, FileText, Users, BarChart3, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const adminNavItems = [
  {
    href: '/admin/brand-wire',
    label: 'Brand Wire',
    icon: FileText,
    description: 'Manage Brand Wire content'
  },
  {
    href: '/admin/articles',
    label: 'Articles',
    icon: FileText,
    description: 'Manage news articles'
  },
  {
    href: '/admin/users',
    label: 'Users',
    icon: Users,
    description: 'Manage user accounts'
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'View site analytics'
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: Settings,
    description: 'System settings'
  }
];

export default function AdminNav() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      // Clear cookies
      document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'adminUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      toast.success('Logged out successfully');
      // Redirect to login
      window.location.href = '/admin/login';
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="text-xl font-bold">
              Admin Panel
            </Link>
            <div className="flex space-x-6">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Welcome, Admin</span>
            </div>
            <Link 
              href="/" 
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back to Site
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
