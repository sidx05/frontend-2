"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Zap, Crown } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SubscribePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 sm:p-10 text-white"
            >
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white text-black text-xs font-medium mb-4">
                  Special Offer
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Premium News Access</h1>
                <p className="text-white/90 max-w-2xl">
                  Subscribe now and get unlimited access to all premium content. Enjoy an ad-light experience with exclusive analysis and early access features.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="bg-white text-black hover:bg-white/90" onClick={() => router.push("/admin")}>Subscribe Now</Button>
                  <Link href="/news">
                    <Button size="lg" variant="secondary">Back to News</Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            <Card className="border border-border/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">What you get</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[ 
                    { icon: <Crown className="h-5 w-5 text-primary" />, text: "Exclusive premium-only articles and deep dives" },
                    { icon: <Zap className="h-5 w-5 text-primary" />, text: "Early access to breaking stories and features" },
                    { icon: <CheckCircle2 className="h-5 w-5 text-primary" />, text: "Fewer interruptions with an ad-light experience" },
                    { icon: <ShieldCheck className="h-5 w-5 text-primary" />, text: "Priority support and newsletter exclusives" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
                      {item.icon}
                      <p className="text-sm">{item.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">No premium stories yet</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  We’re rolling out premium content soon. In the meantime, explore the latest articles across all languages and categories.
                </p>
                <Link href="/news">
                  <Button>Browse Latest News</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="border border-border/50">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-2">Have questions?</h3>
                <p className="text-sm text-muted-foreground mb-4">Contact us for custom plans or advertising partnerships.</p>
                <Link href="/contact">
                  <Button variant="outline" className="w-full">Contact Us</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
