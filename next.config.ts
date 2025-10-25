import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  typescript: {
    ignoreBuildErrors: false, // Enable type checking in production
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable linting in production
  },
  reactStrictMode: true, // Enable React strict mode for production
  
  // Output configuration for deployment
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: ['localhost', 'images.unsplash.com', 'via.placeholder.com'],
    unoptimized: false,
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Rewrites for API routing
  async rewrites() {
    // In production, all API routes are handled by Next.js
    // No need for backend proxy in production
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    
    // Development: proxy backend API calls
    return [
      { source: "/api/admin/:path*", destination: "/api/admin/:path*" },
      { source: "/api/brand-wire/:path*", destination: "/api/brand-wire/:path*" },
      { source: "/api/:path*", destination: "http://localhost:3001/api/:path*" },
    ];
  },
  
  // Redirects
  async redirects() {
    return [];
  },
};

export default nextConfig;
