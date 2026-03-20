'use client';

import { Sparkles, ShoppingBag, Headset, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShowcaseItemProps {
  label: string;
  icon: React.ReactNode;
}

function ShowcaseItem({ label, icon }: ShowcaseItemProps) {
  return (
    <div className="w-full">
      <div className="rounded-2xl p-[1px] bg-gradient-to-br from-white/20 via-white/5 to-transparent shadow-lg transition-all hover:scale-[1.02]">
        <div className="h-16 rounded-2xl bg-[#0f1322]/80 backdrop-blur-xl border border-white/10 px-5 flex items-center gap-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
          <div className="h-10 w-10 rounded-xl p-[2px] bg-gradient-to-br from-primary via-primary/80 to-accent shadow-[0_8px_16px_-4px_rgba(var(--primary),0.3)]">
            <div className="h-full w-full rounded-[10px] bg-[#0f1322]/40 backdrop-blur-sm flex items-center justify-center text-white">
              {icon}
            </div>
          </div>
          <div className="flex-1">
            <div
              className="text-[15px] font-bold text-white tracking-tight leading-none"
              style={{ letterSpacing: '-0.2px' }}
            >
              {label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthShowcase() {
  return (
    <div className="relative hidden bg-muted lg:block overflow-hidden h-full">
      {/* Premium Background with Depth - Using Design System Dark Palette */}
      <div className="absolute inset-0 bg-[#0a0b15]" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary/5 to-transparent z-10" />

      {/* Dynamic Animated Blobs - Intensified with Primary Color */}
      <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-primary/25 rounded-full blur-[120px] animate-pulse z-0" />
      <div
        className="absolute bottom-[-15%] left-[-10%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[140px] animate-pulse z-0"
        style={{ animationDelay: '3s' }}
      />

      {/* Content Container */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-16 text-center text-white">
        <div className="mb-8 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md inline-flex items-center gap-2">
          <div className="size-2 rounded-full bg-primary animate-ping shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
            Checkout Intelligence
          </span>
        </div>

        <h2 className="text-4xl lg:text-6xl font-extrabold tracking-[-0.04em] mb-7 leading-[1.05]">
          Checkout instantâneo, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">
            sem fricção.
          </span>
        </h2>

        <p className="text-lg text-white/70 max-w-lg leading-relaxed mb-14 font-medium font-sans">
          Venda sem barreiras. Seu cliente paga direto no chat, sem redirecionamento.
          <span className="text-primary font-bold block mt-1 brightness-110">
            Sua marca, seu fluxo, seu cliente.
          </span>
        </p>

        <div className="grid grid-cols-2 gap-5 w-full max-w-xl">
          <ShowcaseItem label="Digital Products" icon={<Sparkles className="size-5" />} />
          <ShowcaseItem label="E-commerce" icon={<ShoppingBag className="size-5" />} />
          <ShowcaseItem label="Services" icon={<Headset className="size-5" />} />
          <ShowcaseItem label="Business" icon={<TrendingUp className="size-5" />} />
        </div>

        <div className="mt-20 flex items-center gap-8 opacity-30">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-white" />
          <span className="text-[11px] font-bold uppercase tracking-widest">
            Powered by Stellar
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-white" />
        </div>
      </div>

      {/* Subtle Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}
      />
    </div>
  );
}
