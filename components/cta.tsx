import { ArrowRight, PlayCircle } from 'lucide-react'

export function CTA() {
  return (
    <section id="contact" className="relative py-28 overflow-hidden">
      {/* Strong glow */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <div
          className="w-[800px] h-[400px] opacity-10 blur-3xl rounded-full"
          style={{ background: '#D4AF37' }}
        />
      </div>

      {/* Thin grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold-dim">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="text-xs font-medium text-gold tracking-wide">14-day free trial — no card needed</span>
        </div>

        {/* Headline */}
        <h2 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-foreground text-balance leading-[1.1]">
          Ready to transform how you run your academy?
        </h2>

        {/* Sub */}
        <p className="text-lg text-muted-foreground max-w-xl leading-relaxed text-pretty">
          Join over 500 music academies already saving time, reducing admin, and delivering a better experience for students and parents.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gold text-background font-semibold text-base shadow-gold hover:brightness-110 transition-all duration-200 active:scale-95"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="#demo"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-border text-foreground font-medium text-base hover:bg-accent transition-all duration-200 active:scale-95"
          >
            <PlayCircle className="w-5 h-5 text-muted-foreground" />
            Book a Demo
          </a>
        </div>

        {/* Trust line */}
        <p className="text-xs text-muted-foreground">
          No credit card required &bull; Setup in under 10 minutes &bull; Cancel anytime
        </p>
      </div>
    </section>
  )
}
