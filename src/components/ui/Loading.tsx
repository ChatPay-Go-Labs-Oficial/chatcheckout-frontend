'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  fullScreen?: boolean;
}

/**
 * Enterprise Ultra Loading Component
 * Features a branded logo, simulated progress bar, and smooth animations.
 */
export function Loading({ className, fullScreen = true }: LoadingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 90) return prevProgress;
        const diff = Math.random() * 15;
        return Math.min(prevProgress + diff, 90);
      });
    }, 400);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-background p-4 animate-in fade-in duration-500",
        fullScreen && "fixed inset-0 z-[100] min-h-screen w-screen",
        className
      )}
    >
      <div className="flex flex-col items-center max-w-[280px] w-full space-y-8">
        {/* Branded Logo with Pulse Animation */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse group-hover:bg-primary/30 transition-all duration-700" />
          <div className="relative flex aspect-square size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20 ring-1 ring-white/10 animate-in zoom-in-50 duration-500">
            <ShoppingCart className="size-8" />
          </div>
        </div>

        {/* Brand Name */}
        <div className="space-y-1.5 text-center px-4 animate-in slide-in-from-bottom-2 duration-700 delay-100">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            ChatCheckout
          </h2>
          <p className="text-[13px] text-muted-foreground font-medium">
            Preparando seu ambiente...
          </p>
        </div>

        {/* Progress Bar Area */}
        <div className="w-full space-y-3 px-2 pt-2 animate-in fade-in duration-1000 delay-300">
          <Progress value={progress} className="h-1.5 bg-muted/30 border border-muted/20" />
          <div className="flex justify-between items-center px-0.5">
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              Secure Cloud
            </span>
            <span className="text-[10px] font-mono text-muted-foreground/80 tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
      
      {/* Footer subtle hint */}
      <div className="absolute bottom-8 text-[11px] text-muted-foreground/40 font-medium tracking-wide animate-in fade-in duration-1000 delay-500">
        Enterprise Standard 2.0
      </div>
    </div>
  );
}
