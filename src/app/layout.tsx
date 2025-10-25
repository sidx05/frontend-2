import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import CookieConsent from "@/components/legal/cookie-consent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NewsHub - Modern News Platform",
  description: "Stay informed with the latest news from around the world. Breaking news, trending topics, and in-depth analysis across politics, technology, sports, and more.",
  keywords: ["NewsHub", "news", "breaking news", "politics", "technology", "sports", "world news", "trending"],
  authors: [{ name: "NewsHub Team" }],
  openGraph: {
    title: "NewsHub - Modern News Platform",
    description: "Stay informed with the latest news from around the world",
    url: "https://newshub.com",
    siteName: "NewsHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NewsHub - Modern News Platform",
    description: "Stay informed with the latest news from around the world",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
