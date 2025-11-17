"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Source {
  _id: string;
  name: string;
}

export function SourcesTicker() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await fetch('/api/sources');
        const data = await response.json();
        if (data.success && data.sources) {
          setSources(data.sources);
        }
      } catch (error) {
        console.error('Error fetching sources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSources();
  }, []);

  if (loading || sources.length === 0) {
    return null;
  }

  // Duplicate sources for seamless loop
  const duplicatedSources = [...sources, ...sources];

  return (
    <div className="w-full bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-y border-border/50 py-4 overflow-hidden">
      <div className="container mx-auto px-4 mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <svg 
              className="h-4 w-4 text-primary" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" 
              />
            </svg>
            <span>Our Trusted News Sources</span>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <motion.div
          className="flex gap-8 items-center"
          animate={{
            x: [0, -50 * sources.length],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: sources.length * 3,
              ease: "linear",
            },
          }}
        >
          {duplicatedSources.map((source, index) => (
            <div
              key={`${source._id}-${index}`}
              className="flex items-center gap-2 whitespace-nowrap px-4"
            >
              <div className="h-2 w-2 rounded-full bg-primary/60" />
              <span className="text-sm font-medium text-foreground/80">
                {source.name}
              </span>
            </div>
          ))}
        </motion.div>
        
        {/* Gradient overlays for smooth edge fade */}
        <div className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
