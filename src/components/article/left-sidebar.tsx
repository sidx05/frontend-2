"use client";

import { SidebarAd, NewsletterSignup } from "./sidebar-ad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function LeftSidebar() {
  return (
    <aside className="space-y-6">
      {/* Featured Advertisement */}
      <SidebarAd
        type="banner"
        title="Premium News Access"
        description="Subscribe now and get unlimited access to all premium content"
        badge="Special Offer"
        link="#"
      />

      {/* Newsletter Signup */}
      <NewsletterSignup />

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Today's Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Articles Published</span>
              <span className="font-bold">127</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Readers</span>
              <span className="font-bold">45.2K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Breaking News</span>
              <span className="font-bold text-red-500">12</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Advertisement Card */}
      <SidebarAd
        type="card"
        title="Advanced Analytics Platform"
        description="Track your business metrics in real-time with our powerful dashboard"
        image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop"
        badge="Sponsored"
        link="#"
      />

      {/* Categories Quick Access */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Popular Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { name: "Politics", count: 234 },
              { name: "Technology", count: 189 },
              { name: "Business", count: 156 },
              { name: "Sports", count: 142 },
              { name: "Entertainment", count: 128 }
            ].map((cat, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-border last:border-0 hover:bg-muted/50 rounded px-2 cursor-pointer transition-colors">
                <span className="text-sm font-medium">{cat.name}</span>
                <span className="text-xs text-muted-foreground">{cat.count} articles</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Compact Ad */}
      <SidebarAd
        type="compact"
        title="Cloud Storage Solution"
        description="Secure your files with 99.9% uptime guarantee"
        image="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200&h=200&fit=crop"
        badge="Ad"
        link="#"
      />
    </aside>
  );
}
