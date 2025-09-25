'use client';

export default function RightShowcase() {
  return (
    <section className="hidden md:flex flex-1 relative overflow-hidden rounded-l-none rounded-r-3xl">
      {/* Fundo sutil */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/3 top-1/4 w-2/3 h-2/3 bg-gradient-to-br from-[#6f43d0]/30 via-[#181b4a]/80 to-transparent rounded-full blur-2xl opacity-40" />
        <div className="absolute right-0 bottom-0 w-1/2 h-1/2 bg-gradient-to-tr from-[#6fdcff]/20 via-[#23244a]/40 to-transparent rounded-full blur-xl opacity-30" />
      </div>

      <div className="m-auto w-full max-w-3xl px-8 sm:px-12 lg:px-16 flex flex-col gap-7">
        {/* Headline/descrição à esquerda */}
        <div className="text-left">
          <h2
            className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#6f43d0] via-[#6fdcff] to-white tracking-tight leading-[0.95]"
            style={{ fontSize: 'clamp(44px, 5.2vw, 72px)', letterSpacing: '-1px' }}
          >
            Checkout instantâneo,
            <br />
            sem fricção.
          </h2>
          <p className="mt-5 text-white/85 text-[15px] sm:text-base max-w-xl leading-relaxed">
            Venda sem barreiras. Seu cliente paga direto no chat, sem redirecionamento.{' '}
            <span className="text-[#6f43d0] font-semibold">Sua marca, seu fluxo, seu cliente.</span>
          </p>
        </div>

        <div className="pt-12 text-center">
          <span className="uppercase tracking-[0.18em] text-[11px] text-white/55">
            Perfeito para
          </span>
        </div>

        <div className="w-full">
          <div className="mx-auto flex flex-col items-center gap-6 max-w-[700px]">
            <div className="flex justify-center gap-7">
              <FeatureCard title="Criadores de produtos digitais" icon="sparkles" />
              <FeatureCard title="Lojas de e-commerce" icon="bag" />
            </div>
            <div className="flex justify-center gap-7">
              <FeatureCard title="Prestadores de serviço" icon="headset" />
              <FeatureCard title="Empresários" icon="growth" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Os ícones e FeatureCard podem ser importados de um arquivo compartilhado ou mantidos aqui:
type IconKey = 'sparkles' | 'bag' | 'headset' | 'growth';

function IconSparkles() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/95" fill="currentColor" aria-hidden>
      <path d="M12 2l1.6 3.7L17 7.3l-3.4 1.6L12 12l-1.6-3.1L7 7.3l3.4-1.6L12 2zm6 8l1 2.4 2.4 1L19 14.8 18 17.2l-1-2.4-2.4-1L17 12.4 18 10zM5 14l1.2 2.7L9 18l-2.8 1.3L5 22l-1.2-2.7L1 18l2.8-1.3L5 14z" />
    </svg>
  );
}
function IconBag() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/95" fill="currentColor" aria-hidden>
      <path d="M7 7V6a5 5 0 0 1 10 0v1h2a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V9a2 2 0 0 1 2-2h2Zm2 0h6V6a3 3 0 0 0-6 0v1Z" />
    </svg>
  );
}
function IconHeadset() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/95" fill="currentColor" aria-hidden>
      <path d="M12 4a8 8 0 0 0-8 8v4a3 3 0 0 0 3 3h2v-6H7a1 1 0 0 1-1-1v0a6 6 0 0 1 12 0v0a1 1 0 0 1-1 1h-2v6h2a3 3 0 0 0 3-3v-4a8 8 0 0 0-8-8Z" />
    </svg>
  );
}
function IconGrowth() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/95" fill="currentColor" aria-hidden>
      <path d="M4 19h16v2H2V3h2v16Zm2-2v-4h3v4H6Zm5 0v-7h3v7h-3Zm5 0v-10h3v10h-3Zm-7.5-8.5 2.4-2.4 2.2 2.2L19 5v2.8l-4.1 4.1-2.2-2.2-2.4 2.4-1.8-1.8Z" />
    </svg>
  );
}

function FeatureCard({ title, icon }: { title: string; icon: IconKey }) {
  const Icon =
    icon === 'sparkles'
      ? IconSparkles
      : icon === 'bag'
        ? IconBag
        : icon === 'headset'
          ? IconHeadset
          : IconGrowth;

  return (
    <div className="w-[300px]">
      <div className="rounded-2xl p-[1px] bg-[linear-gradient(135deg,rgba(111,67,208,.5),rgba(111,220,255,.25),transparent)]">
        <div className="h-14 rounded-2xl bg-[#0f1322]/90 border border-white/8 px-4 flex items-center gap-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02),0_10px_26px_rgba(0,0,0,.35)] hover:border-white/12 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02),0_14px_40px_rgba(0,0,0,.5)] transition-all duration-200">
          <div className="h-9 w-9 rounded-xl p-[2px] bg-gradient-to-br from-[#6f43d0] via-[#6f75ff] to-[#6fdcff] shadow-[0_4px_16px_rgba(111,220,255,.25)]">
            <div className="h-full w-full rounded-[10px] bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Icon />
            </div>
          </div>
          <div className="flex-1">
            <div
              className="text-[15px] font-semibold text-white tracking-tight leading-none"
              style={{ letterSpacing: '-0.2px' }}
            >
              {title}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
